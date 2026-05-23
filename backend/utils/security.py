import hashlib
import os
import uuid
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from fastapi import HTTPException
from jose import JWTError, jwt
from passlib.context import CryptContext

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

JWT_ALGORITHM = "HS256"
TOKEN_TYPE_ACCESS = "access"
TOKEN_TYPE_REFRESH = "refresh"


def get_jwt_secret() -> str:
    jwt_secret = os.getenv("JWT_SECRET")
    if not jwt_secret:
        raise RuntimeError("JWT_SECRET must be configured")
    return jwt_secret


def get_access_token_lifetime() -> int:
    return int(os.getenv("ACCESS_TOKEN_MINUTES", 15))


def get_refresh_token_lifetime() -> int:
    return int(os.getenv("REFRESH_TOKEN_DAYS", 30))


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _create_token(email: str, role: str, token_type: str, expires_delta: timedelta) -> str:
    jwt_secret = get_jwt_secret()
    now = datetime.now(timezone.utc)
    expire = now + expires_delta
    payload = {
        "email": email,
        "role": role,
        "type": token_type,
        "jti": uuid.uuid4().hex,
        "exp": int(expire.timestamp()),
        "iat": int(now.timestamp()),
    }
    return jwt.encode(payload, jwt_secret, algorithm=JWT_ALGORITHM)


def create_access_token(email: str, role: str) -> str:
    return _create_token(email, role, TOKEN_TYPE_ACCESS, timedelta(minutes=get_access_token_lifetime()))


def create_refresh_token(email: str, role: str) -> str:
    return _create_token(email, role, TOKEN_TYPE_REFRESH, timedelta(days=get_refresh_token_lifetime()))


def create_token(email: str, role: str) -> str:
    return create_access_token(email, role)


def decode_token(token: str, expected_type: str = TOKEN_TYPE_ACCESS) -> dict:
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if not payload.get("email") or payload.get("type") != expected_type:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
