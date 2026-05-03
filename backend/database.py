import os
import logging

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()
logger = logging.getLogger(__name__)

uri = os.getenv("MONGO_URI")
database_name = os.getenv("DATABASE_NAME")

if not uri:
    raise RuntimeError("MONGO_URI must be configured")

if not database_name:
    raise RuntimeError("DATABASE_NAME must be configured")

client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=5000)
db = client[database_name]

logger.info("MongoDB client configured for database %s", database_name)
