from pydantic import BaseModel, Field
from typing import Optional, Literal, List


class ParishGroup(BaseModel):
    name: str = Field(min_length=2)
    leader: Optional[str] = None
    members: int = 0
    icon: Optional[str] = None

class CreateParishRequest(BaseModel):
    name: str = Field(min_length=3)
    location: Optional[str] = None
    archdeaconry: Optional[str] = None
    deanery: Optional[str] = None
    established: Optional[str] = None
    groups: List[ParishGroup] = []
    status: Literal["active", "inactive"] = "active"

class UpdateParishRequest(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    archdeaconry: Optional[str] = None
    deanery: Optional[str] = None
    established: Optional[str] = None
    groups: Optional[List[ParishGroup]] = None
    status: Optional[Literal["active", "inactive"]] = None


class CreateParishNoticeRequest(BaseModel):
    title: str = Field(min_length=3)
    body: str = Field(min_length=3)
    priority: Literal["normal", "high"] = "normal"
