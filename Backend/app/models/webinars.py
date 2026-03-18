import uuid
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey, Integer
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class SellerGoogleToken(Base):
    """Almacena el token OAuth del seller para crear meetings en su nombre"""
    __tablename__ = "seller_google_tokens"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    seller_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    access_token = Column(Text, nullable=False)
    refresh_token = Column(Text, nullable=False)
    token_expiry = Column(DateTime(timezone=True), nullable=True)
    google_email = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    seller = relationship("User", backref="google_token")


class Webinar(Base):
    __tablename__ = "webinars"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    seller_id = Column(String, ForeignKey("users.id"), nullable=False)
    course_id = Column(String, ForeignKey("courses.id"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    scheduled_at = Column(DateTime(timezone=True), nullable=False)
    duration_minutes = Column(Integer, default=60)
    meet_link = Column(String, nullable=True)
    google_event_id = Column(String, nullable=True)
    status = Column(String, default="scheduled")  # scheduled, live, completed, cancelled
    max_attendees = Column(Integer, nullable=True)
    is_public = Column(Boolean, default=True)
    recording_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    seller = relationship("User", foreign_keys=[seller_id])
    course = relationship("Course", foreign_keys=[course_id])
    registrations = relationship(
        "WebinarRegistration", back_populates="webinar", cascade="all, delete-orphan"
    )


class WebinarRegistration(Base):
    __tablename__ = "webinar_registrations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    webinar_id = Column(String, ForeignKey("webinars.id"), nullable=False)
    student_id = Column(String, ForeignKey("users.id"), nullable=False)
    registered_at = Column(DateTime(timezone=True), server_default=func.now())
    attended = Column(Boolean, default=False)

    webinar = relationship("Webinar", back_populates="registrations")
    student = relationship("User", foreign_keys=[student_id])
