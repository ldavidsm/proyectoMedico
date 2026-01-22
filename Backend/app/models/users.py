import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Enum, ForeignKey, UniqueConstraint, Text, Integer, ARRAY
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import ENUM
import enum

from app.database import Base  

class UserRole(enum.Enum):
    buyer = "buyer"
    seller = "seller"
    admin = "admin"

user_role_enum = ENUM(
    "buyer",
    "seller",
    "admin",
    name="userrole",
    create_type=False  
)

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(
    user_role_enum, nullable=False, server_default="buyer")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    professional_profile = relationship("ProfessionalProfile", back_populates="user", uselist=False)
    @property
    def profile_completed(self) -> bool:
        """Propiedad dinámica para saber si el perfil existe"""
        return self.professional_profile is not None
    
class SellerRequest(Base):
    __tablename__ = "seller_requests"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)

    bio = Column(Text, nullable=False)
    education = Column(Text, nullable=True)
    achievements = Column(Text, nullable=True)
    experience_years = Column(Integer, default=0)
    linkedin_url = Column(String, nullable=True)
    website_url = Column(String, nullable=True)

    status = Column(String, default="pending")  # pending / approved / rejected

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    reviewed_by = Column(String, nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", backref="seller_requests")
class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "course_id", name="unique_favorite"),
    )
    
class SellerProfile(Base):
    __tablename__ = "seller_profiles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)

    bio = Column(Text, nullable=True)
    education = Column(Text, nullable=True)
    achievements = Column(Text, nullable=True)
    experience_years = Column(Integer, default=0)

    linkedin_url = Column(String, nullable=True)
    website_url = Column(String, nullable=True)
    profile_image = Column(String, nullable=True)

    is_verified = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", backref="seller_profile", uselist=False)
    
class ProfessionalProfile(Base):
    __tablename__ = "professional_profiles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    
    # Datos que vienen de tu formulario ProfessionalProfileForm
    country = Column(String, nullable=False)
    role = Column(String, nullable=False)  # "medico", "enfermeria", etc.
    role_other = Column(String, nullable=True)
    formation_level = Column(String, nullable=False)
    specialty = Column(ARRAY(String), nullable=False) 
    professional_status = Column(String, nullable=False)
    
    collegiated = Column(Boolean, default=False)
    collegiate_number = Column(String, nullable=True)
    
    # Consentimientos
    accept_terms = Column(Boolean, default=False)
    accept_responsible_use = Column(Boolean, default=False)

    # Relación uno a uno con tu modelo User actual
    user = relationship("User", back_populates="professional_profile")