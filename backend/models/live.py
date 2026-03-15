from pydantic import BaseModel
from typing import Optional

class UpdateLiveRequest(BaseModel):
    youtubeUrl: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    isLive: Optional[bool] = None
    scheduledDate: Optional[str] = None   # e.g. "2026-04-13"
    scheduledTime: Optional[str] = None   # e.g. "9:00 AM"