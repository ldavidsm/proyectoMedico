import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.responses import JSONResponse, RedirectResponse
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
from starlette.requests import Request as StarletteRequest
from app.dependencies import get_current_user
from app.models.users import User, UserRole
from app.core.mail_config import send_verification_email, send_activation_button_email
from app.core.redis_config import save_code, delete_code, get_code, redis_client
from app.schemas.users import RegisterRequest, UserResponse, LoginRequest, TokenResponse, VerifyOtpRequest, ResetRequest, ResetPasswordFinal, ProfessionalProfileUpdate, ChangePassword
from app.core.security import (
    hash_password, verify_password, create_access_token, create_refresh_token,
    validate_password_strength, SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
)
from app.core.trusted import TRUSTED_USERS
from app.core.rate_limiter import limiter
from app.database import get_db
import random

router = APIRouter(prefix="/auth", tags=["auth"])

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# --- Google OAuth Config ---
config = Config(environ={
    "GOOGLE_CLIENT_ID": os.getenv("GOOGLE_CLIENT_ID", ""),
    "GOOGLE_CLIENT_SECRET": os.getenv("GOOGLE_CLIENT_SECRET", ""),
})

oauth = OAuth(config)
oauth.register(
    name="google",
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)


# --- REGISTER ---
@router.post("/register", response_model=UserResponse)
@limiter.limit("3/hour")
async def register(request: Request, data: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="El email ya está registrado")

    is_valid, error_msg = validate_password_strength(data.password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)

    if data.email in TRUSTED_USERS:
        role = UserRole.seller
    else:
        role = UserRole.buyer

    new_user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        full_name=data.full_name,
        role=UserRole.buyer.value,
        is_active=False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    verification_token = str(uuid.uuid4())
    redis_client.setex(f"verify:{verification_token}", 3600, data.email.lower())

    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
    verification_url = f"{FRONTEND_URL}/verify-account?token={verification_token}"
    await send_activation_button_email(data.email.lower(), verification_url)

    response = UserResponse.from_orm(new_user)
    response.profile_completed = False
    return response


# --- LOGIN ---
@router.post("/login")
@limiter.limit("5/minute")
def login(request: Request, data: LoginRequest, response: Response, db: Session = Depends(get_db)):
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

    role_value = user.role.value if hasattr(user.role, 'value') else str(user.role)
    token = create_access_token({"sub": str(user.id), "email": user.email, "role": role_value})
    refresh = create_refresh_token({"sub": str(user.id), "email": user.email, "role": role_value})

    json_response = JSONResponse(content={
        "access_token": token,
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
        max_age=60 * ACCESS_TOKEN_EXPIRE_MINUTES
    )
    json_response.set_cookie(
        key="refresh_token",
        value=refresh,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=60 * 60 * 24 * 7
    )
    return json_response


# --- REFRESH ---
@router.post("/refresh")
def refresh_token(request: Request, db: Session = Depends(get_db)):
    """Renueva el access_token usando el refresh_token de la cookie."""
    rt = request.cookies.get("refresh_token")
    if not rt:
        raise HTTPException(status_code=401, detail="No refresh token")

    try:
        payload = jwt.decode(rt, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Token inválido")

        user_id = payload.get("sub")
        user = db.query(User).filter(User.id == user_id).first()
        if not user or not user.is_active:
            raise HTTPException(status_code=401, detail="Usuario no válido")

        role_value = user.role.value if hasattr(user.role, 'value') else str(user.role)
        new_access_token = create_access_token(
            {"sub": str(user.id), "email": user.email, "role": role_value}
        )

        json_response = JSONResponse(content={"ok": True})
        json_response.set_cookie(
            key="access_token",
            value=new_access_token,
            httponly=True,
            secure=True,
            samesite="none",
            max_age=60 * ACCESS_TOKEN_EXPIRE_MINUTES
        )
        return json_response
    except JWTError:
        raise HTTPException(status_code=401, detail="Refresh token inválido o expirado")


# --- LOGOUT ---
@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token", samesite="none", secure=True)
    response.delete_cookie("refresh_token", samesite="none", secure=True)
    return {"message": "Logged out"}


# --- ME ---
@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    response = UserResponse.from_orm(current_user)
    profile = current_user.professional_profile
    if profile:
        response.profile_completed = profile.is_complete
    else:
        response.profile_completed = False
        response.professional_profile = None
    return response


# --- CHANGE PASSWORD ---
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
    is_valid, error_msg = validate_password_strength(data.new_password)
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error_msg)

    current_user.password_hash = hash_password(data.new_password)
    db.commit()
    return {"message": "Contraseña actualizada correctamente"}


# --- REQUEST PASSWORD RESET ---
@router.post("/request-password-reset")
@limiter.limit("3/hour")
async def request_password_reset(request: Request, data: ResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        return {"message": "Si el email existe, recibirás un código en breve"}

    code = f"{random.randint(1000, 9999)}"
    save_code(data.email, code)

    try:
        await send_verification_email(data.email, code)
        return {"message": "Código enviado al correo"}
    except Exception as e:
        print(f"Error enviando mail: {e}")
        raise HTTPException(status_code=500, detail="No se pudo enviar el correo")


# --- VERIFY OTP ---
@router.post("/verify-otp")
@limiter.limit("5/15minutes")
def verify_otp(request: Request, data: VerifyOtpRequest):
    stored_code = get_code(data.email)
    if not stored_code or stored_code != data.code:
        raise HTTPException(status_code=400, detail="Código inválido o expirado")
    return {"message": "Código verificado correctamente"}


# --- RESET PASSWORD FINAL ---
@router.post("/reset-password-final")
def reset_password_final(data: ResetPasswordFinal, db: Session = Depends(get_db)):
    stored_code = get_code(data.email)
    if not stored_code or stored_code != data.code:
        raise HTTPException(status_code=400, detail="Código inválido o expirado")

    is_valid, error_msg = validate_password_strength(data.new_password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)

    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    user.password_hash = hash_password(data.new_password)
    db.commit()
    delete_code(data.email)

    return {"message": "Tu contraseña ha sido actualizada con éxito"}


# --- CONFIRM EMAIL ---
@router.get("/confirm-email")
def confirm_email(token: str, db: Session = Depends(get_db)):
    email_data = redis_client.get(f"verify:{token}")

    if not email_data:
        raise HTTPException(status_code=400, detail="El enlace de activación es inválido o ha expirado.")

    if isinstance(email_data, bytes):
        email = email_data.decode("utf-8")
    else:
        email = email_data

    user = db.query(User).filter(User.email == email).first()
    if user:
        user.is_active = True
        db.commit()
        redis_client.delete(f"verify:{token}")
        return {"message": "Cuenta activada con éxito. Ya puedes cerrar esta pestaña y loguearte."}

    raise HTTPException(status_code=404, detail="Usuario no encontrado")


# --- RESEND VERIFICATION ---
@router.post("/resend-verification")
@limiter.limit("2/hour")
async def resend_verification(
    request: Request,
    data: ResetRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == data.email.lower()
    ).first()

    if not user or user.is_active:
        return {"message": "Si la cuenta existe y no está verificada, recibirás un nuevo email"}

    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
    verification_token = str(uuid.uuid4())
    redis_client.setex(
        f"verify:{verification_token}", 3600, data.email.lower()
    )
    verification_url = f"{FRONTEND_URL}/verify-account?token={verification_token}"

    try:
        await send_activation_button_email(data.email.lower(), verification_url)
    except Exception:
        pass

    return {"message": "Si la cuenta existe y no está verificada, recibirás un nuevo email"}


# --- GOOGLE OAUTH: inicio del flujo ---
@router.get("/google")
async def google_login(request: StarletteRequest):
    redirect_uri = os.getenv(
        "GOOGLE_REDIRECT_URI_AUTH",
        "http://localhost:8000/auth/google/callback"
    )
    return await oauth.google.authorize_redirect(request, redirect_uri)


# --- GOOGLE OAUTH: callback ---
@router.get("/google/callback")
async def google_callback(request: StarletteRequest, db: Session = Depends(get_db)):
    try:
        token = await oauth.google.authorize_access_token(request)
    except Exception:
        return RedirectResponse(f"{FRONTEND_URL}/login?error=google_auth_failed")

    user_info = token.get("userinfo")
    if not user_info:
        return RedirectResponse(f"{FRONTEND_URL}/login?error=no_user_info")

    email = user_info.get("email", "").lower()
    full_name = user_info.get("name", "")
    google_id = user_info.get("sub", "")

    if not email:
        return RedirectResponse(f"{FRONTEND_URL}/login?error=no_email")

    # Buscar usuario existente
    user = db.query(User).filter(User.email == email).first()

    if not user:
        # Registrar nuevo usuario — Google ya verificó el email
        role = UserRole.seller if email in TRUSTED_USERS else UserRole.buyer
        user = User(
            email=email,
            password_hash=hash_password(google_id + os.getenv("SECRET_KEY", "")),
            full_name=full_name,
            role=role.value,
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    elif not user.is_active:
        user.is_active = True
        db.commit()

    # Crear tokens
    role_value = user.role.value if hasattr(user.role, "value") else str(user.role)
    access_token = create_access_token({
        "sub": str(user.id),
        "email": user.email,
        "role": role_value,
    })
    refresh_token_val = create_refresh_token({
        "sub": str(user.id),
        "email": user.email,
        "role": role_value,
    })

    # Redirigir al frontend con cookies seteadas
    response = RedirectResponse(url=f"{FRONTEND_URL}/?google_login=success")
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=60 * int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")),
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token_val,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=60 * 60 * 24 * int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7")),
    )
    return response
