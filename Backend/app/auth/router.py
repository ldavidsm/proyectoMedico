import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.dependencies import get_current_user
from app.models.users import User, UserRole
from app.core.mail_config import send_verification_email, send_activation_button_email
from app.core.redis_config import save_code,delete_code, get_code, redis_client
from app.schemas.users import RegisterRequest, UserResponse, LoginRequest, TokenResponse, VerifyOtpRequest, ResetRequest, ResetPasswordFinal, ProfessionalProfileUpdate, ChangePassword
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
    response.profile_completed = False # Por defecto al registrarse
    return response

# --- LOGIN ---
@router.post("/login")
def login(data: LoginRequest, response: Response, db: Session = Depends(get_db)):
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
    token = create_access_token({"sub": str(user.id), "email": user.email})

    json_response = JSONResponse(content={
        "access_token": token, # Maintain access_token in body to avoid breaking other clients if needed, or stick to user dict
        "user": {
            "id": str(user.id),
            "email": user.email,
            "name": user.full_name,
            "role": user.role
        }
    })
    
    json_response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=True, 
        samesite="none",
        max_age=60 * 60 * 24 * 7
    )
    return json_response

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logged out"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Obtiene los datos del usuario actual, incluyendo el estado de su 
    perfil profesional y configuración de cuenta.
    """
    # 1. Transformamos el modelo de DB al Schema de respuesta
    # UserResponse ya debe tener 'profile: Optional[ProfessionalProfileSchema]'
    response = UserResponse.from_orm(current_user)
    
    # 2. Calculamos el estado del perfil
    # Usamos el perfil profesional si existe
    profile = current_user.professional_profile
    
    if profile:
        response.profile_completed = profile.is_complete
    else:
        response.profile_completed = False
        # Aseguramos que sea None si no existe
        response.professional_profile = None

    return response

@router.patch("/change-password")
def change_password(
    data: ChangePassword,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña actual es incorrecta",
        )
    if len(data.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La nueva contraseña debe tener al menos 8 caracteres",
        )
    current_user.password_hash = hash_password(data.new_password)
    db.commit()
    return {"message": "Contraseña actualizada correctamente"}


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