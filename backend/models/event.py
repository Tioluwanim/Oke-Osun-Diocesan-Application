from pydantic import BaseModel, Field
from typing import Optional, Literal

class CreateEventRequest(BaseModel):
    title: str = Field(min_length=3)
    description: Optional[str] = None
    date: str                          # e.g. "2026-04-10"
    time: Optional[str] = None         # e.g. "10:00 AM"
    location: Optional[str] = None
    parish: Optional[str] = None
    category: Literal["Service", "Meeting", "Conference", "Outreach", "Youth", "Other"] = "Service"
    isAllParishes: bool = False

class UpdateEventRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    location: Optional[str] = None
    parish: Optional[str] = None
    category: Optional[str] = None
    isAllParishes: Optional[bool] = None