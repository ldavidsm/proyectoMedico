from datetime import datetime, timezone
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.orders import Order, OrderStatus
from app.models.courses import Course, Module, ContentBlock, CourseOffer, UserProgress
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
    if str(current_user.role) == UserRole.admin.value:
        return True

    if course.seller_id != current_user.id:
        raise HTTPException(403, "No tienes permiso para gestionar este curso")

    return True

def require_admin(current_user):
    if str(current_user.role) != UserRole.admin.value:
        raise HTTPException(403, "Solo administradores")
    return True


def get_accessible_blocks(
    course_id: str,
    user_id: str,
    db: Session
) -> set[str]:
    """
    Devuelve el set de block_ids accesibles para el usuario
    según el ritmo del curso (libre vs secuencial) y convocatoria.
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        return set()

    # Obtener la orden del usuario para este curso
    order = db.query(Order).join(CourseOffer).filter(
        Order.user_id == user_id,
        Order.course_id == course_id,
        Order.status == OrderStatus.paid,
    ).first()

    if not order:
        return set()

    offer = order.offer

    # Verificar fecha de inicio para convocatorias
    if offer and offer.inscription_type == 'convocatoria':
        if offer.course_start:
            now = datetime.now(timezone.utc)
            if now < offer.course_start:
                return set()

    # Obtener todos los bloques ordenados
    all_blocks = db.query(ContentBlock)\
        .join(Module, ContentBlock.module_id == Module.id)\
        .filter(Module.course_id == course_id)\
        .order_by(Module.order, ContentBlock.order)\
        .all()

    all_block_ids = [b.id for b in all_blocks]

    if course.progression_type == 'libre' or not course.progression_type:
        return set(all_block_ids)

    # Secuencial: desbloquear hasta el primer bloque no completado
    completed_ids = set(
        p.module_id for p in db.query(UserProgress).filter(
            UserProgress.user_id == user_id,
            UserProgress.course_id == course_id,
        ).all()
    )

    accessible = set()
    for block_id in all_block_ids:
        accessible.add(block_id)
        if block_id not in completed_ids:
            break

    return accessible