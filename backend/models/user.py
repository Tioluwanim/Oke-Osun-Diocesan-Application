from pydantic import BaseModel, Field, EmailStr
from typing import Literal, Optional


class RegisterRequest(BaseModel):
    fullName: str
    email: EmailStr
    password: str = Field(min_length=6)
    role: Literal["member","clergy"]
    parish: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    fullName: str
    email: EmailStr
    role: str
    status: str
    parish: Optional[str] = None
    createdAt: str

class UpdateProfileRequest(BaseModel):
    fullName: Optional[str] = None
    phone: Optional[str] = None
    parish: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=6)


class InviteUserRequest(BaseModel):
    fullName: str
    email: EmailStr
    role: Literal["member", "clergy", "admin"] = "member"
    parish: Optional[str] = None
    phone: Optional[str] = None


class CompleteInviteRequest(BaseModel):
    invite_token: str = Field(min_length=12)
    password: str = Field(min_length=8)
