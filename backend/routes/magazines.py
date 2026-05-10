# routes/magazines.py
from fastapi import APIRouter, HTTPException, Depends, Query, Request
from middleware.auth import require_clergy
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
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    query = {}
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

@router.post("/")
async def create_magazine(request: Request, current_user: dict = Depends(require_clergy)):
    data, file = await parse_form_or_json(
        request,
        ["title", "category", "date", "pages", "description", "url"],
    )
    if not data.get("title") or not data.get("date"):
        raise HTTPException(status_code=400, detail="Title and date are required")
    if file:
        data["url"] = upload_file_to_gcs(file, "magazines")

    mag = {
        "title": sanitize_string(data["title"]),
        "category": data.get("category") or "Newsletter",
        "date": data["date"],
        "pages": parse_optional_int(data.get("pages")),
        "description": data.get("description"),
        "url": data.get("url"),
        "uploadedBy": current_user["email"],
        "uploaderName": current_user["fullName"],
        "isNew": True,
        "createdAt": utcnow(),
        "updatedAt": utcnow(),
    }
    result = await db.magazines.insert_one(mag)
    mag["id"] = str(result.inserted_id)
    mag.pop("_id", None)
    return {"message": "Magazine uploaded successfully", "magazine": mag}

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