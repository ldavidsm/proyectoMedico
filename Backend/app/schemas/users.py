from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


class ProfessionalProfileSchema(BaseModel):
    country: str
    role: str
    roleOther: Optional[str] = Field(None, alias="role_other")
    formationLevel: str = Field(..., alias="formation_level")
    specialty: List[str]
    professionalStatus: str = Field(..., alias="professional_status")
    collegiated: bool
    collegiateNumber: Optional[str] = Field(None, alias="collegiate_number")
    acceptTerms: bool = Field(..., alias="accept_terms")
    acceptResponsibleUse: bool = Field(..., alias="accept_responsible_use")

    class Config:
        populate_by_name = True # Permite usar role_other en Python y roleOther en el JSON
        from_attributes = True

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    
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
    profile: Optional[ProfessionalProfileSchema] = None
    
    class Config:
            from_attributes = True
            
    
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
        
