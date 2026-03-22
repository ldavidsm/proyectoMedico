from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.users import SellerRequest, ProfessionalProfile
from app.dependencies import get_current_user
from app.services.s3_service import S3Service
from pydantic import BaseModel
from typing import Optional, List
import uuid

router = APIRouter(prefix="/seller-requests", tags=["Seller Requests"])


class SellerRequestCreate(BaseModel):
    # Flujo
    flow_type: str = 'new_user'

    # Perfil profesional (solo new_user)
    country: Optional[str] = None
    profession: Optional[str] = None
    education_level: Optional[str] = None
    specialty: Optional[str] = None
    college_number: Optional[str] = None

    # Comunes
    bio: Optional[str] = None
    education: Optional[str] = None
    achievements: Optional[str] = None
    experience_years: int = 0
    content_types: Optional[list] = None
    languages: Optional[list] = None
    teaching_experience: Optional[str] = None
    motivation: Optional[list] = None
    legal_accepted: bool = False
    document_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    website_url: Optional[str] = None


@router.get("/my-status")
def get_my_request_status(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Devuelve el estado de la solicitud del usuario actual."""
    request = db.query(SellerRequest).filter(
        SellerRequest.user_id == current_user.id
    ).order_by(SellerRequest.created_at.desc()).first()

    if not request:
        return None

    return {
        "id": request.id,
        "status": request.status,
        "created_at": str(request.created_at),
        "reviewed_at": str(request.reviewed_at) if request.reviewed_at else None,
        "bio": request.bio,
        "experience_years": request.experience_years,
    }


@router.post("/")
def create_seller_request(
    data: SellerRequestCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verificar que no tenga ya una solicitud pendiente
    existing = db.query(SellerRequest).filter(
        SellerRequest.user_id == current_user.id,
        SellerRequest.status == "pending"
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya tienes una solicitud pendiente")

    request = SellerRequest(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        flow_type=data.flow_type,
        bio=data.bio,
        education=data.education,
        achievements=data.achievements,
        experience_years=data.experience_years,
        linkedin_url=data.linkedin_url,
        website_url=data.website_url,
        document_url=data.document_url,
        country=data.country,
        profession=data.profession,
        education_level=data.education_level,
        specialty=data.specialty,
        college_number=data.college_number,
        content_types=data.content_types,
        languages=data.languages,
        teaching_experience=data.teaching_experience,
        motivation=data.motivation,
        legal_accepted=data.legal_accepted,
        legal_accepted_at=datetime.now(timezone.utc) if data.legal_accepted else None,
        status="pending"
    )
    db.add(request)

    # Auto-create ProfessionalProfile for new_user flow
    if data.flow_type == 'new_user' and data.college_number:
        existing_profile = db.query(ProfessionalProfile).filter(
            ProfessionalProfile.user_id == current_user.id
        ).first()

        if not existing_profile:
            profile = ProfessionalProfile(
                user_id=current_user.id,
                country=data.country,
                role=data.profession,
                formation_level=data.education_level,
                specialties=[data.specialty] if data.specialty else [],
                credentials=data.college_number,
                accept_terms=data.legal_accepted,
                is_complete=True,
            )
            db.add(profile)

    db.commit()
    db.refresh(request)
    return {"message": "Solicitud enviada correctamente", "id": request.id}


@router.post("/upload-document-url")
def get_document_upload_url(
    file_name: str = Query(...),
    content_type: str = Query("application/octet-stream"),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Genera presigned URL para subir documento de acreditación a S3."""
    extension = file_name.rsplit(".", 1)[-1] if "." in file_name else "pdf"
    s3_key = f"seller-docs/{current_user.id}/{uuid.uuid4()}.{extension}"

    try:
        s3 = S3Service()
        upload_url = s3.generate_presigned_upload_url(s3_key, content_type, expires_in=300)
        file_url = s3.get_public_url(s3_key)
        return {"upload_url": upload_url, "file_url": file_url}
    except Exception:
        return {"upload_url": None, "file_url": None,
                "warning": "Documento no subido a S3"}
