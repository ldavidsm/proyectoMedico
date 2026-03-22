from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CohortCreate(BaseModel):
    course_id: str
    offer_id: str
    name: str
    enrollment_start: Optional[datetime] = None
    enrollment_end: Optional[datetime] = None
    course_start: datetime
    course_end: Optional[datetime] = None
    max_students: Optional[int] = None
    announcement: Optional[str] = None


class CohortUpdate(BaseModel):
    name: Optional[str] = None
    enrollment_start: Optional[datetime] = None
    enrollment_end: Optional[datetime] = None
    course_start: Optional[datetime] = None
    course_end: Optional[datetime] = None
    max_students: Optional[int] = None
    announcement: Optional[str] = None
    is_active: Optional[bool] = None


class CohortMemberResponse(BaseModel):
    id: str
    student_id: str
    student_name: str
    student_email: str
    joined_at: datetime
    progress_percentage: int = 0

    class Config:
        from_attributes = True


class CohortResponse(BaseModel):
    id: str
    course_id: str
    offer_id: str
    name: str
    enrollment_start: Optional[datetime] = None
    enrollment_end: Optional[datetime] = None
    course_start: datetime
    course_end: Optional[datetime] = None
    max_students: Optional[int] = None
    is_active: bool
    announcement: Optional[str] = None
    created_at: datetime
    member_count: int = 0
    spots_left: Optional[int] = None
    enrollment_open: bool = False
    course_started: bool = False

    class Config:
        from_attributes = True
