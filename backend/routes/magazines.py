# routes/magazines.py
from fastapi import APIRouter, HTTPException, Depends, Query, Request
from middleware.auth import require_clergy, require_authenticated
from models.magazine import UpdateMagazineRequest
from database import db
from utils.helpers import format_doc, utcnow, validate_object_id, sanitize_string
from utils.gcs import upload_file_to_gcs
from utils.upload_helpers import parse_form_or_json, parse_optional_int

router = APIRouter()

@router.get("/")
async def get_magazines(
    search: str = Query(None),
    category: str = Query(None),
    status: str = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    query: dict = {"status": "published"}   # members only see published
    if status:
        query["status"] = status            # admin can pass ?status=pending to see queue
    if category: query["category"] = category
    if search:
        query["$or"] = [
            {"title":       {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
        ]
    skip = (page - 1) * limit
    total = await db.magazines.count_documents(query)
    mags = await db.magazines.find(query).sort("createdAt", -1).skip(skip).limit(limit).to_list(length=limit)
    return {"magazines": [format_doc(m) for m in mags], "total": total, "page": page, "pages": (total + limit - 1) // limit}


@router.patch("/{mag_id}/approve")
async def approve_magazine(mag_id: str, current_user: dict = Depends(require_clergy)):
    if current_user["role"] not in ("clergy", "admin"):
        raise HTTPException(status_code=403, detail="Only clergy or admin can approve magazines")
    oid = validate_object_id(mag_id, "Magazine ID")
    existing = await db.magazines.find_one({"_id": oid})
    if not existing:
        raise HTTPException(status_code=404, detail="Magazine not found")
    await db.magazines.update_one({"_id": oid}, {"$set": {"status": "published", "updatedAt": utcnow()}})
    updated = await db.magazines.find_one({"_id": oid})
    return {"message": "Magazine approved and published", "magazine": format_doc(updated)}


@router.patch("/{mag_id}/reject")
async def reject_magazine(mag_id: str, current_user: dict = Depends(require_clergy)):
    if current_user["role"] not in ("clergy", "admin"):
        raise HTTPException(status_code=403, detail="Only clergy or admin can reject magazines")
    oid = validate_object_id(mag_id, "Magazine ID")
    existing = await db.magazines.find_one({"_id": oid})
    if not existing:
        raise HTTPException(status_code=404, detail="Magazine not found")
    await db.magazines.update_one({"_id": oid}, {"$set": {"status": "rejected", "updatedAt": utcnow()}})
    updated = await db.magazines.find_one({"_id": oid})
    return {"message": "Magazine rejected", "magazine": format_doc(updated)}

@router.post("/")
async def create_magazine(request: Request, current_user: dict = Depends(require_authenticated)):
    data, file = await parse_form_or_json(
        request,
        ["title", "category", "date", "pages", "description", "url"],
    )
    if not data.get("title") or not data.get("date"):
        raise HTTPException(status_code=400, detail="Title and date are required")
    if file:
        data["url"] = upload_file_to_gcs(file, "magazines")

    # Members submit for approval; clergy and admin publish directly
    is_privileged = current_user["role"] in ("clergy", "admin")
    status = "published" if is_privileged else "pending"

    mag = {
        "title": sanitize_string(data["title"]),
        "category": data.get("category") or "Newsletter",
        "date": data["date"],
        "pages": parse_optional_int(data.get("pages")),
        "description": data.get("description"),
        "url": data.get("url"),
        "uploadedBy": current_user["email"],
        "uploaderName": current_user["fullName"],
        "uploaderRole": current_user["role"],
        "status": status,
        "isNew": True,
        "createdAt": utcnow(),
        "updatedAt": utcnow(),
    }
    result = await db.magazines.insert_one(mag)
    mag["id"] = str(result.inserted_id)
    mag.pop("_id", None)
    return {"message": "Magazine uploaded successfully" if is_privileged else "Magazine submitted for review", "magazine": mag}

@router.patch("/{mag_id}")
async def update_magazine(mag_id: str, request: UpdateMagazineRequest, current_user: dict = Depends(require_clergy)):
    oid = validate_object_id(mag_id, "Magazine ID")
    existing = await db.magazines.find_one({"_id": oid})
    if not existing:
        raise HTTPException(status_code=404, detail="Magazine not found")
    if existing["uploadedBy"] != current_user["email"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="You can only edit your own uploads")
    update_dict = {k: v for k, v in request.model_dump().items() if v is not None}
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")
    update_dict["updatedAt"] = utcnow()
    await db.magazines.update_one({"_id": oid}, {"$set": update_dict})
    updated = await db.magazines.find_one({"_id": oid})
    return {"message": "Magazine updated", "magazine": format_doc(updated)}

@router.delete("/{mag_id}")
async def delete_magazine(mag_id: str, current_user: dict = Depends(require_clergy)):
    oid = validate_object_id(mag_id, "Magazine ID")
    existing = await db.magazines.find_one({"_id": oid})
    if not existing:
        raise HTTPException(status_code=404, detail="Magazine not found")
    if existing["uploadedBy"] != current_user["email"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="You can only delete your own uploads")
    await db.magazines.delete_one({"_id": oid})
    return {"message": "Magazine deleted successfully"}