from fastapi import APIRouter, HTTPException, Depends, Query
from middleware.auth import require_clergy
from models.sermon import CreateSermonRequest, UpdateSermonRequest
from database import db
from utils.helpers import format_doc, utcnow, validate_object_id, sanitize_string

router = APIRouter()


@router.get("/")
async def get_sermons(
    search: str = Query(None),
    types: str = Query(None),
    series: str = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    query = {}
    if types:   query["type"]   = types
    if series: query["series"] = series
    if search:
        query["$or"] = [
            {"title":     {"$regex": search, "$options": "i"}},
            {"preacher":  {"$regex": search, "$options": "i"}},
            {"scripture": {"$regex": search, "$options": "i"}},
            {"series":    {"$regex": search, "$options": "i"}},
        ]
    skip = (page - 1) * limit
    total = await db.sermons.count_documents(query)
    sermons = await db.sermons.find(query).sort("createdAt", -1).skip(skip).limit(limit).to_list(length=limit)
    return {
        "sermons": [format_doc(s) for s in sermons],
        "total":   total,
        "page":    page,
        "pages":   (total + limit - 1) // limit,
    }


@router.get("/{sermon_id}")
async def get_sermon(sermon_id: str):
    oid = validate_object_id(sermon_id, "Sermon ID")
    sermon = await db.sermons.find_one({"_id": oid})
    if not sermon:
        raise HTTPException(status_code=404, detail="Sermon not found")
    await db.sermons.update_one({"_id": oid}, {"$inc": {"views": 1}})
    sermon["views"] = sermon.get("views", 0) + 1
    return {"sermon": format_doc(sermon)}


@router.post("/")
async def create_sermon(
    request: CreateSermonRequest,
    current_user: dict = Depends(require_clergy)
):
    sermon = request.model_dump()
    sermon["title"]        = sanitize_string(sermon["title"])
    sermon["preacher"]     = sanitize_string(sermon["preacher"])
    sermon["description"]  = sanitize_string(sermon.get("description", "") or "")
    sermon["uploadedBy"]   = current_user["email"]
    sermon["uploaderName"] = current_user["fullName"]
    sermon["views"]        = 0
    sermon["createdAt"]    = utcnow()
    sermon["updatedAt"]    = utcnow()
    result = await db.sermons.insert_one(sermon)
    sermon["id"] = str(result.inserted_id)
    sermon.pop("_id", None)
    return {"message": "Sermon uploaded successfully", "sermon": sermon}


@router.patch("/{sermon_id}")
async def update_sermon(
    sermon_id: str,
    request: UpdateSermonRequest,
    current_user: dict = Depends(require_clergy)
):
    oid = validate_object_id(sermon_id, "Sermon ID")
    existing = await db.sermons.find_one({"_id": oid})
    if not existing:
        raise HTTPException(status_code=404, detail="Sermon not found")
    if existing["uploadedBy"] != current_user["email"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="You can only edit your own sermons")
    update_dict = {k: v for k, v in request.model_dump().items() if v is not None}
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")
    update_dict["updatedAt"] = utcnow()
    await db.sermons.update_one({"_id": oid}, {"$set": update_dict})
    updated = await db.sermons.find_one({"_id": oid})
    return {"message": "Sermon updated successfully", "sermon": format_doc(updated)}


@router.delete("/{sermon_id}")
async def delete_sermon(
    sermon_id: str,
    current_user: dict = Depends(require_clergy)
):
    oid = validate_object_id(sermon_id, "Sermon ID")
    existing = await db.sermons.find_one({"_id": oid})
    if not existing:
        raise HTTPException(status_code=404, detail="Sermon not found")
    if existing["uploadedBy"] != current_user["email"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="You can only delete your own sermons")
    await db.sermons.delete_one({"_id": oid})
    return {"message": "Sermon deleted successfully"}