from fastapi import APIRouter, HTTPException, Depends
from middleware.auth import require_admin
from models.live import UpdateLiveRequest
from database import db
from utils.helpers import format_doc, utcnow

router = APIRouter()


@router.get("/")
async def get_live():
    stream = await db.live_stream.find_one({})
    if not stream:
        return {
            "stream": {
                "id":            None,
                "youtubeUrl":    None,
                "title":         "Sunday Service",
                "description":   "Join us for our live service",
                "isLive":        False,
                "scheduledDate": None,
                "scheduledTime": None,
                "updatedAt":     None,
            }
        }
    return {"stream": format_doc(stream)}


@router.patch("/")
async def update_live(
    request: UpdateLiveRequest,
    current_user: dict = Depends(require_admin)
):
    update_dict = {k: v for k, v in request.model_dump().items() if v is not None}
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")
    update_dict["updatedAt"] = utcnow()
    update_dict["updatedBy"] = current_user["email"]
    existing = await db.live_stream.find_one({})
    if existing:
        await db.live_stream.update_one({}, {"$set": update_dict})
    else:
        await db.live_stream.insert_one(update_dict)
    stream = await db.live_stream.find_one({})
    return {"message": "Live stream updated", "stream": format_doc(stream)}


@router.patch("/toggle")
async def toggle_live(current_user: dict = Depends(require_admin)):
    stream = await db.live_stream.find_one({})
    current_status = stream.get("isLive", False) if stream else False
    new_status = not current_status
    update = {
        "isLive":    new_status,
        "updatedAt": utcnow(),
        "updatedBy": current_user["email"],
    }
    if stream:
        await db.live_stream.update_one({}, {"$set": update})
    else:
        await db.live_stream.insert_one(update)
    stream = await db.live_stream.find_one({})
    return {
        "message": f"Stream is now {'live 🔴' if new_status else 'offline'}",
        "stream":  format_doc(stream),
    }