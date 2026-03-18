from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class WebinarCreate(BaseModel):
    title: str
    description: Optional[str] = None
    scheduled_at: datetime
    duration_minutes: int = 60
    course_id: Optional[str] = None
    max_attendees: Optional[int] = None
    is_public: bool = True
    meet_link: Optional[str] = None  # manual link when no Google token


class WebinarUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    max_attendees: Optional[int] = None
    is_public: Optional[bool] = None
    recording_url: Optional[str] = None
    status: Optional[str] = None
    meet_link: Optional[str] = None


class WebinarResponse(BaseModel):
    id: str
    seller_id: str
    course_id: Optional[str]
    title: str
    description: Optional[str]
    scheduled_at: datetime
    duration_minutes: int
    meet_link: Optional[str]
    status: str
    max_attendees: Optional[int]
    is_public: bool
    recording_url: Optional[str]
    created_at: datetime
    seller_name: Optional[str] = None
    course_title: Optional[str] = None
    registration_count: int = 0
    is_registered: bool = False

    class Config:
        from_attributes = True


class RegistrationResponse(BaseModel):
    id: str
    webinar_id: str
    student_id: str
    registered_at: datetime
    attended: bool
    student_name: Optional[str] = None
    student_email: Optional[str] = None

    class Config:
        from_attributes = True


class GoogleAuthStatus(BaseModel):
    connected: bool
    google_email: Optional[str] = None
