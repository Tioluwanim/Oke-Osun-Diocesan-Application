from fastapi import APIRouter, HTTPException, Depends, Query
from middleware.auth import require_clergy
from models.event import CreateEventRequest, UpdateEventRequest
from database import db
from utils.helpers import format_doc, utcnow, validate_object_id, sanitize_string

router = APIRouter()


@router.get("/")
async def get_events(
    search: str = Query(None),
    category: str = Query(None),
    parish: str = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    query = {}
    if category: query["category"] = category
    if parish:   query["parish"]   = parish
    if search:
        query["$or"] = [
            {"title":    {"$regex": search, "$options": "i"}},
            {"location": {"$regex": search, "$options": "i"}},
            {"parish":   {"$regex": search, "$options": "i"}},
        ]
    skip = (page - 1) * limit
    total = await db.events.count_documents(query)
    events = await db.events.find(query).sort("date", 1).skip(skip).limit(limit).to_list(length=limit)
    return {
        "events": [format_doc(e) for e in events],
        "total":  total,
        "page":   page,
        "pages":  (total + limit - 1) // limit,
    }


@router.get("/{event_id}")
async def get_event(event_id: str):
    oid = validate_object_id(event_id, "Event ID")
    event = await db.events.find_one({"_id": oid})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"event": format_doc(event)}


@router.post("/")
async def create_event(
    request: CreateEventRequest,
    current_user: dict = Depends(require_clergy)
):
    event = request.model_dump()
    event["title"]       = sanitize_string(event["title"])
    event["description"] = sanitize_string(event.get("description", "") or "")
    event["createdBy"]   = current_user["email"]
    event["creatorName"] = current_user["fullName"]
    event["createdAt"]   = utcnow()
    event["updatedAt"]   = utcnow()
    result = await db.events.insert_one(event)
    event["id"] = str(result.inserted_id)
    event.pop("_id", None)
    return {"message": "Event created successfully", "event": event}


@router.patch("/{event_id}")
async def update_event(
    event_id: str,
    request: UpdateEventRequest,
    current_user: dict = Depends(require_clergy)
):
    oid = validate_object_id(event_id, "Event ID")
    existing = await db.events.find_one({"_id": oid})
    if not existing:
        raise HTTPException(status_code=404, detail="Event not found")
    if existing["createdBy"] != current_user["email"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="You can only edit your own events")
    update_dict = {k: v for k, v in request.model_dump().items() if v is not None}
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")
    update_dict["updatedAt"] = utcnow()
    await db.events.update_one({"_id": oid}, {"$set": update_dict})
    updated = await db.events.find_one({"_id": oid})
    return {"message": "Event updated successfully", "event": format_doc(updated)}


@router.delete("/{event_id}")
async def delete_event(
    event_id: str,
    current_user: dict = Depends(require_clergy)
):
    oid = validate_object_id(event_id, "Event ID")
    existing = await db.events.find_one({"_id": oid})
    if not existing:
        raise HTTPException(status_code=404, detail="Event not found")
    if existing["createdBy"] != current_user["email"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="You can only delete your own events")
    await db.events.delete_one({"_id": oid})
    return {"message": "Event deleted successfully"}