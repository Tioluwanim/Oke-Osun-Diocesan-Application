from pydantic import BaseModel, Field
from typing import Literal, Optional
from datetime import datetime


class InitiatePaymentRequest(BaseModel):
    amount: float = Field(gt=0, description="Amount in Naira")
    type: Literal["tithe", "offering", "first_fruit", "seed", "building_fund", "welfare", "gift", "other"]
    description: Optional[str] = None  # Free-text note from giver
    anonymous: bool = False            # If True, name is hidden on admin view


class VerifyPaymentRequest(BaseModel):
    reference: str


class AdminPaymentFilterParams(BaseModel):
    type: Optional[str] = None
    status: Optional[str] = None
    from_date: Optional[str] = None
    to_date: Optional[str] = None