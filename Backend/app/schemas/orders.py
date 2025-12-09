from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.orders import OrderStatus


class OrderCreate(BaseModel):
    course_id: str


class OrderResponse(BaseModel):
    id: str
    user_id: str
    course_id: str
    price: float
    status: OrderStatus
    created_at: datetime

    class Config:
        from_attributes = True
