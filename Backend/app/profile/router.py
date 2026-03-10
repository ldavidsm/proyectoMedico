from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.users import User, ProfessionalProfile, PrivacySettings
from app.schemas.users import (ProfessionalProfileUpdate)
from app.schemas.security import (AccountUpdate, PrivacySettingsUpdate)

router = APIRouter(prefix="/profile", tags=["profile"])

# --- 1. ACTUALIZACIÓN DE CUENTA (Datos básicos del User) ---
@router.patch("/account", response_model=AccountUpdate)
def update_account(
    data: AccountUpdate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    # Campos que pertenecen a la tabla 'User'
    if data.firstName: current_user.first_name = data.firstName
    if data.lastName: current_user.last_name = data.lastName
    if data.email: current_user.email = data.email
    if data.language: current_user.language = data.language
    if data.timezone: current_user.timezone = data.timezone
    
    db.commit()
    db.refresh(current_user)
    return current_user

# --- 2. VERIFICACIÓN Y PERFIL PROFESIONAL (Unificado) ---
# Este endpoint sirve tanto para el Modal de registro como para la edición
@router.patch("/professional", status_code=status.HTTP_200_OK)
def update_professional_profile(
    data: ProfessionalProfileUpdate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    profile = current_user.professional_profile
    
    # Si no existe (primera vez en el modal), lo creamos
    if not profile:
        profile = ProfessionalProfile(user_id=current_user.id)
        db.add(profile)

    # Convertimos el JSON a diccionario mapeando los alias (ej: educationLevel -> formation_level)
    # exclude_unset=True evita que los campos que no vienen en el JSON se pongan como null
    update_data = data.dict(exclude_unset=True, by_alias=True)

    # Lógica especial para 'specialty' (si viene como string único en lugar de lista)
    if "specialty" in update_data and update_data["specialty"]:
        profile.specialties = [update_data["specialty"]]
        del update_data["specialty"] # Lo quitamos para no duplicar en el bucle

    # Actualizamos los campos de la tabla ProfessionalProfile
    for key, value in update_data.items():
        if hasattr(profile, key):
            setattr(profile, key, value)

    # Lógica de autocompletado: Si llenó lo básico y aceptó términos, el perfil está listo
    if profile.country and profile.role and profile.accept_terms:
        profile.is_complete = True

    db.commit()
    return {
        "message": "Perfil actualizado con éxito",
        "is_complete": profile.is_complete,
        "verification_status": profile.verification_status
    }

# --- 3. CONFIGURACIÓN DE PRIVACIDAD ---
@router.put("/privacy", status_code=status.HTTP_200_OK)
def update_privacy(
    data: PrivacySettingsUpdate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    privacy = db.query(PrivacySettings).filter(PrivacySettings.user_id == current_user.id).first()
    
    if not privacy:
        privacy = PrivacySettings(user_id=current_user.id)
        db.add(privacy)
    
    # Mapeamos los datos del JSON (camelCase) a la DB (snake_case)
    privacy.public_profile = data.publicProfile
    privacy.show_email = data.showEmail
    privacy.show_specialty = data.showSpecialty
    privacy.allow_messages = data.allowMessages
    
    db.commit()
    return {"message": "Configuración de privacidad guardada"}