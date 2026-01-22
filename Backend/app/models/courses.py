from sqlalchemy import Column, String, Float, Boolean, ForeignKey, DateTime, ARRAY, Integer, UniqueConstraint, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import uuid

class Course(Base):
    __tablename__ = "courses"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    subtitle = Column(String)
    category = Column(String)
    topic = Column(String)
    subtopic = Column(String)
    level = Column(String) # Avanzado, Intermedio...
    short_description = Column(Text)
    long_description = Column(Text)
    
    # Requisitos y público (podemos guardarlos como JSON o ARRAY)
    target_audience = Column(ARRAY(String)) 
    learning_goals = Column(ARRAY(String))
    requirements = Column(Text)
    
    seller_id = Column(String, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="borrador") # borrador, revision, publicado
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relaciones
    modules = relationship("Module", back_populates="course", cascade="all, delete-orphan")
    offers = relationship("CourseOffer", back_populates="course", cascade="all, delete-orphan")
    bibliography = relationship("Bibliography", back_populates="course")
    
class Module(Base):
    __tablename__ = "course_modules"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    order = Column(Integer, default=0)

    course = relationship("Course", back_populates="modules")
    blocks = relationship("ContentBlock", back_populates="module", cascade="all, delete-orphan")

class ContentBlock(Base):
    __tablename__ = "content_blocks"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    module_id = Column(String, ForeignKey("course_modules.id"), nullable=False)
    
    type = Column(String, nullable=False) # "video", "reading", "quiz", "task"
    title = Column(String, nullable=False)
    order = Column(Integer, default=0)
    
    # Campos flexibles según el tipo
    content_url = Column(String) # Para videos o archivos
    body_text = Column(Text)     # Para lecturas
    duration = Column(String)    # "15:30"
    
    # Para exámenes (podemos guardar la estructura JSON de preguntas aquí)
    quiz_data = Column(JSON, nullable=True) 

    module = relationship("Module", back_populates="blocks")
    
class CourseContent(Base):
    __tablename__ = "course_contents"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)
    file_url = Column(String, nullable=False)       # URL al archivo en storage
    file_type = Column(String, nullable=False)      # "video", "pdf", "ppt", etc.
    order = Column(Integer, default=0)              # orden de reproducción o visualización

    course = relationship("Course", backref="contents")


class CourseReview(Base):
    __tablename__ = "course_reviews"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)

    rating = Column(Integer, nullable=False)  # 1–5
    comment = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "course_id", name="uq_user_course_review"),
    )

    user = relationship("User", backref="course_reviews")
    course = relationship("Course", backref="reviews")
    
class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)
    module_id = Column(String, nullable=False) # El ID de la lección
    is_completed = Column(Boolean, default=True)
    completed_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="progress_entries")
    course = relationship("Course", backref="progress_entries")
    
class CourseOffer(Base):
    __tablename__ = "course_offers"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)
    
    name_public = Column(String, nullable=False) # "Acceso Premium"
    price_base = Column(Float, nullable=False)
    
    # Bloques de beneficios
    access_type = Column(String) # "permanente", "temporal"
    has_live_sessions = Column(Boolean, default=False)
    has_tutoring = Column(Boolean, default=False)
    certificate_included = Column(Boolean, default=True)
    
    course = relationship("Course", back_populates="offers")    
    
class Bibliography(Base):
    __tablename__ = "course_bibliography"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)
    type = Column(String) # "Guía clínica", "Artículo"
    reference_text = Column(Text)
    doi_url = Column(String)

    course = relationship("Course", back_populates="bibliography")    