from fastapi import APIRouter, HTTPException, Depends, Request
from middleware.auth import require_clergy, require_admin
from database import db
from bson import ObjectId
from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, Literal

from utils.gcs import upload_file_to_gcs
from utils.upload_helpers import parse_form_or_json

router = APIRouter()

class CreateDocumentRequest(BaseModel):
    title: str = Field(min_length=3)
    category: Literal["Governance", "Administration", "Clergy", "Education", "Other"] = "Administration"
    size: Optional[str] = None        # e.g. "2.4 MB"
    date: Optional[str] = None        # e.g. "Jan 2024"
    url: Optional[str] = None         # download link

class UpdateDocumentRequest(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    size: Optional[str] = None
    date: Optional[str] = None
    url: Optional[str] = None

def format_doc(doc: dict) -> dict:
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc

@router.get("/")
async def get_documents():
    docs = await db.documents.find().sort("createdAt", -1).to_list(length=100)
    return {"documents": [format_doc(d) for d in docs]}

@router.post("/")
async def create_document(
    request: Request,
    current_user: dict = Depends(require_clergy)
):
    data, file = await parse_form_or_json(request, ["title", "category", "size", "date", "url"])
    if not data.get("title"):
        raise HTTPException(status_code=400, detail="Title is required")
    if file:
        data["url"] = upload_file_to_gcs(file, "documents")
        if not data.get("size"):
            data["size"] = file.filename

    doc = {
        "title": data["title"],
        "category": data.get("category") or "Administration",
        "size": data.get("size"),
        "date": data.get("date"),
        "url": data.get("url"),
    }
    doc["uploadedBy"] = current_user["email"]
    doc["uploaderName"] = current_user["fullName"]
    doc["createdAt"] = datetime.utcnow().isoformat()
    result = await db.documents.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    doc.pop("_id", None)
    return {"message": "Document uploaded successfully", "document": doc}

@router.patch("/{doc_id}")
async def update_document(
    doc_id: str,
    request: UpdateDocumentRequest,
    current_user: dict = Depends(require_clergy)
):
    try:
        existing = await db.documents.find_one({"_id": ObjectId(doc_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID")
    if not existing:
        raise HTTPException(status_code=404, detail="Document not found")
    if existing["uploadedBy"] != current_user["email"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="You can only edit your own uploads")
    update_dict = {k: v for k, v in request.model_dump().items() if v is not None}
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")
    await db.documents.update_one({"_id": ObjectId(doc_id)}, {"$set": update_dict})
    updated = await db.documents.find_one({"_id": ObjectId(doc_id)})
    return {"message": "Document updated", "document": format_doc(updated)}

@router.delete("/{doc_id}")
async def delete_document(
    doc_id: str,
    current_user: dict = Depends(require_clergy)
):
    try:
        existing = await db.documents.find_one({"_id": ObjectId(doc_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID")
    if not existing:
        raise HTTPException(status_code=404, detail="Document not found")
    if existing["uploadedBy"] != current_user["email"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="You can only delete your own uploads")
    await db.documents.delete_one({"_id": ObjectId(doc_id)})
    return {"message": "Document deleted successfully"}