"""
Diocese of Oke-Osun — Payment Gateway
======================================
Custom in-house payment processing that sits in front of Paystack.
Flow:
  1. Member initiates payment → POST /payments/initiate
     → Backend creates a pending transaction record
     → Returns Paystack authorization URL
  2. Member pays on Paystack checkout page
  3. Paystack webhooks back → POST /payments/webhook  (server-side, instant)
     → Backend verifies with Paystack API
     → Marks transaction confirmed
     → Church can see the money SAME DAY in the admin dashboard
  4. Member app polls → GET /payments/verify/:reference
     → Returns final status

No money passes through our server. We just orchestrate and record.
All records are visible to admins immediately on webhook confirmation.
"""

import hmac
import hashlib
import logging
import os
import uuid
from datetime import datetime, timezone
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, Header, HTTPException, Query, Request

from database import db
from middleware.auth import get_current_user, require_admin
from models.payment import InitiatePaymentRequest
from utils.helpers import format_doc, utcnow

router = APIRouter()
logger = logging.getLogger(__name__)

# ── Paystack credentials from environment ──
PAYSTACK_SECRET_KEY = os.getenv("PAYSTACK_SECRET_KEY", "")
PAYSTACK_PUBLIC_KEY = os.getenv("PAYSTACK_PUBLIC_KEY", "")
PAYSTACK_BASE = "https://api.paystack.co"


def _paystack_headers() -> dict:
    if not PAYSTACK_SECRET_KEY:
        raise HTTPException(status_code=503, detail="Payment gateway not configured")
    return {
        "Authorization": f"Bearer {PAYSTACK_SECRET_KEY}",
        "Content-Type": "application/json",
    }


def _naira_to_kobo(amount: float) -> int:
    """Paystack works in kobo (smallest unit). ₦100 = 10000 kobo."""
    return int(round(amount * 100))


# ─────────────────────────────────────────────
#  1. INITIATE — member taps Pay
# ─────────────────────────────────────────────
@router.post("/initiate")
async def initiate_payment(
    body: InitiatePaymentRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Creates a pending payment record, then gets a Paystack
    checkout URL. Returns the URL so the app can open it in a WebView.
    """
    reference = f"OKED-{uuid.uuid4().hex[:12].upper()}"

    # ── Store pending record immediately ──
    record = {
        "reference":   reference,
        "userId":      str(current_user["_id"]),
        "userEmail":   current_user["email"],
        "userName":    current_user.get("fullName", ""),
        "parish":      current_user.get("parish", ""),
        "amount":      body.amount,
        "type":        body.type,
        "description": (body.description or "").strip()[:300],
        "anonymous":   body.anonymous,
        "status":      "pending",   # pending → success | failed
        "channel":     None,        # card, bank_transfer, ussd, …
        "paidAt":      None,
        "createdAt":   utcnow(),
        "updatedAt":   utcnow(),
    }
    await db.payments.insert_one(record)

    # ── Ask Paystack for a checkout URL ──
    payload = {
        "email":     current_user["email"],
        "amount":    _naira_to_kobo(body.amount),
        "reference": reference,
        "currency":  "NGN",
        "metadata": {
            "diocese_type":        body.type,
            "diocese_description": body.description or "",
            "diocese_user_id":     str(current_user["_id"]),
            "diocese_parish":      current_user.get("parish", ""),
        },
        # Redirect back to the app after Paystack is done
        "callback_url": os.getenv("PAYSTACK_CALLBACK_URL", ""),
    }

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(
            f"{PAYSTACK_BASE}/transaction/initialize",
            json=payload,
            headers=_paystack_headers(),
        )

    if resp.status_code != 200:
        logger.error("Paystack init failed: %s", resp.text)
        raise HTTPException(status_code=502, detail="Payment gateway error. Please try again.")

    data = resp.json().get("data", {})
    checkout_url = data.get("authorization_url")

    # Persist the Paystack access code
    await db.payments.update_one(
        {"reference": reference},
        {"$set": {"accessCode": data.get("access_code"), "updatedAt": utcnow()}},
    )

    logger.info("Payment initiated: %s ₦%.2f (%s)", reference, body.amount, body.type)

    return {
        "reference":    reference,
        "checkout_url": checkout_url,
        "amount":       body.amount,
        "type":         body.type,
    }


# ─────────────────────────────────────────────
#  2. WEBHOOK — Paystack calls this instantly
#     after the member pays (server-to-server)
# ─────────────────────────────────────────────
@router.post("/webhook")
async def paystack_webhook(request: Request):
    """
    Paystack sends this the moment a payment succeeds or fails.
    We verify the signature, update the record, and the admin
    dashboard shows the money in real time.

    IMPORTANT: This endpoint must be public (no auth header).
    Add PAYSTACK_WEBHOOK_SECRET to your .env and whitelist
    this URL in your Paystack dashboard → Settings → Webhooks.
    """
    raw_body = await request.body()
    signature = request.headers.get("x-paystack-signature", "")

    webhook_secret = os.getenv("PAYSTACK_WEBHOOK_SECRET", PAYSTACK_SECRET_KEY)
    expected = hmac.new(
        webhook_secret.encode("utf-8"),
        raw_body,
        hashlib.sha512,
    ).hexdigest()

    if not hmac.compare_digest(expected, signature):
        logger.warning("Webhook signature mismatch — possible spoofing attempt")
        raise HTTPException(status_code=400, detail="Invalid signature")

    import json
    event = json.loads(raw_body)
    event_type = event.get("event")
    data = event.get("data", {})
    reference = data.get("reference")

    if not reference:
        return {"status": "ignored"}

    if event_type == "charge.success":
        amount_kobo = data.get("amount", 0)
        amount_naira = amount_kobo / 100

        paid_at_str = data.get("paid_at") or data.get("createdAt")
        try:
            paid_at = datetime.fromisoformat(paid_at_str.replace("Z", "+00:00")) if paid_at_str else utcnow()
        except Exception:
            paid_at = utcnow()

        await db.payments.update_one(
            {"reference": reference},
            {
                "$set": {
                    "status":    "success",
                    "amount":    amount_naira,           # Use confirmed amount from Paystack
                    "channel":   data.get("channel"),
                    "paidAt":    paid_at,
                    "paystackId": data.get("id"),
                    "updatedAt": utcnow(),
                }
            },
        )
        logger.info("✅ Payment confirmed via webhook: %s ₦%.2f", reference, amount_naira)

    elif event_type in ("charge.failed", "transfer.failed"):
        await db.payments.update_one(
            {"reference": reference},
            {"$set": {"status": "failed", "updatedAt": utcnow()}},
        )
        logger.info("❌ Payment failed via webhook: %s", reference)

    return {"status": "ok"}


# ─────────────────────────────────────────────
#  3. VERIFY — app polls after redirect
# ─────────────────────────────────────────────
@router.get("/verify/{reference}")
async def verify_payment(
    reference: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Called by the app after the Paystack WebView returns.
    First checks our DB (webhook may have already updated it),
    then falls back to a direct Paystack API call.
    """
    record = await db.payments.find_one({"reference": reference})
    if not record:
        raise HTTPException(status_code=404, detail="Payment reference not found")

    # Security: only the owner or admin can verify
    if str(record["userId"]) != str(current_user["_id"]) and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorised")

    # If webhook already confirmed it, return immediately
    if record["status"] in ("success", "failed"):
        doc = format_doc(record)
        doc.pop("paystackId", None)
        return {"payment": doc}

    # Fallback: ask Paystack directly
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(
            f"{PAYSTACK_BASE}/transaction/verify/{reference}",
            headers=_paystack_headers(),
        )

    if resp.status_code != 200:
        return {"payment": format_doc(record)}  # Return pending

    ps_data = resp.json().get("data", {})
    ps_status = ps_data.get("status")

    if ps_status == "success":
        amount_naira = ps_data.get("amount", 0) / 100
        paid_at_str = ps_data.get("paid_at")
        try:
            paid_at = datetime.fromisoformat(paid_at_str.replace("Z", "+00:00")) if paid_at_str else utcnow()
        except Exception:
            paid_at = utcnow()

        await db.payments.update_one(
            {"reference": reference},
            {
                "$set": {
                    "status":  "success",
                    "amount":  amount_naira,
                    "channel": ps_data.get("channel"),
                    "paidAt":  paid_at,
                    "updatedAt": utcnow(),
                }
            },
        )
        record["status"] = "success"
        record["amount"] = amount_naira
        record["paidAt"] = paid_at

    elif ps_status == "failed":
        await db.payments.update_one(
            {"reference": reference},
            {"$set": {"status": "failed", "updatedAt": utcnow()}},
        )
        record["status"] = "failed"

    doc = format_doc(record)
    doc.pop("paystackId", None)
    return {"payment": doc}


# ─────────────────────────────────────────────
#  4. MEMBER — own payment history
# ─────────────────────────────────────────────
@router.get("/my")
async def my_payments(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    current_user: dict = Depends(get_current_user),
):
    query = {"userId": str(current_user["_id"])}
    skip = (page - 1) * limit
    total = await db.payments.count_documents(query)
    payments = (
        await db.payments.find(query)
        .sort("createdAt", -1)
        .skip(skip)
        .limit(limit)
        .to_list(length=limit)
    )
    docs = []
    for p in payments:
        d = format_doc(p)
        d.pop("paystackId", None)
        docs.append(d)

    # Summary stats
    pipeline = [
        {"$match": {"userId": str(current_user["_id"]), "status": "success"}},
        {"$group": {"_id": "$type", "total": {"$sum": "$amount"}, "count": {"$sum": 1}}},
    ]
    breakdown = await db.payments.aggregate(pipeline).to_list(length=20)

    return {
        "payments":  docs,
        "total":     total,
        "page":      page,
        "pages":     (total + limit - 1) // limit,
        "breakdown": breakdown,
    }


# ─────────────────────────────────────────────
#  5. ADMIN — full dashboard & analytics
# ─────────────────────────────────────────────
@router.get("/admin/all")
async def admin_all_payments(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
    parish: Optional[str] = Query(None),
    _: dict = Depends(require_admin),
):
    query: dict = {}
    if type:   query["type"]   = type
    if status: query["status"] = status
    if parish: query["parish"] = parish

    if from_date or to_date:
        date_filter: dict = {}
        if from_date:
            try:
                date_filter["$gte"] = datetime.fromisoformat(from_date).replace(tzinfo=timezone.utc)
            except ValueError:
                pass
        if to_date:
            try:
                date_filter["$lte"] = datetime.fromisoformat(to_date).replace(tzinfo=timezone.utc)
            except ValueError:
                pass
        if date_filter:
            query["createdAt"] = date_filter

    skip = (page - 1) * limit
    total = await db.payments.count_documents(query)
    payments = (
        await db.payments.find(query)
        .sort("createdAt", -1)
        .skip(skip)
        .limit(limit)
        .to_list(length=limit)
    )

    # Mask anonymous givers
    docs = []
    for p in payments:
        d = format_doc(p)
        d.pop("paystackId", None)
        if d.get("anonymous"):
            d["userName"]  = "Anonymous"
            d["userEmail"] = "—"
        docs.append(d)

    # Aggregated summary (success only)
    summary_pipeline = [
        {"$match": {**query, "status": "success"}},
        {
            "$group": {
                "_id":         None,
                "totalAmount": {"$sum": "$amount"},
                "totalCount":  {"$sum": 1},
            }
        },
    ]
    summary_result = await db.payments.aggregate(summary_pipeline).to_list(length=1)
    summary = summary_result[0] if summary_result else {"totalAmount": 0, "totalCount": 0}

    # Breakdown by type (success only)
    type_pipeline = [
        {"$match": {**query, "status": "success"}},
        {"$group": {"_id": "$type", "amount": {"$sum": "$amount"}, "count": {"$sum": 1}}},
        {"$sort": {"amount": -1}},
    ]
    by_type = await db.payments.aggregate(type_pipeline).to_list(length=20)

    # Daily trend (last 30 days, success only)
    trend_pipeline = [
        {"$match": {"status": "success", "paidAt": {"$exists": True, "$ne": None}}},
        {
            "$group": {
                "_id": {
                    "year":  {"$year": "$paidAt"},
                    "month": {"$month": "$paidAt"},
                    "day":   {"$dayOfMonth": "$paidAt"},
                },
                "amount": {"$sum": "$amount"},
                "count":  {"$sum": 1},
            }
        },
        {"$sort": {"_id.year": -1, "_id.month": -1, "_id.day": -1}},
        {"$limit": 30},
    ]
    daily_trend = await db.payments.aggregate(trend_pipeline).to_list(length=30)

    return {
        "payments":    docs,
        "total":       total,
        "page":        page,
        "pages":       (total + limit - 1) // limit,
        "summary":     {
            "totalAmount": summary.get("totalAmount", 0),
            "totalCount":  summary.get("totalCount", 0),
        },
        "by_type":     [{"type": r["_id"], "amount": r["amount"], "count": r["count"]} for r in by_type],
        "daily_trend": daily_trend,
    }