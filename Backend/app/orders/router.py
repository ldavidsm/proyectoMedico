from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app.dependencies import get_current_user
from app.models.orders import Order, OrderStatus
from app.models.courses import Course, CourseOffer
from app.models.users import User
from app.models.cohorts import Cohort, CohortMember
from app.schemas.orders import OrderCreate, OrderResponse
from app.notifications.service import create_notification

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

    # 2. Validar inscripción por convocatoria
    if offer.inscription_type == 'convocatoria':
        now = datetime.now(timezone.utc)

        if offer.enrollment_start and now < offer.enrollment_start:
            raise HTTPException(
                status_code=400,
                detail="El período de inscripción aún no ha comenzado"
            )
        if offer.enrollment_end and now > offer.enrollment_end:
            raise HTTPException(
                status_code=400,
                detail="El período de inscripción ha cerrado"
            )

        if offer.max_students:
            enrolled_count = db.query(func.count(Order.id)).filter(
                Order.course_id == order_in.course_id,
                Order.offer_id == order_in.offer_id,
                Order.status == OrderStatus.paid,
            ).scalar() or 0

            if enrolled_count >= offer.max_students:
                raise HTTPException(
                    status_code=400,
                    detail=f"No hay plazas disponibles. "
                           f"Máximo {offer.max_students} estudiantes."
                )

    # 3. Crear la orden con el precio de la oferta
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

    # 4. Send enrollment notification for free courses (paid immediately)
    if new_order.status == OrderStatus.paid:
        course = db.query(Course).filter(Course.id == order_in.course_id).first()
        course_title = course.title if course else "el curso"
        create_notification(
            db=db,
            user_id=current_user.id,
            type="enrollment",
            title="¡Inscripción confirmada!",
            message=f"Ya tienes acceso a {course_title}. ¡Comienza cuando quieras!",
            metadata={"courseId": order_in.course_id},
        )

        # 5. Auto-assign to active cohort if convocatoria
        if offer.inscription_type == 'convocatoria':
            active_cohort = db.query(Cohort).filter(
                Cohort.offer_id == new_order.offer_id,
                Cohort.is_active == True,
            ).order_by(Cohort.course_start.asc()).first()

            if active_cohort:
                existing_member = db.query(CohortMember).filter(
                    CohortMember.cohort_id == active_cohort.id,
                    CohortMember.student_id == current_user.id,
                ).first()

                if not existing_member:
                    member = CohortMember(
                        cohort_id=active_cohort.id,
                        student_id=current_user.id,
                        order_id=new_order.id,
                    )
                    db.add(member)
                    db.commit()

    return new_order

@router.get("/my-orders")
async def get_my_orders(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    orders = db.query(Order).filter(
        Order.user_id == current_user.id
    ).order_by(Order.created_at.desc()).all()

    result = []
    for order in orders:
        course = db.query(Course).filter(Course.id == order.course_id).first()
        status_val = order.status.value if hasattr(order.status, 'value') else order.status

        seller_name = None
        if course:
            seller = db.query(User).filter(User.id == course.seller_id).first()
            seller_name = seller.full_name if seller else None

        result.append({
            "id": order.id,
            "user_id": order.user_id,
            "course_id": order.course_id,
            "offer_id": order.offer_id,
            "price": order.price,
            "status": status_val,
            "created_at": order.created_at.isoformat() if order.created_at else None,
            "course": {
                "id": course.id,
                "title": course.title,
                "category": course.category,
                "banner_url": course.banner_url,
                "seller_id": course.seller_id,
                "seller_name": seller_name,
                "rating_avg": float(course.rating_avg or 0),
            } if course else None,
        })
    return result

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

    # Send enrollment notification
    course = db.query(Course).filter(Course.id == order.course_id).first()
    course_title = course.title if course else "el curso"
    create_notification(
        db=db,
        user_id=current_user.id,
        type="enrollment",
        title="¡Inscripción confirmada!",
        message=f"Ya tienes acceso a {course_title}. ¡Comienza cuando quieras!",
        metadata={"courseId": order.course_id},
    )

    # Auto-assign to active cohort if convocatoria
    paid_offer = db.query(CourseOffer).filter(
        CourseOffer.id == order.offer_id
    ).first()
    if paid_offer and paid_offer.inscription_type == 'convocatoria':
        active_cohort = db.query(Cohort).filter(
            Cohort.offer_id == order.offer_id,
            Cohort.is_active == True,
        ).order_by(Cohort.course_start.asc()).first()

        if active_cohort:
            existing_member = db.query(CohortMember).filter(
                CohortMember.cohort_id == active_cohort.id,
                CohortMember.student_id == current_user.id,
            ).first()
            if not existing_member:
                member = CohortMember(
                    cohort_id=active_cohort.id,
                    student_id=current_user.id,
                    order_id=order.id,
                )
                db.add(member)
                db.commit()

    return order