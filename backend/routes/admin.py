import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, Depends, Query

from middleware.auth import require_admin
from models.user import InviteUserRequest
from database import db
from bson import ObjectId
from utils.helpers import format_doc, utcnow, validate_object_id, sanitize_string
from utils.audit import log_audit

router = APIRouter()


def _invite_expiry_iso(days: int = 7) -> str:
    return (datetime.now(timezone.utc) + timedelta(days=days)).isoformat()


# ── GET /admin/users — list all users with search + filter + pagination ──
@router.get("/users")
async def get_all_users(
    current_user: dict = Depends(require_admin),
    search: str = Query(None),
    role: str = Query(None),
    status: str = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
):
    query = {}
    if role:   query["role"]   = role
    if status: query["status"] = status
    if search:
        query["$or"] = [
            {"fullName": {"$regex": search, "$options": "i"}},
            {"email":    {"$regex": search, "$options": "i"}},
            {"parish":   {"$regex": search, "$options": "i"}},
        ]

    skip = (page - 1) * limit
    total = await db.users.count_documents(query)
    users = await db.users.find(query).skip(skip).limit(limit).to_list(length=limit)

    formatted = []
    for u in users:
        u = format_doc(u)
        u.pop("password", None)
        formatted.append(u)

    return {
        "users": formatted,
        "total": total,
        "page":  page,
        "pages": (total + limit - 1) // limit,
    }


@router.post("/users/invite")
async def invite_user(
    request: InviteUserRequest,
    current_user: dict = Depends(require_admin),
):
    existing = await db.users.find_one({"email": request.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    invite_token = secrets.token_urlsafe(24)
    invite_token_hash = hashlib.sha256(invite_token.encode("utf-8")).hexdigest()

    user = {
        "fullName": sanitize_string(request.fullName),
        "email": request.email.lower(),
        "password": None,
        "role": request.role,
        "status": "pending" if request.role == "clergy" else "active",
        "parish": sanitize_string(request.parish) if request.parish else None,
        "phone": sanitize_string(request.phone) if request.phone else None,
        "createdAt": utcnow(),
        "updatedAt": utcnow(),
        "inviteAccepted": False,
        "inviteTokenHash": invite_token_hash,
        "inviteCreatedAt": utcnow(),
        "inviteExpiresAt": _invite_expiry_iso(),
        "invitedBy": current_user["email"],
    }

    result = await db.users.insert_one(user)
    user["id"] = str(result.inserted_id)
    user.pop("_id", None)
    user.pop("password", None)
    user.pop("inviteTokenHash", None)

    await log_audit(
        admin_email=current_user["email"],
        admin_name=current_user["fullName"],
        action="INVITE_USER",
        target_id=user["id"],
        target_email=user["email"],
        details=f"Invited {user['fullName']} as {user['role']}",
    )

    return {
        "message": "User invited successfully",
        "user": user,
        "inviteToken": invite_token,
        "inviteExpiresAt": user["inviteExpiresAt"],
    }


# ── GET /admin/audit-logs ──
@router.get("/audit-logs")
async def get_audit_logs(
    current_user: dict = Depends(require_admin),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
):
    skip = (page - 1) * limit
    total = await db.audit_logs.count_documents({})
    logs = await db.audit_logs.find({}).sort("timestamp", -1).skip(skip).limit(limit).to_list(length=limit)
    return {
        "logs":  [format_doc(log) for log in logs],
        "total": total,
        "page":  page,
        "pages": (total + limit - 1) // limit,
    }


# ── PATCH /admin/users/{id}/approve ──
@router.patch("/users/{user_id}/approve")
async def approve_user(user_id: str, current_user: dict = Depends(require_admin)):
    oid = validate_object_id(user_id, "User ID")
    user = await db.users.find_one({"_id": oid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await db.users.update_one({"_id": oid}, {"$set": {"status": "active", "updatedAt": utcnow()}})
    await log_audit(
        admin_email=current_user["email"],
        admin_name=current_user["fullName"],
        action="APPROVE_USER",
        target_id=user_id,
        target_email=user["email"],
        details=f"Approved {user['fullName']}",
    )
    updated = format_doc(await db.users.find_one({"_id": oid}))
    updated.pop("password", None)
    return {"message": "User approved successfully", "user": updated}


# ── PATCH /admin/users/{id}/suspend ──
@router.patch("/users/{user_id}/suspend")
async def suspend_user(user_id: str, current_user: dict = Depends(require_admin)):
    oid = validate_object_id(user_id, "User ID")
    user = await db.users.find_one({"_id": oid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await db.users.update_one({"_id": oid}, {"$set": {"status": "inactive", "updatedAt": utcnow()}})
    await log_audit(
        admin_email=current_user["email"],
        admin_name=current_user["fullName"],
        action="SUSPEND_USER",
        target_id=user_id,
        target_email=user["email"],
        details=f"Suspended {user['fullName']}",
    )
    updated = format_doc(await db.users.find_one({"_id": oid}))
    updated.pop("password", None)
    return {"message": "User suspended successfully", "user": updated}


# ── PATCH /admin/users/{id}/role ──
@router.patch("/users/{user_id}/role")
async def change_user_role(user_id: str, body: dict, current_user: dict = Depends(require_admin)):
    new_role = body.get("role")
    if new_role not in ["member", "clergy", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role. Must be member, clergy, or admin")
    oid = validate_object_id(user_id, "User ID")
    user = await db.users.find_one({"_id": oid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    old_role = user["role"]
    await db.users.update_one({"_id": oid}, {"$set": {"role": new_role, "updatedAt": utcnow()}})
    await log_audit(
        admin_email=current_user["email"],
        admin_name=current_user["fullName"],
        action="CHANGE_ROLE",
        target_id=user_id,
        target_email=user["email"],
        details=f"Changed role from {old_role} to {new_role} for {user['fullName']}",
    )
    updated = format_doc(await db.users.find_one({"_id": oid}))
    updated.pop("password", None)
    return {"message": f"Role updated to {new_role}", "user": updated}


# ── DELETE /admin/users/{id} ──
@router.delete("/users/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(require_admin)):
    if str(current_user["_id"]) == user_id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account")
    oid = validate_object_id(user_id, "User ID")
    user = await db.users.find_one({"_id": oid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await db.users.delete_one({"_id": oid})
    await log_audit(
        admin_email=current_user["email"],
        admin_name=current_user["fullName"],
        action="DELETE_USER",
        target_id=user_id,
        target_email=user["email"],
        details=f"Deleted user {user['fullName']}",
    )
    return {"message": "User deleted successfully"}
