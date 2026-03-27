from pydantic import BaseModel, EmailStr, Field, model_validator, field_validator
from typing import Optional, List
from datetime import datetime
from app.core.sanitize import sanitize_text

class ProfessionalProfileUpdate(BaseModel):
    # --- Datos de Identidad ---
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    bio: Optional[str] = Field(None, max_length=500)

    @field_validator('bio')
    @classmethod
    def sanitize_bio(cls, v):
        if v is None:
            return v
        return sanitize_text(v, max_length=500)
    contactEmail: Optional[EmailStr] = Field(None, alias="contact_email")
    contactPhone: Optional[str] = Field(None, alias="contact_phone")
    credentials: Optional[str] = None

    # --- Datos de Verificación ---
    country: Optional[str] = None
    profession: Optional[str] = Field(None, alias="role") 
    educationLevel: Optional[str] = Field(None, alias="formation_level")
    
    # Campo principal sincronizado con character varying[]
    specialties: Optional[List[str]] = Field(default_factory=list)

    # --- Lógica de sincronización ---
    @model_validator(mode='before')
    @classmethod
    def sync_fields(cls, data: any) -> any:
        if isinstance(data, dict):
            # 1. Sincronizar specialty (singular) -> specialties (lista)
            specialty = data.get("specialty")
            specialties = data.get("specialties")
            if specialty and not specialties:
                data["specialties"] = [specialty]
        return data

    currentSituation: Optional[str] = Field(None, alias="professional_status")

    # --- Consentimientos ---
    isAccredited: Optional[bool] = Field(None, alias="is_accredited")
    acceptTerms: Optional[bool] = Field(None, alias="accept_terms")
    acceptResponsibleUse: Optional[bool] = Field(None, alias="accept_responsible_use")

    class Config:
        populate_by_name = True
        from_attributes = True
        
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str

    @field_validator('full_name')
    @classmethod
    def sanitize_full_name(cls, v):
        return sanitize_text(v, max_length=200)
    
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserUpdate(BaseModel):
    full_name: str | None = None
    
class ChangePassword(BaseModel):
    current_password: str
    new_password: str    

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    created_at: datetime
    profile_completed: bool
    totp_enabled: Optional[bool] = False
    professional_profile: Optional[ProfessionalProfileUpdate] = None
    profile_image: Optional[str] = None

    class Config:
            from_attributes = True
            populate_by_name = True
            
    
class SellerProfileBase(BaseModel):
    bio: Optional[str] = None
    education: Optional[str] = None
    achievements: Optional[str] = None
    experience_years: Optional[int] = 0
    linkedin_url: Optional[str] = None
    website_url: Optional[str] = None
    profile_image: Optional[str] = None


class SellerProfileUpdate(SellerProfileBase):
    pass


class SellerProfileResponse(SellerProfileBase):
    id: str
    user_id: str
    is_verified: bool
    
class ResetRequest(BaseModel):
    email: EmailStr

class VerifyOtpRequest(BaseModel):
    email: EmailStr
    code: str

class ResetPasswordFinal(BaseModel):
    email: EmailStr
    code: str
    new_password: str

    class Config:
        orm_mode = True
        
