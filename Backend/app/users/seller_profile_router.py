from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.users import User, UserRole, SellerProfile
from app.schemas.users import SellerProfileResponse, SellerProfileUpdate

router = APIRouter(prefix="/seller-profile", tags=["Seller Profile"])


@router.get("/{user_id}", response_model=SellerProfileResponse)
def get_seller_profile(user_id: str, db: Session = Depends(get_db)):
    profile = db.query(SellerProfile).filter(SellerProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Perfil de seller no encontrado")
    return profile


@router.get("/me", response_model=SellerProfileResponse)
def get_my_seller_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.seller:
        raise HTTPException(status_code=403, detail="No eres seller")

    profile = db.query(SellerProfile).filter(
        SellerProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")

    return profile


@router.put("/me", response_model=SellerProfileResponse)
def update_seller_profile(
    data: SellerProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != UserRole.seller:
        raise HTTPException(status_code=403, detail="No eres seller")

    profile = db.query(SellerProfile).filter(
        SellerProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")

    for field, value in data.dict(exclude_unset=True).items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile
