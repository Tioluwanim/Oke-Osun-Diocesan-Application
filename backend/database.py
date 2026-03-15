from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

# Load .env file
load_dotenv()

# Read URI from .env
uri = os.getenv("MONGO_URI")

# Create async client
client = AsyncIOMotorClient(uri)

# Database instance
db = client[os.getenv("DATABASE_NAME")]

print("Database connected!")