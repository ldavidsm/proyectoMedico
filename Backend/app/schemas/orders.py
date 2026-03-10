from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from enum import Enum

class OrderStatusSchema(str, Enum):
    pending = "pending"
    paid = "paid"
    failed = "failed"
    refunded = "refunded"

class OrderCreate(BaseModel):
    course_id: str
    offer_id: str

class OrderResponse(BaseModel):
    id: str
    user_id: str
    course_id: str
    offer_id: str
    price: float
    status: OrderStatusSchema
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)