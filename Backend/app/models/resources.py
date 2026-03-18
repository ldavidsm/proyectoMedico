import uuid
from sqlalchemy import Column, String, Text, Boolean, DateTime, Integer, ForeignKey
from sqlalchemy.sql import func
from app.database import Base


class Resource(Base):
    __tablename__ = "resources"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    type = Column(String, nullable=False)  # "PDF", "Video", "Plantilla", "Curso", "Enlace"
    url = Column(String, nullable=False)
    duration = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class FAQ(Base):
    __tablename__ = "faqs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    question = Column(String, nullable=False)
    answer = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
    order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String, default="open")  # open, in_progress, resolved
    created_at = Column(DateTime(timezone=True), server_default=func.now())
