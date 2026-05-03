import hashlib

from fastapi import APIRouter, HTTPException

from models.user import RegisterRequest, LoginRequest, CompleteInviteRequest
from database import db
from utils.security import hash_password, verify_password, create_token
from utils.helpers import format_doc, utcnow, validate_password_strength, sanitize_string

router = APIRouter()


@router.post("/register")
async def register(request: RegisterRequest):
    # ── Sanitize inputs ──
    request.fullName = sanitize_string(request.fullName)

    # ── Validate password strength ──
    validate_password_strength(request.password)

    # ── Check duplicate email ──
    existing = await db.users.find_one({"email": request.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    # ── Determine status ──
    status = "pending" if request.role == "clergy" else "active"

    # ── Build user document ──
    user = {
        "fullName":  request.fullName,
        "email":     request.email.lower(),
        "password":  hash_password(request.password),
        "role":      request.role,
        "status":    status,
        "parish":    request.parish,
        "phone":     None,
        "createdAt": utcnow(),
        "updatedAt": utcnow(),
    }

    result = await db.users.insert_one(user)
    user["id"] = str(result.inserted_id)
    user.pop("_id", None)
    user.pop("password", None)

    # ── Generate token for members only ──
    token = None
    if status == "active":
        token = create_token(user["email"], user["role"])

    return {
        "message": "Registration successful",
        "user":    user,
        "token":   token,
    }


@router.post("/login")
async def login(request: LoginRequest):
    user = await db.users.find_one({"email": request.email.lower()})

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.get("inviteAccepted", True):
        raise HTTPException(status_code=403, detail="This account invitation is pending setup")

    if not user.get("password") or not verify_password(request.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if user["status"] == "pending":
        raise HTTPException(status_code=403, detail="Your account is pending approval by the diocese administrator")

    if user["status"] == "inactive":
        raise HTTPException(status_code=403, detail="Your account has been suspended. Contact the diocese administrator")

    token = create_token(user["email"], user["role"])

    user_data = format_doc(user)
    user_data.pop("password", None)

    return {
        "message": "Login successful",
        "token":   token,
        "user":    user_data,
    }


@router.post("/complete-invite")
async def complete_invite(request: CompleteInviteRequest):
    validate_password_strength(request.password)

    token_hash = hashlib.sha256(request.invite_token.encode("utf-8")).hexdigest()
    user = await db.users.find_one({"inviteTokenHash": token_hash})

    if not user:
        raise HTTPException(status_code=404, detail="Invitation not found or has expired")

    expires_at = user.get("inviteExpiresAt")
    if expires_at and expires_at < utcnow():
        raise HTTPException(status_code=400, detail="Invitation has expired")

    hashed_password = hash_password(request.password)
    await db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "password": hashed_password,
                "inviteAccepted": True,
                "updatedAt": utcnow(),
            },
            "$unset": {
                "inviteTokenHash": "",
                "inviteExpiresAt": "",
                "inviteCreatedAt": "",
            },
        },
    )

    updated_user = await db.users.find_one({"_id": user["_id"]})
    token = create_token(updated_user["email"], updated_user["role"])
    user_data = format_doc(updated_user)
    user_data.pop("password", None)

    return {
        "message": "Invitation completed successfully",
        "token": token,
        "user": user_data,
    }
