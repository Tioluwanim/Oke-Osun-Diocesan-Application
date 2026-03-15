from pydantic import BaseModel, Field
from typing import Optional, Literal

class CreateParishRequest(BaseModel):
    name: str = Field(min_length=3)
    location: Optional[str] = None
    archdeaconry: Optional[str] = None
    status: Literal["active", "inactive"] = "active"

class UpdateParishRequest(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    archdeaconry: Optional[str] = None
    status: Optional[Literal["active", "inactive"]] = None