from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import datetime, timedelta

from app.database import get_db
from app.dependencies import get_current_user
from app.models.users import User, UserRole
from app.models.courses import Course, UserProgress, ContentBlock, Module
from app.models.orders import Order, OrderStatus

router = APIRouter(prefix="/seller", tags=["seller-students"])


def require_seller_or_admin(current_user: User = Depends(get_current_user)):
    if current_user.role not in (UserRole.seller, UserRole.admin):
        raise HTTPException(status_code=403, detail="Solo sellers o admins pueden acceder")
    return current_user


def _total_blocks_for_course(db: Session, course_id: str) -> int:
    return (
        db.query(func.count(ContentBlock.id))
        .join(Module, ContentBlock.module_id == Module.id)
        .filter(Module.course_id == course_id)
        .scalar()
        or 0
    )


def _completed_blocks_for_student(db: Session, user_id: str, course_id: str) -> int:
    return (
        db.query(func.count(UserProgress.id))
        .filter(
            UserProgress.user_id == user_id,
            UserProgress.course_id == course_id,
            UserProgress.is_completed == True,
        )
        .scalar()
        or 0
    )


@router.get("/students")
def get_seller_students(
    course_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    progress_min: Optional[float] = Query(None, ge=0, le=100),
    progress_max: Optional[float] = Query(None, ge=0, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_seller_or_admin),
):
    # 1. Get seller's courses (optionally filtered by course_id)
    courses_query = db.query(Course).filter(Course.seller_id == current_user.id)
    if course_id:
        courses_query = courses_query.filter(Course.id == course_id)
    seller_courses = courses_query.all()

    if not seller_courses:
        return []

    course_map = {c.id: c for c in seller_courses}
    seller_course_ids = list(course_map.keys())

    # 2. Get paid orders for those courses
    orders = (
        db.query(Order)
        .filter(Order.course_id.in_(seller_course_ids), Order.status == OrderStatus.paid)
        .all()
    )

    results = []

    for order in orders:
        student = db.query(User).filter(User.id == order.user_id).first()
        if not student:
            continue

        # Search filter
        if search:
            sl = search.lower()
            name_ok = student.full_name and sl in student.full_name.lower()
            email_ok = student.email and sl in student.email.lower()
            if not name_ok and not email_ok:
                continue

        c_id = order.course_id
        course = course_map[c_id]

        total_blocks = _total_blocks_for_course(db, c_id)
        completed_blocks = _completed_blocks_for_student(db, student.id, c_id)

        progress_percentage = (
            round((completed_blocks / total_blocks) * 100, 1) if total_blocks > 0 else 0.0
        )

        # Progress range filters
        if progress_min is not None and progress_percentage < progress_min:
            continue
        if progress_max is not None and progress_percentage > progress_max:
            continue

        # Last activity: MAX(completed_at) for that student+course
        last_activity = (
            db.query(func.max(UserProgress.completed_at))
            .filter(
                UserProgress.user_id == student.id,
                UserProgress.course_id == c_id,
            )
            .scalar()
        )

        results.append(
            {
                "student_id": student.id,
                "student_name": student.full_name or student.email,
                "student_email": student.email,
                "course_id": c_id,
                "course_title": course.title,
                "enrolled_at": order.created_at.isoformat() if order.created_at else None,
                "progress_percentage": progress_percentage,
                "completed_blocks": completed_blocks,
                "total_blocks": total_blocks,
                "last_activity": last_activity.isoformat() if last_activity else None,
                "order_price": order.price or 0.0,
            }
        )

    return results


@router.get("/students/summary")
def get_seller_students_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_seller_or_admin),
):
    seller_course_ids = [
        row[0]
        for row in db.query(Course.id).filter(Course.seller_id == current_user.id).all()
    ]

    if not seller_course_ids:
        return {
            "total_students": 0,
            "active_students": 0,
            "avg_completion": 0.0,
            "students_this_month": 0,
        }

    orders = (
        db.query(Order)
        .filter(Order.course_id.in_(seller_course_ids), Order.status == OrderStatus.paid)
        .all()
    )

    unique_students = {o.user_id for o in orders}
    total_students = len(unique_students)

    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    students_this_month = (
        db.query(func.count(Order.id))
        .filter(
            Order.course_id.in_(seller_course_ids),
            Order.status == OrderStatus.paid,
            Order.created_at >= thirty_days_ago,
        )
        .scalar()
        or 0
    )

    active_students = 0
    total_progress = 0.0
    count = len(orders)

    for order in orders:
        total_blocks = _total_blocks_for_course(db, order.course_id)
        completed = _completed_blocks_for_student(db, order.user_id, order.course_id)
        pct = (completed / total_blocks * 100) if total_blocks > 0 else 0.0
        if pct > 0:
            active_students += 1
        total_progress += pct

    avg_completion = round(total_progress / count, 1) if count > 0 else 0.0

    return {
        "total_students": total_students,
        "active_students": active_students,
        "avg_completion": avg_completion,
        "students_this_month": students_this_month,
    }
