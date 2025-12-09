from pydantic import BaseModel, EmailStr
from datetime import datetime

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
    


    class Config:
        orm_mode = True
