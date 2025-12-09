
from fastapi import HTTPException
from app.models.orders import Order, OrderStatus
from sqlalchemy.orm import Session
from app.models.users import UserRole


def user_has_course(db: Session, user_id: str, course_id: str) -> bool:
    return db.query(Order).filter(
        Order.user_id == user_id,
        Order.course_id == course_id,
        Order.status == OrderStatus.paid
    ).first() is not None


def require_course_access(db: Session, user_id: str, course_id: str):
    """Lanza excepción si el usuario NO tiene acceso al curso."""
    if not user_has_course(db, user_id, course_id):
        raise HTTPException(
            status_code=403,
            detail="No has comprado este curso."
        )
def require_course_owner_or_admin(current_user, course):
    """Permite acceso solo al dueño del curso o al admin."""
    if current_user.role == UserRole.admin:
        return True

    if course.seller_id != current_user.id:
        raise HTTPException(403, "No tienes permiso para gestionar este curso")

    return True

def require_admin(current_user):
    if current_user.role != UserRole.admin:
        raise HTTPException(403, "Solo administradores")
    return True