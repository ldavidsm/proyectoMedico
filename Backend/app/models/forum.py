import uuid
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey, Integer
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class ForumThread(Base):
    __tablename__ = "forum_threads"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)
    author_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String(300), nullable=False)
    body = Column(Text, nullable=False)
    is_pinned = Column(Boolean, default=False)
    is_closed = Column(Boolean, default=False)
    views = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    course = relationship("Course", backref="forum_threads")
    author = relationship("User", foreign_keys=[author_id])
    posts = relationship(
        "ForumPost", back_populates="thread", cascade="all, delete-orphan"
    )


class ForumPost(Base):
    __tablename__ = "forum_posts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    thread_id = Column(String, ForeignKey("forum_threads.id"), nullable=False)
    author_id = Column(String, ForeignKey("users.id"), nullable=False)
    body = Column(Text, nullable=False)
    is_answer = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    thread = relationship("ForumThread", back_populates="posts")
    author = relationship("User", foreign_keys=[author_id])
