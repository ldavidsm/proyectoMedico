from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.users import SellerRequest
from app.dependencies import get_current_user
from pydantic import BaseModel
from typing import Optional
import uuid

router = APIRouter(prefix="/seller-requests", tags=["Seller Requests"])

class SellerRequestCreate(BaseModel):
    bio: str
    education: Optional[str] = None
    achievements: Optional[str] = None
    experience_years: int = 0
    linkedin_url: Optional[str] = None
    website_url: Optional[str] = None

@router.post("/")
def create_seller_request(
    data: SellerRequestCreate,
    current_user = Depends(get_current_user),
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
        bio=data.bio,
        education=data.education,
        achievements=data.achievements,
        experience_years=data.experience_years,
        linkedin_url=data.linkedin_url,
        website_url=data.website_url,
        status="pending"
    )
    db.add(request)
    db.commit()
    db.refresh(request)
    return {"message": "Solicitud enviada correctamente", "id": request.id}
