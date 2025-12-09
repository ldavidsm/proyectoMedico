from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.users import User, UserRole, SellerRequest
from app.core.security import verify_password, hash_password
from app.schemas.users import UserResponse, UserUpdate, ChangePassword
from app.models.orders import Order, OrderStatus

router = APIRouter(prefix="/users", tags=["Users"])

#__OBTENER PERFIL__
@router.get("/me", response_model=UserResponse)
def get_my_profile(
    current_user: User = Depends(get_current_user)
):
    return current_user

#__UPDATE PERFIL__
@router.put("/me", response_model=UserResponse)
def update_my_profile(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if data.full_name:
        current_user.full_name = data.full_name

    db.commit()
    db.refresh(current_user)
    return current_user
#__CAMBIAR PASSWORD__
@router.post("/change-password")
def change_password(
    data: ChangePassword,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # 1. Validar contraseña actual
    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña actual es incorrecta"
        )

    # 2. Validar longitud mínima
    if len(data.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La nueva contraseña debe tener al menos 6 caracteres"
        )

    # 3. Crear hash de la nueva contraseña
    current_user.password_hash = hash_password(data.new_password)

    # 4. Guardar cambios
    db.commit()

    return {"message": "Contraseña actualizada correctamente"}

#__SELLER REQUEST__
@router.post("/request-seller")
def request_seller(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Solo buyers pueden solicitar
    if current_user.role != UserRole.buyer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya eres seller o admin"
        )

    # Verificar si ya hay solicitud pendiente
    existing_request = db.query(SellerRequest).filter(
        SellerRequest.user_id == current_user.id,
        SellerRequest.status == "pending"
    ).first()
    if existing_request:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya tienes una solicitud pendiente"
        )

    # Crear nueva solicitud
    seller_request = SellerRequest(user_id=current_user.id)
    db.add(seller_request)
    db.commit()
    db.refresh(seller_request)

    return {"message": "Solicitud de seller enviada, pendiente de aprobación"}



@router.get("/courses")
def get_my_courses(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    orders = db.query(Order).filter(
        Order.user_id == current_user.id,
        Order.status == OrderStatus.paid
    ).all()

    return [o.course for o in orders]