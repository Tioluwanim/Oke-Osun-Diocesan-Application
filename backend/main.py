import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv

from utils.indexes import create_indexes

from routes.auth import router
from routes.users import router as users_router
from routes.parishes import router as parishes_router
from routes.admin import router as admin_router
from routes.sermons import router as sermons_router
from routes.events import router as events_router
from routes.live import router as live_router
from routes.magazines import router as magazines_router
from routes.bible_studies import router as bible_studies_router
from routes.documents import router as documents_router


# ── Startup/Shutdown lifecycle ──
@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_indexes()
    yield


load_dotenv()

environment = os.getenv("ENVIRONMENT", "development").strip().lower()
cors_origins = os.getenv("CORS_ORIGINS", "").split(",") if os.getenv("CORS_ORIGINS") else []
cors_origins = [origin.strip() for origin in cors_origins if origin.strip()]

if environment != "production" and not cors_origins:
    cors_origins = ["*"]

app = FastAPI(title="Oke-Osun Diocese API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router,               prefix="/auth",          tags=["Auth"])
app.include_router(users_router,         prefix="/users",         tags=["Users"])
app.include_router(parishes_router,      prefix="/parishes",      tags=["Parishes"])
app.include_router(admin_router,         prefix="/admin",         tags=["Admin"])
app.include_router(sermons_router,       prefix="/sermons",       tags=["Sermons"])
app.include_router(events_router,        prefix="/events",        tags=["Events"])
app.include_router(live_router,          prefix="/live",          tags=["Live"])
app.include_router(magazines_router,     prefix="/magazines",     tags=["Magazines"])
app.include_router(bible_studies_router, prefix="/bible-studies", tags=["Bible Studies"])
app.include_router(documents_router,     prefix="/documents",     tags=["Documents"])


@app.get("/")
def root():
    return {"status": "Oke-Osun Diocese API is running"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)