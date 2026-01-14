from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.users import User, SellerRequest, UserRole, SellerProfile
from app.schemas.users import UserResponse
from app.dependencies import get_current_user

router = APIRouter()

# Dependencia: solo admin
def admin_required(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="No autorizado")
    return current_user

# ------------------------
# Listar todos los usuarios
# ------------------------
@router.get("/users", response_model=List[UserResponse])
def list_users(db: Session = Depends(get_db), current_user: User = Depends(admin_required)):
    return db.query(User).all()

# ------------------------
# Ver detalle de un usuario
# ------------------------
@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: str, db: Session = Depends(get_db), current_user: User = Depends(admin_required)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user

# ------------------------
# Listar solicitudes de seller
# ------------------------
@router.get("/seller-requests")
def list_seller_requests(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    requests = db.query(SellerRequest).filter(SellerRequest.status == "pending").all()
    return requests
# ------------------------
# Aprobar o rechazar solicitud de seller
# ------------------------
@router.patch("/seller-requests/{request_id}")
def approve_seller_request(request_id: str, approve: bool, db: Session = Depends(get_db), current_user: User = Depends(admin_required)):
    request = db.query(SellerRequest).filter(SellerRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    
    if approve:
        request.user.role = UserRole.seller
        request.approved = True
    else:
        request.approved = False

    db.commit()
    return {"message": f"Solicitud {'aprobada' if approve else 'rechazada'}"}


@router.patch("/sellers/{user_id}/verify")
def verify_seller(
    user_id: str,
    current_admin: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_admin.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Solo admin")

    profile = db.query(SellerProfile).filter(
        SellerProfile.user_id == user_id
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")

    profile.is_verified = True
    db.commit()

    return {"message": "Seller verificado"}
