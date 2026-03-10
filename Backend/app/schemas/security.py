from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional

# --- SECCIÓN: CONFIGURACIÓN DE CUENTA ---
class AccountUpdate(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    email: Optional[EmailStr] = None
    language: Optional[str] = "Español"
    timezone: Optional[str] = None

# --- SECCIÓN: PRIVACIDAD ---
class PrivacySettingsUpdate(BaseModel):
    publicProfile: bool = Field(..., alias="public_profile")
    showEmail: bool = Field(..., alias="show_email")
    showSpecialty: bool = Field(..., alias="show_specialty")
    allowMessages: bool = Field(..., alias="allow_messages")

# --- SECCIÓN: SEGURIDAD (2FA) ---
class SecurityTwoFactorUpdate(BaseModel):
    enabled: bool
    phoneNumber: Optional[str] = None

# --- SECCIÓN: APRENDIZAJE (PAYLOADS) ---
class CourseProgressUpdate(BaseModel):
    courseId: str
    lessonId: str
    status: str # "completed" | "in-progress"