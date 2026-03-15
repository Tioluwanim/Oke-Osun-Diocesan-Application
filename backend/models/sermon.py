from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

class CreateSermonRequest(BaseModel):
    title: str = Field(min_length=3)
    preacher: str
    scripture: Optional[str] = None
    description: Optional[str] = None
    type: Literal["Audio", "Video"] = "Audio"
    series: Optional[str] = None
    duration: Optional[str] = None
    url: Optional[str] = None        # audio/video file URL or YouTube link
    parish: Optional[str] = None

class UpdateSermonRequest(BaseModel):
    title: Optional[str] = None
    preacher: Optional[str] = None
    scripture: Optional[str] = None
    description: Optional[str] = None
    type: Optional[Literal["Audio", "Video"]] = None
    series: Optional[str] = None
    duration: Optional[str] = None
    url: Optional[str] = None
    parish: Optional[str] = None