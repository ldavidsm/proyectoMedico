import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Enum, ForeignKey, UniqueConstraint, Text, Integer, ARRAY, JSON
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
    seller_profile = relationship("SellerProfile", back_populates="user", uselist=False)
    privacy_settings = relationship("PrivacySettings", back_populates="user", uselist=False)    
    
    # 2FA TOTP
    totp_secret = Column(String, nullable=True)
    totp_enabled = Column(Boolean, default=False)

    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    # Nuevas tablas para los flujos de configuración
    @property
    def profile_completed(self) -> bool:
        """Propiedad dinámica para saber si el perfil existe"""
        return self.professional_profile is not None
    
class SellerRequest(Base):
    __tablename__ = "seller_requests"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)

    # Campos existentes
    bio = Column(Text, nullable=True)
    education = Column(Text, nullable=True)
    achievements = Column(Text, nullable=True)
    experience_years = Column(Integer, default=0)
    linkedin_url = Column(String, nullable=True)
    website_url = Column(String, nullable=True)
    document_url = Column(String, nullable=True)

    # Tipo de flujo
    flow_type = Column(String, default='new_user')  # 'existing_profile' | 'new_user'

    # Perfil profesional (solo para flow_type='new_user')
    country = Column(String, nullable=True)
    profession = Column(String, nullable=True)
    education_level = Column(String, nullable=True)
    specialty = Column(String, nullable=True)
    college_number = Column(String, nullable=True)

    # Campos comunes ambos flujos
    content_types = Column(JSON, nullable=True)
    languages = Column(JSON, nullable=True)
    teaching_experience = Column(String, nullable=True)
    motivation = Column(JSON, nullable=True)
    legal_accepted = Column(Boolean, default=False)
    legal_accepted_at = Column(DateTime(timezone=True), nullable=True)

    status = Column(String, default="pending")  # pending / approved / rejected

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    reviewed_by = Column(String, nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    rejection_reason = Column(String, nullable=True)

    user = relationship("User", backref="seller_requests")
    
class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relaciones
    user = relationship("User", back_populates="favorites")
    # Asumiendo que tienes una clase Course definida
    course = relationship("Course", back_populates="favorited_by") 

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

    user = relationship("User", back_populates="seller_profile")    
    
class ProfessionalProfile(Base):
    __tablename__ = "professional_profiles"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), unique=True)
    
    # Verificación (Modal)
    country = Column(String)
    role = Column(String)
    formation_level = Column(String) 
    specialties = Column(ARRAY(String))
    professional_status = Column(String)
    
    # Identidad (Vista Perfil)
    bio = Column(Text)
    contact_email = Column(String)
    contact_phone = Column(String)
    credentials = Column(String) # Aquí se guarda el número de colegiado
    
    # --- Nuevos Campos de Consentimiento y Acreditación ---
    is_accredited = Column(Boolean, default=False)
    accept_terms = Column(Boolean, default=False)
    accept_responsible_use = Column(Boolean, default=False)
    
    # Imagen de perfil
    profile_image = Column(String, nullable=True)

    # Estado
    is_complete = Column(Boolean, default=False)
    verification_status = Column(String, default="pending")

    user = relationship("User", back_populates="professional_profile")  
      
class PrivacySettings(Base):
    __tablename__ = "privacy_settings"
    user_id = Column(String, ForeignKey("users.id"), primary_key=True)
    public_profile = Column(Boolean, default=True)
    show_email = Column(Boolean, default=False)
    show_specialty = Column(Boolean, default=True)
    marketing_emails = Column(Boolean, default=True)
    course_updates = Column(Boolean, default=True)
    push_notifications = Column(Boolean, default=False)

    user = relationship("User", back_populates="privacy_settings")    