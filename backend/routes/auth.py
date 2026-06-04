import hashlib
import logging
import os
import secrets
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
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


# ──────────────────────────────────────────────────────────────
#  FORGOT PASSWORD — 3-step flow
#  Step 1: POST /auth/forgot-password        → send OTP email
#  Step 2: POST /auth/verify-reset-otp       → verify OTP, get temp token
#  Step 3: POST /auth/reset-password         → set new password
# ──────────────────────────────────────────────────────────────



class ForgotPasswordRequest(BaseModel):
    email: str


class VerifyOtpRequest(BaseModel):
    email: str
    otp: str


class ResetPasswordRequest(BaseModel):
    email: str
    reset_token: str
    new_password: str


def _send_reset_email(to_email: str, otp: str, full_name: str) -> bool:
    """Send OTP via SMTP. Returns True on success, False on failure."""
    smtp_host     = os.getenv("SMTP_HOST", "")
    smtp_port     = int(os.getenv("SMTP_PORT", "587"))
    smtp_user     = os.getenv("SMTP_USER", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")
    from_email    = os.getenv("SMTP_FROM_EMAIL", smtp_user)
    from_name     = os.getenv("SMTP_FROM_NAME", "Diocese of Oke-Osun")

    # If SMTP is not configured, allow controlled logging in non-production
    # or when explicitly forced by `FORCE_LOG_OTP` env var.
    if not all([smtp_host, smtp_user, smtp_password]):
        force_log = os.getenv("FORCE_LOG_OTP", "").lower() in ("1", "true", "yes")
        if force_log:
            logger.warning("FORCE_LOG_OTP enabled — OTP for %s is: %s", to_email, otp)
        else:
            env = os.getenv("ENVIRONMENT", "production").lower()
            if env != "production":
                # In development/staging, log the OTP so developers can test flows without SMTP.
                logger.warning("SMTP not configured — OTP for %s is: %s", to_email, otp)
            else:
                # In production do not log OTP values to avoid accidental leakage.
                logger.error("SMTP not configured in production — cannot send OTP to %s", to_email)
        return False

    html = f"""
    <html><body style="font-family:Georgia,serif;background:#0A0C10;color:#E8E4D8;padding:32px;">
      <div style="max-width:480px;margin:0 auto;background:#111318;border:1px solid rgba(201,168,76,0.2);border-radius:16px;padding:32px;">
        <img src="https://storage.googleapis.com/oke-osun-assets/logo.png" width="72" height="72"
             style="display:block;margin:0 auto 24px;border-radius:50%;" alt="Diocese of Oke-Osun"/>
        <h2 style="color:#C9A84C;text-align:center;margin-bottom:8px;">Password Reset</h2>
        <p style="color:#9E9A8E;text-align:center;margin-bottom:28px;">Diocese of Oke-Osun</p>
        <p>Dear {full_name},</p>
        <p>We received a request to reset your password. Use the code below — it expires in <strong>15 minutes</strong>.</p>
        <div style="background:#1B2030;border:1px solid rgba(201,168,76,0.3);border-radius:12px;
                    padding:24px;text-align:center;margin:24px 0;">
          <span style="font-size:36px;font-weight:900;letter-spacing:10px;color:#C9A84C;">{otp}</span>
        </div>
        <p style="color:#7A7568;font-size:13px;">If you did not request a password reset, you can safely ignore this email.
        Your account is secure.</p>
        <hr style="border:none;border-top:1px solid rgba(201,168,76,0.15);margin:24px 0;"/>
        <p style="color:#7A7568;font-size:12px;text-align:center;">Diocese of Oke-Osun · Anglican Communion</p>
      </div>
    </body></html>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Your Diocese Password Reset Code"
    msg["From"]    = f"{from_name} <{from_email}>"
    msg["To"]      = to_email
    msg.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
            server.ehlo()
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.sendmail(from_email, [to_email], msg.as_string())
        logger.info("Reset OTP email sent to %s", to_email)
        return True
    except Exception as exc:
        logger.error("Failed to send reset email to %s: %s", to_email, exc)
        return False


@router.post("/forgot-password")
@limiter.limit("3/minute")
async def forgot_password(request: Request, body: ForgotPasswordRequest):
    """
    Step 1 — Request a password reset OTP.
    Always returns 200 to prevent email enumeration.
    """
    user = await db.users.find_one({"email": body.email.strip().lower()})
    if user:
        otp         = str(secrets.randbelow(900000) + 100000)   # 6-digit OTP
        otp_hash    = hashlib.sha256(otp.encode()).hexdigest()
        expires_at  = (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()

        await db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {
                "passwordResetOtpHash":    otp_hash,
                "passwordResetExpiresAt":  expires_at,
                "passwordResetAttempts":   0,
                "updatedAt": utcnow(),
            }},
        )
        _send_reset_email(user["email"], otp, user.get("fullName", "Beloved"))

    return {"message": "If this email is registered, a reset code has been sent."}


@router.post("/verify-reset-otp")
@limiter.limit("5/minute")
async def verify_reset_otp(request: Request, body: VerifyOtpRequest):
    """
    Step 2 — Verify the 6-digit OTP.
    Returns a short-lived reset_token (valid 10 min) to authorise the password change.
    """
    email = body.email.strip().lower()
    user  = await db.users.find_one({"email": email})

    if not user or not user.get("passwordResetOtpHash"):
        raise HTTPException(status_code=400, detail="Invalid or expired reset code")

    # Lockout after 5 wrong attempts
    if user.get("passwordResetAttempts", 0) >= 5:
        raise HTTPException(status_code=429, detail="Too many attempts. Please request a new code.")

    # Check expiry
    expires_at = user.get("passwordResetExpiresAt")
    if expires_at:
        exp = datetime.fromisoformat(expires_at)
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        if datetime.now(timezone.utc) > exp:
            raise HTTPException(status_code=400, detail="Reset code has expired. Please request a new one.")

    # Verify OTP
    submitted_hash = hashlib.sha256(body.otp.strip().encode()).hexdigest()
    if submitted_hash != user["passwordResetOtpHash"]:
        await db.users.update_one(
            {"_id": user["_id"]},
            {"$inc": {"passwordResetAttempts": 1}},
        )
        raise HTTPException(status_code=400, detail="Incorrect reset code")

    # OTP verified — issue a one-time reset token (10 min)
    reset_token        = secrets.token_urlsafe(32)
    reset_token_hash   = hashlib.sha256(reset_token.encode()).hexdigest()
    reset_token_expiry = (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat()

    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "passwordResetTokenHash":   reset_token_hash,
            "passwordResetTokenExpiry": reset_token_expiry,
            "passwordResetAttempts":    0,
        },
         "$unset": {
            "passwordResetOtpHash":   "",
            "passwordResetExpiresAt": "",
        }},
    )

    return {"message": "Code verified", "reset_token": reset_token}


@router.post("/reset-password")
@limiter.limit("5/minute")
async def reset_password(request: Request, body: ResetPasswordRequest):
    """
    Step 3 — Set the new password using the reset_token from Step 2.
    Invalidates all existing refresh tokens (forces re-login everywhere).
    """
    email = body.email.strip().lower()
    user  = await db.users.find_one({"email": email})

    if not user or not user.get("passwordResetTokenHash"):
        raise HTTPException(status_code=400, detail="Invalid or expired reset session. Please start again.")

    # Check reset token expiry
    expiry = user.get("passwordResetTokenExpiry")
    if expiry:
        exp = datetime.fromisoformat(expiry)
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        if datetime.now(timezone.utc) > exp:
            raise HTTPException(status_code=400, detail="Reset session expired. Please start again.")

    # Verify reset token
    submitted_hash = hashlib.sha256(body.reset_token.encode()).hexdigest()
    if submitted_hash != user["passwordResetTokenHash"]:
        raise HTTPException(status_code=400, detail="Invalid reset session")

    # Validate new password strength
    validate_password_strength(body.new_password)

    # Update password + wipe all reset fields + invalidate all refresh tokens
    await db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "password":  hash_password(body.new_password),
                "updatedAt": utcnow(),
                "refreshTokens": [],             # force re-login on all devices
            },
            "$unset": {
                "passwordResetTokenHash":   "",
                "passwordResetTokenExpiry": "",
                "passwordResetAttempts":    "",
                "passwordResetOtpHash":     "",
                "passwordResetExpiresAt":   "",
            },
        },
    )

    logger.info("Password successfully reset for %s", email)
    return {"message": "Password reset successfully. Please sign in with your new password."}


@router.get("/smtp-health")
async def smtp_health():
    """Lightweight SMTP health check.
    Returns JSON indicating whether SMTP is configured and whether a test connection can be established.
    """
    smtp_host     = os.getenv("SMTP_HOST", "").strip()
    smtp_port     = int(os.getenv("SMTP_PORT", "587"))
    smtp_user     = os.getenv("SMTP_USER", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")

    if not smtp_host:
        return {"smtp_configured": False, "can_connect": False}

    try:
        with smtplib.SMTP(smtp_host, smtp_port, timeout=5) as server:
            server.ehlo()
            try:
                server.starttls()
            except Exception:
                # Some SMTP providers on local dev may not support starttls; ignore.
                pass
            if smtp_user and smtp_password:
                server.login(smtp_user, smtp_password)
        return {"smtp_configured": True, "can_connect": True}
    except Exception as exc:
        logger.warning("SMTP health check failed: %s", exc)
        return {"smtp_configured": True, "can_connect": False, "error": str(exc)}