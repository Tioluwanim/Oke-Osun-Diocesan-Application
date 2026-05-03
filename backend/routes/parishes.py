from fastapi import APIRouter, HTTPException, Depends

from middleware.auth import get_current_user, require_admin, require_clergy
from models.parish import CreateParishRequest, UpdateParishRequest, CreateParishNoticeRequest
from database import db
from utils.helpers import format_doc, utcnow, validate_object_id, sanitize_string

router = APIRouter()


@router.get("/")
async def get_parishes():
    parishes = await db.parishes.find().to_list(length=100)
    return {"parishes": [format_doc(p) for p in parishes]}


@router.get("/me")
async def get_my_parish(current_user: dict = Depends(get_current_user)):
    parish_name = current_user.get("parish")
    if not parish_name:
        raise HTTPException(status_code=404, detail="No parish assigned")
    parish = await db.parishes.find_one({"name": parish_name})
    if not parish:
        raise HTTPException(status_code=404, detail="Parish not found")
    return {"parish": format_doc(parish)}


@router.get("/me/members")
async def get_my_parish_members(current_user: dict = Depends(require_clergy)):
    parish_name = current_user.get("parish")
    if not parish_name:
        raise HTTPException(status_code=404, detail="No parish assigned")

    members = await db.users.find(
        {"parish": parish_name},
        {"password": 0, "inviteTokenHash": 0},
    ).sort("fullName", 1).to_list(length=500)
    return {"members": [format_doc(member) for member in members]}


@router.get("/me/notices")
async def get_my_parish_notices(current_user: dict = Depends(get_current_user)):
    parish_name = current_user.get("parish")
    if not parish_name:
        raise HTTPException(status_code=404, detail="No parish assigned")

    notices = await db.parish_notices.find({"parish": parish_name}).sort("createdAt", -1).to_list(length=100)
    return {"notices": [format_doc(notice) for notice in notices]}


@router.post("/me/notices")
async def create_my_parish_notice(
    request: CreateParishNoticeRequest,
    current_user: dict = Depends(require_clergy),
):
    parish_name = current_user.get("parish")
    if not parish_name:
        raise HTTPException(status_code=404, detail="No parish assigned")

    notice = {
        "title": sanitize_string(request.title),
        "body": sanitize_string(request.body),
        "priority": request.priority,
        "parish": parish_name,
        "createdBy": current_user["email"],
        "creatorName": current_user["fullName"],
        "createdAt": utcnow(),
        "updatedAt": utcnow(),
    }
    result = await db.parish_notices.insert_one(notice)
    notice["id"] = str(result.inserted_id)
    return {"message": "Notice posted successfully", "notice": notice}


@router.get("/{parish_id}")
async def get_parish(parish_id: str):
    oid = validate_object_id(parish_id, "Parish ID")
    parish = await db.parishes.find_one({"_id": oid})
    if not parish:
        raise HTTPException(status_code=404, detail="Parish not found")
    return {"parish": format_doc(parish)}


@router.post("/")
async def create_parish(
    request: CreateParishRequest,
    current_user: dict = Depends(require_admin)
):
    existing = await db.parishes.find_one({"name": request.name})
    if existing:
        raise HTTPException(status_code=400, detail="Parish with this name already exists")
    parish = request.model_dump()
    parish["name"]      = sanitize_string(parish["name"])
    parish["createdAt"] = utcnow()
    parish["createdBy"] = current_user["email"]
    result = await db.parishes.insert_one(parish)
    parish["id"] = str(result.inserted_id)
    parish.pop("_id", None)
    return {"message": "Parish created successfully", "parish": parish}


@router.patch("/{parish_id}")
async def update_parish(
    parish_id: str,
    request: UpdateParishRequest,
    current_user: dict = Depends(require_admin)
):
    oid = validate_object_id(parish_id, "Parish ID")
    existing = await db.parishes.find_one({"_id": oid})
    if not existing:
        raise HTTPException(status_code=404, detail="Parish not found")
    update_dict = {k: v for k, v in request.model_dump().items() if v is not None}
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")
    update_dict["updatedAt"] = utcnow()
    await db.parishes.update_one({"_id": oid}, {"$set": update_dict})
    updated = await db.parishes.find_one({"_id": oid})
    return {"message": "Parish updated successfully", "parish": format_doc(updated)}


@router.delete("/{parish_id}")
async def delete_parish(
    parish_id: str,
    current_user: dict = Depends(require_admin)
):
    oid = validate_object_id(parish_id, "Parish ID")
    existing = await db.parishes.find_one({"_id": oid})
    if not existing:
        raise HTTPException(status_code=404, detail="Parish not found")
    await db.parishes.delete_one({"_id": oid})
    return {"message": "Parish deleted successfully"}
