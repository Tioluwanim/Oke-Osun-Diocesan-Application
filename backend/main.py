import json
import logging
import os
import time
import uuid
import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from dotenv import load_dotenv

from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from database import db
from utils.indexes import create_indexes
from utils.rate_limiter import limiter

from routes.auth import router as auth_router
from routes.users import router as users_router
from routes.parishes import router as parishes_router
from routes.admin import router as admin_router
from routes.sermons import router as sermons_router
from routes.events import router as events_router
from routes.live import router as live_router
from routes.magazines import router as magazines_router
from routes.bible_studies import router as bible_studies_router
from routes.documents import router as documents_router
from routes.uploads import router as uploads_router
from routes.payments import router as payments_router


# ── Startup/Shutdown lifecycle ──
@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.start_time = time.time()
    await create_indexes()
    yield


load_dotenv()

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(level=LOG_LEVEL, format="%(message)s")

environment = os.getenv("ENVIRONMENT", "development").strip().lower()
cors_origins = os.getenv("CORS_ORIGINS", "").split(",") if os.getenv("CORS_ORIGINS") else []
cors_origins = [origin.strip() for origin in cors_origins if origin.strip()]
allowed_hosts = os.getenv("ALLOWED_HOSTS", "").split(",") if os.getenv("ALLOWED_HOSTS") else []
allowed_hosts = [host.strip() for host in allowed_hosts if host.strip()]

local_environments = {"local", "development", "dev", "test"}
if not cors_origins:
    if environment in local_environments:
        cors_origins = ["http://localhost:19006", "http://localhost:8081", "http://127.0.0.1:19006"]
    else:
        raise RuntimeError("CORS_ORIGINS must be set explicitly outside local development")

app = FastAPI(title="Oke-Osun Diocese API", lifespan=lifespan)
app.add_middleware(SlowAPIMiddleware)
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.state.limiter = limiter

if environment not in local_environments:
    if not allowed_hosts:
        raise RuntimeError("ALLOWED_HOSTS must be set explicitly outside local development")
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=allowed_hosts)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_logger(request: Request, call_next):
    request_id = request.headers.get("x-request-id") or str(uuid.uuid4())
    request.state.request_id = request_id
    start_time = time.time()

    try:
        response = await call_next(request)
    except Exception as exc:
        duration = time.time() - start_time
        logging.error(json.dumps({
            "message": "Unhandled exception",
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "status_code": 500,
            "duration_ms": int(duration * 1000),
            "exception": str(exc),
        }))
        raise

    duration = time.time() - start_time
    response.headers["X-Request-ID"] = request_id
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "no-referrer")
    response.headers.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
    if environment == "production":
        response.headers.setdefault("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
    logging.info(json.dumps({
        "message": "Request completed",
        "request_id": request_id,
        "method": request.method,
        "path": request.url.path,
        "status_code": response.status_code,
        "duration_ms": int(duration * 1000),
        "client_ip": request.client.host if request.client else None,
    }))
    return response


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    request_id = getattr(request.state, "request_id", None) or str(uuid.uuid4())
    logging.warning(json.dumps({
        "message": "Rate limit exceeded",
        "request_id": request_id,
        "method": request.method,
        "path": request.url.path,
        "status_code": 429,
        "client_ip": request.client.host if request.client else None,
    }))
    return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded"})


app.include_router(auth_router,         prefix="/auth",          tags=["Auth"])
app.include_router(users_router,         prefix="/users",         tags=["Users"])
app.include_router(parishes_router,      prefix="/parishes",      tags=["Parishes"])
app.include_router(admin_router,         prefix="/admin",         tags=["Admin"])
app.include_router(sermons_router,       prefix="/sermons",       tags=["Sermons"])
app.include_router(events_router,        prefix="/events",        tags=["Events"])
app.include_router(live_router,          prefix="/live",          tags=["Live"])
app.include_router(magazines_router,     prefix="/magazines",     tags=["Magazines"])
app.include_router(bible_studies_router, prefix="/bible-studies", tags=["Bible Studies"])
app.include_router(documents_router,     prefix="/documents",     tags=["Documents"])
app.include_router(uploads_router,       prefix="/uploads",       tags=["Uploads"])
app.include_router(payments_router,      prefix="/payments",      tags=["Payments"])


@app.get("/health")
async def health():
    try:
        await db.client.admin.command("ping")
        return {"status": "ok", "uptime": int(time.time() - app.state.start_time)}
    except Exception:
        raise HTTPException(status_code=503, detail="Database unavailable")


@app.get("/")
def root():
    return {"status": "Oke-Osun Diocese API is running"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)