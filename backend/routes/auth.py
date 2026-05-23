import hashlib
import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from database import db
from models.user import RegisterRequest, LoginRequest, CompleteInviteRequest
from utils.helpers import format_doc, utcnow, validate_password_strength, sanitize_string
from utils.rate_limiter import limiter
from utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_token,
    get_refresh_token_lifetime,
)

logger = logging.getLogger(__name__)
router = APIRouter()
MAX_FAILED_LOGINS = 5
LOCKOUT_WINDOW = timedelta(minutes=15)


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class ApprovalStatusRequest(BaseModel):
    email: str


async def _store_refresh_token(user_id, refresh_token: str) -> None:
    payload = decode_token(refresh_token, expected_type="refresh")
    expires_at = (datetime.now(timezone.utc) + timedelta(days=get_refresh_token_lifetime())).isoformat()
    await db.users.update_one(
        {"_id": user_id},
        {
            "$push": {
                "refreshTokens": {
                    "hash": hash_token(refresh_token),
                    "jti": payload["jti"],
                    "expiresAt": expires_at,
                }
            }
        },
    )


async def _issue_tokens(user: dict):
    access_token = create_access_token(user["email"], user["role"])
    refresh_token = create_refresh_token(user["email"], user["role"])
    await _store_refresh_token(user["_id"], refresh_token)
    return access_token, refresh_token


@router.post("/register")
@limiter.limit("3/minute")
async def register(request: Request, body: RegisterRequest):
    body.fullName = sanitize_string(body.fullName)
    validate_password_strength(body.password)

    existing = await db.users.find_one({"email": body.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    status = "pending" if body.role == "clergy" else "active"
    user = {
        "fullName": body.fullName,
        "email": body.email.lower(),
        "password": hash_password(body.password),
        "role": body.role,
        "status": status,
        "parish": body.parish,
        "phone": None,
        "createdAt": utcnow(),
        "updatedAt": utcnow(),
        "refreshTokens": [],
    }

    result = await db.users.insert_one(user)
    user["id"] = str(result.inserted_id)
    user.pop("_id", None)
    user.pop("password", None)

    access_token = None
    refresh_token = None
    if status == "active":
        access_token, refresh_token = await _issue_tokens({"_id": result.inserted_id, "email": user["email"], "role": user["role"]})

    return {
        "message": "Registration successful",
        "user": user,
        "token": access_token,
        "accessToken": access_token,
        "refreshToken": refresh_token,
    }


@router.post("/login")
@limiter.limit("5/minute")
async def login(request: Request, body: LoginRequest):
    user = await db.users.find_one({"email": body.email.lower()})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    locked_until = user.get("lockedUntil")
    if locked_until:
        locked_dt = datetime.fromisoformat(locked_until)
        if locked_dt.tzinfo is None:
            locked_dt = locked_dt.replace(tzinfo=timezone.utc)
        if locked_dt > datetime.now(timezone.utc):
            raise HTTPException(status_code=423, detail="Too many failed attempts. Try again later")
    if not user.get("inviteAccepted", True):
        raise HTTPException(status_code=403, detail="This account invitation is pending setup")
    if not user.get("password") or not verify_password(body.password, user["password"]):
        failed_count = int(user.get("failedLoginAttempts", 0)) + 1
        update = {"failedLoginAttempts": failed_count, "lastFailedLoginAt": utcnow()}
        if failed_count >= MAX_FAILED_LOGINS:
            update["lockedUntil"] = (datetime.now(timezone.utc) + LOCKOUT_WINDOW).isoformat()
        await db.users.update_one({"_id": user["_id"]}, {"$set": update})
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if user["status"] == "pending":
        raise HTTPException(status_code=403, detail="Your account is pending approval by the diocese administrator")
    if user["status"] == "inactive":
        raise HTTPException(status_code=403, detail="Your account has been suspended. Contact the diocese administrator")

    access_token, refresh_token = await _issue_tokens(user)
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$unset": {"lockedUntil": "", "lastFailedLoginAt": ""}, "$set": {"failedLoginAttempts": 0}},
    )
    user_data = format_doc(user)
    user_data.pop("password", None)
    user_data.pop("refreshTokens", None)

    return {
        "message": "Login successful",
        "token": access_token,
        "accessToken": access_token,
        "refreshToken": refresh_token,
        "user": user_data,
    }


@router.post("/approval-status")
@limiter.limit("12/minute")
async def approval_status(request: Request, body: ApprovalStatusRequest):
    user = await db.users.find_one({"email": body.email.lower()}, {"status": 1, "role": 1, "email": 1})
    if not user:
        raise HTTPException(status_code=404, detail="Account not found")
    return {
        "email": user["email"],
        "role": user.get("role"),
        "status": user.get("status", "pending"),
        "approved": user.get("status") == "active",
    }


@router.post("/complete-invite")
@limiter.limit("5/minute")
async def complete_invite(request: Request, body: CompleteInviteRequest):
    invite_token_hash = hashlib.sha256(body.invite_token.encode("utf-8")).hexdigest()
    user = await db.users.find_one({"inviteTokenHash": invite_token_hash, "inviteAccepted": False})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or already used invite code")

    expires_at = user.get("inviteExpiresAt")
    if expires_at:
        expiry = datetime.fromisoformat(expires_at)
        if expiry.tzinfo is None:
            expiry = expiry.replace(tzinfo=timezone.utc)
        if expiry < datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="Invite code has expired")

    validate_password_strength(body.password)
    await db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "password": hash_password(body.password),
                "inviteAccepted": True,
                "updatedAt": utcnow(),
            },
            "$unset": {"inviteTokenHash": "", "inviteCreatedAt": "", "inviteExpiresAt": ""},
        },
    )
    updated = await db.users.find_one({"_id": user["_id"]})
    user_data = format_doc(updated)
    user_data.pop("password", None)
    user_data.pop("refreshTokens", None)

    access_token = None
    refresh_token = None
    if updated.get("status") == "active":
        access_token, refresh_token = await _issue_tokens(updated)

    return {
        "message": "Invite activated successfully",
        "user": user_data,
        "accessToken": access_token,
        "token": access_token,
        "refreshToken": refresh_token,
    }


@router.post("/refresh")
async def refresh(request: Request, body: RefreshTokenRequest):
    token_hash = hash_token(body.refresh_token)
    payload = decode_token(body.refresh_token, expected_type="refresh")
    user = await db.users.find_one({
        "email": payload["email"],
        "refreshTokens": {"$elemMatch": {"jti": payload["jti"], "hash": token_hash}},
    })
    if not user:
        logger.warning("Refresh token reuse or invalid refresh token", extra={"email": payload.get("email"), "jti": payload.get("jti")})
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
    if user["status"] == "inactive":
        raise HTTPException(status_code=403, detail="Account suspended. Contact diocese administrator")

    access_token = create_access_token(user["email"], user["role"])
    refresh_token = create_refresh_token(user["email"], user["role"])
    new_payload = decode_token(refresh_token, expected_type="refresh")
    await db.users.update_one(
        {"_id": user["_id"]},
        {
            "$pull": {"refreshTokens": {"jti": payload["jti"], "hash": token_hash}},
            "$push": {
                "refreshTokens": {
                    "hash": hash_token(refresh_token),
                    "jti": new_payload["jti"],
                    "expiresAt": (datetime.now(timezone.utc) + timedelta(days=get_refresh_token_lifetime())).isoformat(),
                }
            },
        },
    )

    user_data = format_doc(user)
    user_data.pop("password", None)
    user_data.pop("refreshTokens", None)

    return {
        "message": "Token refreshed successfully",
        "accessToken": access_token,
        "refreshToken": refresh_token,
        "user": user_data,
    }


@router.post("/logout")
async def logout(body: RefreshTokenRequest):
    token_hash = hash_token(body.refresh_token)
    await db.users.update_one(
        {"refreshTokens": {"$elemMatch": {"hash": token_hash}}},
        {"$pull": {"refreshTokens": {"hash": token_hash}}},
    )
    return {"message": "Logged out successfully"}
