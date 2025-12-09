from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.orders import OrderCreate, OrderResponse
from app.models.orders import Order, OrderStatus
from app.models.courses import Course

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/", response_model=OrderResponse)
def create_order(
    data: OrderCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    # 1. Verificar que el curso exista
    course = db.query(Course).filter(Course.id == data.course_id).first()
    if not course:
        raise HTTPException(404, "Course not found")

    # 2. Verificar que el usuario no compró antes el curso
    existing = db.query(Order).filter(
        Order.course_id == data.course_id,
        Order.user_id == user.id,
        Order.status == OrderStatus.paid
    ).first()

    if existing:
        raise HTTPException(400, "Course already purchased")

    # 3. Crear orden con precio congelado
    order = Order(
        user_id=user.id,
        course_id=course.id,
        price=course.price,
        status=OrderStatus.pending
    )

    db.add(order)
    db.commit()
    db.refresh(order)

    return order

#__PAGO FICTICIO__
@router.post("/{order_id}/pay", response_model=OrderResponse)
def mock_payment(
    order_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(404, "Order not found")

    if order.user_id != user.id:
        raise HTTPException(403, "Not your order")

    if order.status != OrderStatus.pending:
        raise HTTPException(400, "Order is not pending")

    # Simulación de pago exitoso
    order.status = OrderStatus.paid
    db.commit()
    db.refresh(order)

    return order

#__OBTENER ORDENES__
@router.get("/", response_model=list[OrderResponse])
def list_my_orders(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    orders = db.query(Order).filter(Order.user_id == user.id).all()
    return orders


#__REFUND__
@router.post("/{order_id}/refund", response_model=OrderResponse)
def refund_order(
    order_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(404, "Order not found")

    if order.user_id != user.id:
        raise HTTPException(403, "Not your order")

    if order.status != OrderStatus.paid:
        raise HTTPException(400, "Order must be paid first")

    # MOCK refund
    order.status = OrderStatus.refunded
    db.commit()
    db.refresh(order)

    return order
