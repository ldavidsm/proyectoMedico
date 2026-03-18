from pydantic import BaseModel, Field, EmailStr
from typing import Optional


# --- SECCIÓN: CONFIGURACIÓN DE CUENTA ---
class AccountUpdate(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    email: Optional[EmailStr] = None
    language: Optional[str] = "Español"
    timezone: Optional[str] = None


# --- SECCIÓN: PRIVACIDAD ---
class PrivacySettingsUpdate(BaseModel):
    publicProfile: bool = True
    showEmail: bool = False
    showSpecialty: bool = True


# --- SECCIÓN: SEGURIDAD (2FA) ---
class SecurityTwoFactorUpdate(BaseModel):
    enabled: bool
    phoneNumber: Optional[str] = None


# --- SECCIÓN: CAMBIO DE CONTRASEÑA ---
class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str
