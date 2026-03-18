from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime
from app.core.sanitize import sanitize_text


# ── Messages ──────────────────────────────────────────────

class MessageCreate(BaseModel):
    sender_id: str
    receiver_id: str
    course_id: str
    subject: str
    body: str

    @field_validator('subject')
    @classmethod
    def sanitize_subject(cls, v):
        return sanitize_text(v, max_length=200)

    @field_validator('body')
    @classmethod
    def sanitize_body(cls, v):
        return sanitize_text(v, max_length=5000)


class MessageReplyCreate(BaseModel):
    body: str


class MessageReplyResponse(BaseModel):
    id: str
    message_id: str
    sender_id: str
    body: str
    created_at: datetime
    sender_name: str

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    id: str
    sender_id: str
    receiver_id: str
    course_id: str
    subject: str
    body: str
    is_read: bool
    is_starred: bool
    created_at: datetime
    sender_name: str
    course_title: str
    replies: List[MessageReplyResponse] = []

    class Config:
        from_attributes = True


# ── Announcements ─────────────────────────────────────────

class AnnouncementCreate(BaseModel):
    course_id: str
    title: str
    body: str

    @field_validator('title')
    @classmethod
    def sanitize_title(cls, v):
        return sanitize_text(v, max_length=200)

    @field_validator('body')
    @classmethod
    def sanitize_ann_body(cls, v):
        return sanitize_text(v, max_length=5000)


class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    body: Optional[str] = None


class AnnouncementResponse(BaseModel):
    id: str
    course_id: str
    seller_id: str
    title: str
    body: str
    created_at: datetime
    course_title: str
    recipient_count: int

    class Config:
        from_attributes = True


# ── Task Submissions ──────────────────────────────────────

class TaskSubmissionCreate(BaseModel):
    block_id: str
    course_id: str
    submission_text: Optional[str] = None
    file_url: Optional[str] = None
    file_name: Optional[str] = None


class TaskSubmissionResponse(BaseModel):
    id: str
    block_id: str
    course_id: str
    student_id: str
    submission_text: Optional[str] = None
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    status: str
    grade: Optional[int] = None
    feedback: Optional[str] = None
    submitted_at: datetime
    graded_at: Optional[datetime] = None
    student_name: str
    student_email: str

    class Config:
        from_attributes = True


class GradeSubmissionRequest(BaseModel):
    grade: int
    feedback: str
    status: str  # "calificada" | "requiere-cambios"


class TaskSummary(BaseModel):
    block_id: str
    block_title: str
    course_id: str
    course_title: str
    submitted_count: int
    total_students: int
    graded_count: int
    due_date: Optional[str] = None
