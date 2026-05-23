from fastapi import APIRouter, HTTPException, Depends
from middleware.auth import get_current_user
from models.user import UpdateProfileRequest, ChangePasswordRequest
from database import db
from utils.security import verify_password, hash_password
from utils.helpers import format_doc, utcnow, validate_password_strength, sanitize_string

router = APIRouter()


@router.get("/me")
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    user = format_doc(current_user)
    user.pop("password", None)
    user.pop("refreshTokens", None)
    return {"user": user}


@router.patch("/me")
async def update_profile(
    request: UpdateProfileRequest,
    current_user: dict = Depends(get_current_user)
):
    update_dict = {k: v for k, v in request.model_dump().items() if v is not None}
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")

    # ── Sanitize string fields ──
    if "fullName" in update_dict:
        update_dict["fullName"] = sanitize_string(update_dict["fullName"])
    if "parish" in update_dict:
        update_dict["parish"] = sanitize_string(update_dict["parish"])
    if "photoUrl" in update_dict:
        photo_url = update_dict["photoUrl"].strip()
        if photo_url and not photo_url.startswith(("https://", "http://localhost", "http://127.0.0.1")):
            raise HTTPException(status_code=400, detail="Profile photo URL must be a valid uploaded URL")
        update_dict["photoUrl"] = photo_url or None

    update_dict["updatedAt"] = utcnow()

    await db.users.update_one(
        {"email": current_user["email"]},
        {"$set": update_dict}
    )
    updated = await db.users.find_one({"email": current_user["email"]})
    updated = format_doc(updated)
    updated.pop("password", None)
    return {"message": "Profile updated successfully", "user": updated}


@router.patch("/me/password")
async def change_password(
    request: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user)
):
    user = await db.users.find_one({"email": current_user["email"]})

    if not verify_password(request.current_password, user["password"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    if request.current_password == request.new_password:
        raise HTTPException(status_code=400, detail="New password must be different from current password")

    # ── Validate new password strength ──
    validate_password_strength(request.new_password)

    hashed = hash_password(request.new_password)
    await db.users.update_one(
        {"email": current_user["email"]},
        {"$set": {"password": hashed, "updatedAt": utcnow()}}
    )
    return {"message": "Password updated successfully"}
