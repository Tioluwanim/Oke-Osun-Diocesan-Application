from fastapi import APIRouter, HTTPException, Depends, Query
from middleware.auth import require_clergy
from models.bible_study import CreateBibleStudyRequest, UpdateBibleStudyRequest
from database import db
from utils.helpers import format_doc, utcnow, validate_object_id, sanitize_string

router = APIRouter()

@router.get("/")
async def get_bible_studies(
    search: str = Query(None),
    level: str = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    query = {}
    if level: query["level"] = level
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"book":  {"$regex": search, "$options": "i"}},
        ]
    skip = (page - 1) * limit
    total = await db.bible_studies.count_documents(query)
    studies = await db.bible_studies.find(query).sort("createdAt", -1).skip(skip).limit(limit).to_list(length=limit)
    return {
        "bible_studies": [format_doc(s) for s in studies],
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit,
    }

@router.get("/{study_id}")
async def get_bible_study(study_id: str):
    oid = validate_object_id(study_id, "Bible Study ID")
    study = await db.bible_studies.find_one({"_id": oid})
    if not study:
        raise HTTPException(status_code=404, detail="Bible study not found")
    return {"bible_study": format_doc(study)}

@router.post("/")
async def create_bible_study(
    request: CreateBibleStudyRequest,
    current_user: dict = Depends(require_clergy)
):
    study = request.model_dump()
    study["title"]        = sanitize_string(study["title"])
    study["uploadedBy"]   = current_user["email"]
    study["uploaderName"] = current_user["fullName"]
    study["isNew"]        = True
    study["createdAt"]    = utcnow()
    study["updatedAt"]    = utcnow()
    # convert lessonItems to plain dicts
    if study.get("lessonItems"):
        study["lessonItems"] = [
            item if isinstance(item, dict) else item.dict()
            for item in study["lessonItems"]
        ]
    result = await db.bible_studies.insert_one(study)
    study["id"] = str(result.inserted_id)
    study.pop("_id", None)
    return {"message": "Bible study created successfully", "bible_study": study}

@router.patch("/{study_id}")
async def update_bible_study(
    study_id: str,
    request: UpdateBibleStudyRequest,
    current_user: dict = Depends(require_clergy)
):
    oid = validate_object_id(study_id, "Bible Study ID")
    existing = await db.bible_studies.find_one({"_id": oid})
    if not existing:
        raise HTTPException(status_code=404, detail="Bible study not found")
    if existing["uploadedBy"] != current_user["email"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="You can only edit your own uploads")
    update_dict = {k: v for k, v in request.model_dump().items() if v is not None}
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")
    if "lessonItems" in update_dict:
        update_dict["lessonItems"] = [
            item if isinstance(item, dict) else item.dict()
            for item in update_dict["lessonItems"]
        ]
    update_dict["updatedAt"] = utcnow()
    await db.bible_studies.update_one({"_id": oid}, {"$set": update_dict})
    updated = await db.bible_studies.find_one({"_id": oid})
    return {"message": "Bible study updated", "bible_study": format_doc(updated)}

@router.delete("/{study_id}")
async def delete_bible_study(
    study_id: str,
    current_user: dict = Depends(require_clergy)
):
    oid = validate_object_id(study_id, "Bible Study ID")
    existing = await db.bible_studies.find_one({"_id": oid})
    if not existing:
        raise HTTPException(status_code=404, detail="Bible study not found")
    if existing["uploadedBy"] != current_user["email"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="You can only delete your own uploads")
    await db.bible_studies.delete_one({"_id": oid})
    return {"message": "Bible study deleted successfully"}