from datetime import datetime, date
from pydantic import BaseModel, Field, validator
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

    @validator("date")
    def validate_date(cls, value: str) -> str:
        try:
            event_date = datetime.strptime(value, "%Y-%m-%d").date()
        except ValueError:
            raise ValueError("Date must be in YYYY-MM-DD format")
        if event_date < date.today():
            raise ValueError("Event date must be today or in the future")
        return value

class UpdateEventRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    location: Optional[str] = None
    parish: Optional[str] = None
    category: Optional[Literal["Service", "Meeting", "Conference", "Outreach", "Youth", "Other"]]
    isAllParishes: Optional[bool] = None

    @validator("date")
    def validate_date(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        try:
            event_date = datetime.strptime(value, "%Y-%m-%d").date()
        except ValueError:
            raise ValueError("Date must be in YYYY-MM-DD format")
        if event_date < date.today():
            raise ValueError("Event date must be today or in the future")
        return value
