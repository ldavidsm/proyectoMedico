import uuid
from sqlalchemy import Column, String, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func
from app.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    is_read = Column(Boolean, default=False)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
