import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies import get_current_user
from app.models.users import User, UserRole
from app.core.mail_config import send_verification_email, send_activation_button_email
from app.core.redis_config import save_code,delete_code, get_code, redis_client
from app.schemas.users import RegisterRequest, UserResponse, LoginRequest, TokenResponse, VerifyOtpRequest, ResetRequest, ResetPasswordFinal, ProfessionalProfileSchema
from app.core.security import hash_password, verify_password, create_access_token
from app.core.trusted import TRUSTED_USERS 
from app.database import get_db
import random

router = APIRouter(prefix="/auth", tags=["auth"])

# --- REGISTER ---
@router.post("/register", response_model=UserResponse)
async def register(data: RegisterRequest, db: Session = Depends(get_db)):
    # Verificar si el email ya existe
    # 1. Verificar si existe
    existing = db.query(User).filter(User.email == data.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    if data.email in TRUSTED_USERS:
        role = UserRole.seller  # usuario confiable → seller directo
    else:
        role = UserRole.buyer   # usuario normal → buyer


    new_user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        full_name=data.full_name,
        role=UserRole.buyer.value,
        is_active = False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    verification_token = str(uuid.uuid4())
    redis_client.setex(f"verify:{verification_token}", 3600, data.email.lower())
    
    verification_url = f"http://localhost:3000/verify-account?token={verification_token}"
    await send_activation_button_email(data.email.lower(), verification_url)   
    
    response = UserResponse.from_orm(new_user)
    response.profileCompleted = False # Por defecto al registrarse
    return response

# --- LOGIN ---
@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="Credenciales incorrectas")

    if not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Credenciales incorrectas")
    
    if not user.is_active:
        raise HTTPException(
            status_code=403, 
            detail="Tu cuenta aún no ha sido verificada. Revisa tu correo."
        )

    # Crear JWT
    token = create_access_token({"sub": user.id, "email": user.email})

    return TokenResponse(access_token=token)

# --- ME ---
@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    # 1. Creamos la respuesta
    response = UserResponse.from_orm(current_user)
    
    # 2. Asignamos usando el nombre EXACTO del esquema (con guion bajo)
    response.profile_completed = current_user.professional_profile is not None
    
    if current_user.professional_profile:
        response.profile = current_user.professional_profile

    return response

@router.post("/request-password-reset")
async def request_password_reset(data: ResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        # Por seguridad, a veces es mejor no decir que el email no existe, 
        # pero para desarrollo lo dejamos así.
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Generar código
    code = f"{random.randint(1000, 9999)}"
    
    # GUARDAR EN REDIS (Lo haremos en el siguiente paso, por ahora sigamos con el dict)
    save_code(data.email, code)

    # ENVIAR CORREO REAL
    try:
        await send_verification_email(data.email, code)
        return {"message": "Código enviado al correo"}
    except Exception as e:
        print(f"Error enviando mail: {e}")
        raise HTTPException(status_code=500, detail="No se pudo enviar el correo")
    
@router.post("/verify-otp")
def verify_otp(data: VerifyOtpRequest):
    stored_code = get_code(data.email)
    if not stored_code or stored_code != data.code:
        raise HTTPException(status_code=400, detail="Código inválido o expirado")
    
    return {"message": "Código verificado correctamente"}

@router.post("/reset-password-final")
def reset_password_final(data: ResetPasswordFinal, db: Session = Depends(get_db)):
    stored_code = get_code(data.email)
    
    if not stored_code or stored_code != data.code:
        raise HTTPException(status_code=400, detail="Código inválido o expirado")

    # 2. Buscar usuario y actualizar hash
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    user.password_hash = hash_password(data.new_password)
    db.commit()

    # 3. Limpiar el código usado
    delete_code(data.email)

    return {"message": "Tu contraseña ha sido actualizada con éxito"}


@router.get("/confirm-email") # Puede ser GET porque viene de un enlace
def confirm_email(token: str, db: Session = Depends(get_db)):
    # 1. Buscar el email asociado al token en Redis
    email_data = redis_client.get(f"verify:{token}")   
      
    if not email_data:
        raise HTTPException(status_code=400, detail="El enlace de activación es inválido o ha expirado.")
    
    if isinstance(email_data, bytes):
        email = email_data.decode("utf-8")
    else:
        email = email_data

    # 2. Activar al usuario
    user = db.query(User).filter(User.email == email).first()
    if user:
        user.is_active = True
        db.commit()
        
        # 3. Borrar el token de Redis para que no se use dos veces
        redis_client.delete(f"verify:{token}")
        
        return {"message": "Cuenta activada con éxito. Ya puedes cerrar esta pestaña y loguearte."}
    
    raise HTTPException(status_code=404, detail="Usuario no encontrado")