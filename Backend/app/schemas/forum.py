from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ForumPostCreate(BaseModel):
    body: str


class ForumPostResponse(BaseModel):
    id: str
    thread_id: str
    author_id: str
    author_name: str
    author_role: str
    body: str
    is_answer: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ForumThreadCreate(BaseModel):
    title: str
    body: str


class ForumThreadResponse(BaseModel):
    id: str
    course_id: str
    author_id: str
    author_name: str
    author_role: str
    title: str
    body: str
    is_pinned: bool
    is_closed: bool
    views: int
    post_count: int = 0
    last_post_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ForumThreadDetail(ForumThreadResponse):
    posts: List[ForumPostResponse] = []
