from pydantic import BaseModel, Field
from typing import Optional, Literal

class CreateMagazineRequest(BaseModel):
    title: str = Field(min_length=3)
    category: Literal["Devotional", "Newsletter", "Ministry", "Education", "Other"] = "Newsletter"
    date: str
    pages: Optional[int] = None
    description: Optional[str] = None
    url: Optional[str] = None

class UpdateMagazineRequest(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    date: Optional[str] = None
    pages: Optional[int] = None
    description: Optional[str] = None
    url: Optional[str] = None