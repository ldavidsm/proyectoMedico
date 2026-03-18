from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ResourceCreate(BaseModel):
    title: str
    description: Optional[str] = None
    type: str
    url: str
    duration: Optional[str] = None
    order: int = 0


class ResourceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    url: Optional[str] = None
    duration: Optional[str] = None
    is_active: Optional[bool] = None
    order: Optional[int] = None


class ResourceResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    type: str
    url: str
    duration: Optional[str]
    is_active: bool
    order: int
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


class FAQCreate(BaseModel):
    question: str
    answer: str
    order: int = 0


class FAQUpdate(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    is_active: Optional[bool] = None
    order: Optional[int] = None


class FAQResponse(BaseModel):
    id: str
    question: str
    answer: str
    is_active: bool
    order: int
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


class SupportTicketCreate(BaseModel):
    subject: str
    message: str


class SupportTicketResponse(BaseModel):
    id: str
    user_id: Optional[str]
    name: str
    email: str
    subject: str
    message: str
    status: str
    created_at: Optional[datetime]

    class Config:
        from_attributes = True
