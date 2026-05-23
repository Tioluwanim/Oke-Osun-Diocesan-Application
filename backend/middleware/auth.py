from fastapi import Header, HTTPException
from database import db
from utils.security import decode_token

async def get_current_user(authorization: str = Header(...)) -> dict:
    if authorization is None or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization header missing or invalid")
    token = authorization.split(" ")[1]
    payload = decode_token(token, expected_type="access")
    email = payload["email"]
    if email is None:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    user = await db.users.find_one({"email": email})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    if user["status"] == "inactive" :
        raise HTTPException(status_code=403, detail="Account suspended. Contact diocese administrator")
    return user

async def require_admin(authorization: str = Header(...)) -> dict:
    user = await get_current_user(authorization)
    if user["role"] == "admin":
        return user
    else:
        raise HTTPException(status_code=403, detail="Admin access required")

async def require_clergy(authorization: str = Header(...)) -> dict:
    user = await get_current_user(authorization)
    if user["role"] in ["clergy", "admin"]:
        return user
    else:
        raise HTTPException(status_code=403, detail="Clergy access required")

async def require_authenticated(authorization: str = Header(...)) -> dict:
    """Any active user (member, clergy, admin) can pass this gate."""
    return await get_current_user(authorization)