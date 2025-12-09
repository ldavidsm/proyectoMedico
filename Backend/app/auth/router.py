from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_current_user
from app.models.users import User, UserRole
from app.schemas.users import RegisterRequest, UserResponse, LoginRequest, TokenResponse
from app.core.security import hash_password, verify_password, create_access_token
from app.core.trusted import TRUSTED_USERS 
from app.database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])

# --- REGISTER ---
@router.post("/register", response_model=UserResponse)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    # Verificar si el email ya existe
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email ya registrado")
    
    if data.email in TRUSTED_USERS:
        role = UserRole.seller  # usuario confiable → seller directo
    else:
        role = UserRole.buyer   # usuario normal → buyer


    new_user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        full_name=data.full_name,
        role=role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

# --- LOGIN ---
@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="Credenciales incorrectas")

    if not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Credenciales incorrectas")

    # Crear JWT
    token = create_access_token({"sub": user.id, "email": user.email})

    return TokenResponse(access_token=token)

# --- ME ---
@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user