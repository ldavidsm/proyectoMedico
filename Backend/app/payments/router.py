from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.models.orders import Order  # debes crear este modelo si no lo tienes
from app.models.users import User
from app.dependencies import get_current_user

router = APIRouter(prefix="/payments", tags=["Payments"])


# --- WEBHOOK MOCK ---
@router.post("/mock-confirm")
def mock_confirm_payment(order_id: str, 
                         db: Session = Depends(get_db),
                         current_user: User = Depends(get_current_user)):

    # Solo admin puede confirmar pagos
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Solo admin puede confirmar pagos")

    # Buscar la orden
    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Orden no encontrada")

    if order.status != "pending":
        raise HTTPException(status_code=400, detail=f"La orden ya está en estado {order.status}")

    # Confirmar el pago
    order.status = "paid"
    order.paid_at = datetime.utcnow()

    db.commit()
    db.refresh(order)

    return {
        "message": "Pago simulado confirmado",
        "order": {
            "id": order.id,
            "status": order.status,
            "price": order.price,
            "paid_at": order.paid_at,
            "user_id": order.user_id,
            "course_id": order.course_id
        }
    }
