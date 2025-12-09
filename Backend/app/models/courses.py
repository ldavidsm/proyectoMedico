from sqlalchemy import Column, String, Float, Boolean, ForeignKey, DateTime, ARRAY, Integer
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import uuid

class Course(Base):
    __tablename__ = "courses"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    description = Column(String)
    price = Column(Float, nullable=False)
    category = Column(String)
    tags = Column(ARRAY(String))
    is_published = Column(Boolean, default=False)
    seller_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    seller = relationship("User", backref="courses")

    # Contenido externo (URLs de videos o archivos)
    content_url = Column(String, nullable=True)  # por ejemplo: S3, GCP
    content_type = Column(String, nullable=True) # "video", "pdf", "ppt", etc.
    
    
class CourseContent(Base):
    __tablename__ = "course_contents"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)
    file_url = Column(String, nullable=False)       # URL al archivo en storage
    file_type = Column(String, nullable=False)      # "video", "pdf", "ppt", etc.
    order = Column(Integer, default=0)              # orden de reproducción o visualización

    course = relationship("Course", backref="contents")

