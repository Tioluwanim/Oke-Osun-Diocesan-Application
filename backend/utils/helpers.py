from bson import ObjectId
from fastapi import HTTPException
from datetime import datetime, timezone
import re


# ── Validate ObjectId ──
def validate_object_id(ids: str, label: str = "ID") -> ObjectId:
    try:
        return ObjectId(ids)
    except Exception:
        raise HTTPException(status_code=400, detail=f"Invalid {label}")


# ── Format MongoDB document ──
def format_doc(doc: dict) -> dict | None:
    if doc is None:
        return None
    doc["id"] = str(doc["_id"])
    doc.pop("_id", None)
    return doc


# ── Current UTC timestamp ──
def utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()


# ── Password strength validator ──
def validate_password_strength(password: str) -> str:
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    if not re.search(r"[A-Z]", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one uppercase letter")
    if not re.search(r"[a-z]", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one lowercase letter")
    if not re.search(r"\d", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one number")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one special character")
    return password


# ── Strip HTML/script tags from strings ──
def sanitize_string(value: str) -> str:
    if not value:
        return value
    clean = re.sub(r"<[^>]*>", "", value)
    clean = re.sub(r"(javascript:|data:|vbscript:)", "", clean, flags=re.IGNORECASE)
    return clean.strip()