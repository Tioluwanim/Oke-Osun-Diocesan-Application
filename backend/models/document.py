from pydantic import BaseModel, Field
from typing import Optional, Literal

class CreateDocumentRequest(BaseModel):
    title: str = Field(min_length=3)
    category: Literal["Governance", "Administration", "Clergy", "Education", "Other"] = "Administration"
    size: Optional[str] = None
    date: Optional[str] = None
    url: Optional[str] = None

class UpdateDocumentRequest(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    size: Optional[str] = None
    date: Optional[str] = None
    url: Optional[str] = None