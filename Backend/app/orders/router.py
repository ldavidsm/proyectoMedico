from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.dependencies import get_current_user
from app.models.orders import Order, OrderStatus
from app.models.courses import Course, CourseOffer
from app.schemas.orders import OrderCreate, OrderResponse

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # 1. Verificar que la oferta existe y pertenece al curso
    offer = db.query(CourseOffer).filter(
        CourseOffer.id == order_in.offer_id,
        CourseOffer.course_id == order_in.course_id
    ).first()

    if not offer:
        raise HTTPException(
            status_code=404, 
            detail="La oferta seleccionada no existe para este curso"
        )

    # 2. Crear la orden con el precio de la oferta
    new_order = Order(
        user_id=current_user.id,
        course_id=order_in.course_id,
        offer_id=order_in.offer_id,
        price=offer.price_base,
        status=OrderStatus.pending
    )

    # 3. Si el precio es 0, marcar como pagada automáticamente (Inscripción gratuita)
    if offer.price_base <= 0:
        new_order.status = OrderStatus.paid

    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return new_order

@router.get("/my-orders", response_model=List[OrderResponse])
async def get_my_orders(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return db.query(Order).filter(Order.user_id == current_user.id).all()

@router.post("/{order_id}/pay", response_model=OrderResponse)
async def process_payment_mock(
    order_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    
    order.status = OrderStatus.paid
    db.commit()
    db.refresh(order)
    return order