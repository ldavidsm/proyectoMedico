from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.users import User, ProfessionalProfile, PrivacySettings
from app.schemas.users import ProfessionalProfileUpdate
from app.schemas.security import AccountUpdate, PrivacySettingsUpdate

router = APIRouter(prefix="/profile", tags=["profile"])


# --- 1. ACTUALIZACIÓN DE CUENTA (Datos básicos del User) ---
@router.patch("/account")
def update_account(
    data: AccountUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Build full_name from firstName + lastName if provided
    if data.firstName is not None or data.lastName is not None:
        # Split existing full_name to get current parts
        existing_parts = (current_user.full_name or "").split(" ", 1)
        current_first = existing_parts[0] if existing_parts else ""
        current_last = existing_parts[1] if len(existing_parts) > 1 else ""

        new_first = data.firstName if data.firstName is not None else current_first
        new_last = data.lastName if data.lastName is not None else current_last
        current_user.full_name = f"{new_first} {new_last}".strip()

    if data.email is not None:
        current_user.email = data.email

    db.commit()
    db.refresh(current_user)

    # Return the updated fields
    name_parts = (current_user.full_name or "").split(" ", 1)
    return {
        "firstName": name_parts[0] if name_parts else "",
        "lastName": name_parts[1] if len(name_parts) > 1 else "",
        "email": current_user.email,
        "language": data.language,
    }


# --- 2. VERIFICACIÓN Y PERFIL PROFESIONAL (Unificado) ---
@router.patch("/professional", status_code=status.HTTP_200_OK)
def update_professional_profile(
    data: ProfessionalProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = current_user.professional_profile

    # Si no existe (primera vez), lo creamos
    if not profile:
        profile = ProfessionalProfile(user_id=current_user.id)
        db.add(profile)

    # Update full_name on User if firstName/lastName provided
    if data.firstName is not None or data.lastName is not None:
        existing_parts = (current_user.full_name or "").split(" ", 1)
        current_first = existing_parts[0] if existing_parts else ""
        current_last = existing_parts[1] if len(existing_parts) > 1 else ""

        new_first = data.firstName if data.firstName is not None else current_first
        new_last = data.lastName if data.lastName is not None else current_last
        current_user.full_name = f"{new_first} {new_last}".strip()

    # Map schema fields to model columns
    field_mapping = {
        "bio": "bio",
        "contact_email": "contact_email",
        "contact_phone": "contact_phone",
        "credentials": "credentials",
        "country": "country",
        "role": "role",
        "formation_level": "formation_level",
        "specialties": "specialties",
        "professional_status": "professional_status",
        "is_accredited": "is_accredited",
        "accept_terms": "accept_terms",
        "accept_responsible_use": "accept_responsible_use",
    }

    update_data = data.dict(exclude_unset=True, by_alias=True)

    for key, value in update_data.items():
        if key in field_mapping and hasattr(profile, field_mapping[key]):
            setattr(profile, field_mapping[key], value)

    # Auto-complete logic
    if profile.country and profile.role and profile.accept_terms:
        profile.is_complete = True

    db.commit()
    return {
        "message": "Perfil actualizado con éxito",
        "is_complete": profile.is_complete,
        "verification_status": profile.verification_status,
    }


# --- 3. CONFIGURACIÓN DE PRIVACIDAD ---
@router.put("/privacy", status_code=status.HTTP_200_OK)
def update_privacy(
    data: PrivacySettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    privacy = (
        db.query(PrivacySettings)
        .filter(PrivacySettings.user_id == current_user.id)
        .first()
    )

    if not privacy:
        privacy = PrivacySettings(user_id=current_user.id)
        db.add(privacy)

    privacy.public_profile = data.publicProfile
    privacy.show_email = data.showEmail
    privacy.show_specialty = data.showSpecialty

    db.commit()
    return {"message": "Configuración de privacidad guardada"}
