from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func as sa_func
from datetime import datetime, timedelta
from typing import Optional, List

from app.database import get_db
from app.dependencies import get_current_user
from app.analytics.service import AnalyticsService
from app.schemas.analytics import (
    AnalyticsReport, CourseDetailReport,
    CourseStat, RevenuePoint, StudentsPoint, AnalyticsSummary,
)
from app.models.users import User, UserRole
from app.models.courses import Course, CourseReview, UserProgress, ContentBlock, Module as CourseModule
from app.models.orders import Order, OrderStatus

router = APIRouter(prefix="/analytics", tags=["Analytics"])


# ── Existing endpoint (legacy) ────────────────────────────

@router.get("/summary", response_model=AnalyticsReport)
async def get_creator_analytics(
    period: str = Query("30", description="Periodo en días: 30, 90, all"),
    course_id: str = Query("all", description="ID del curso específico o 'all'"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if str(current_user.role) != UserRole.seller.value and str(current_user.role) != UserRole.admin.value:
        raise HTTPException(status_code=403, detail="Solo los creadores pueden acceder a las analíticas.")

    days_map = {"30": 30, "90": 90, "all": 365 * 10}
    days = days_map.get(period, 30)

    try:
        stats = AnalyticsService.get_stats(db=db, seller_id=current_user.id, course_id=course_id, days=days)
        return stats
    except Exception as e:
        print(f"Error en Analytics: {e}")
        raise HTTPException(status_code=500, detail="Error al procesar las estadísticas de rendimiento.")


@router.get("/courses-performance")
async def get_courses_table(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if str(current_user.role) != UserRole.seller.value:
        raise HTTPException(status_code=403, detail="No autorizado")
    return AnalyticsService.get_courses_performance_list(db, current_user.id)


@router.get("/course/{course_id}", response_model=CourseDetailReport)
def get_specific_course_analytics(
    course_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    course = db.query(Course).filter(Course.id == course_id, Course.seller_id == current_user.id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado o no eres el dueño")
    return AnalyticsService.get_course_detail_stats(db, course_id)


# ── New endpoints ─────────────────────────────────────────

@router.get("/overview", response_model=AnalyticsSummary)
def get_analytics_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Summary KPIs for the seller dashboard."""
    seller_id = current_user.id

    total_courses = db.query(sa_func.count(Course.id)).filter(Course.seller_id == seller_id).scalar() or 0

    # Unique students with paid orders on seller's courses
    total_students = (
        db.query(sa_func.count(sa_func.distinct(Order.user_id)))
        .join(Course, Order.course_id == Course.id)
        .filter(Course.seller_id == seller_id, Order.status == OrderStatus.paid)
        .scalar()
    ) or 0

    total_revenue = (
        db.query(sa_func.coalesce(sa_func.sum(Order.price), 0))
        .join(Course, Order.course_id == Course.id)
        .filter(Course.seller_id == seller_id, Order.status == OrderStatus.paid)
        .scalar()
    ) or 0

    avg_rating = (
        db.query(sa_func.avg(Course.rating_avg))
        .filter(Course.seller_id == seller_id, Course.status == "publicado")
        .scalar()
    ) or 0

    return AnalyticsSummary(
        total_courses=total_courses,
        total_students=total_students,
        total_revenue=float(total_revenue),
        avg_rating=round(float(avg_rating), 1),
    )


@router.get("/courses", response_model=List[CourseStat])
def get_courses_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Per-course metrics for the seller."""
    courses = db.query(Course).filter(Course.seller_id == current_user.id).all()
    result = []

    for c in courses:
        student_count = (
            db.query(sa_func.count(Order.id))
            .filter(Order.course_id == c.id, Order.status == OrderStatus.paid)
            .scalar()
        ) or 0

        revenue = (
            db.query(sa_func.coalesce(sa_func.sum(Order.price), 0))
            .filter(Order.course_id == c.id, Order.status == OrderStatus.paid)
            .scalar()
        ) or 0

        # Completion rate: students who completed all blocks / total students
        completion_rate = 0.0
        if student_count > 0:
            total_blocks = (
                db.query(sa_func.count(ContentBlock.id))
                .join(CourseModule, ContentBlock.module_id == CourseModule.id)
                .filter(CourseModule.course_id == c.id)
                .scalar()
            ) or 0

            if total_blocks > 0:
                # Count students who completed ALL blocks
                from sqlalchemy import literal_column
                completed_students = (
                    db.query(sa_func.count(sa_func.distinct(UserProgress.user_id)))
                    .filter(
                        UserProgress.course_id == c.id,
                        UserProgress.is_completed == True,
                    )
                    .scalar()
                ) or 0
                completion_rate = round((completed_students / student_count) * 100, 1)

        result.append(CourseStat(
            id=c.id,
            title=c.title,
            status=c.status or "borrador",
            student_count=student_count,
            revenue=float(revenue),
            rating_avg=float(c.rating_avg or 0),
            rating_count=int(c.rating_count or 0),
            completion_rate=completion_rate,
        ))

    return result


@router.get("/revenue-over-time", response_model=List[RevenuePoint])
def get_revenue_over_time(
    period: int = Query(30, description="Period in days: 7, 30, 90"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Revenue evolution grouped by day/week/month depending on period."""
    since = datetime.utcnow() - timedelta(days=period)

    if period <= 7:
        trunc = "day"
    elif period <= 30:
        trunc = "week"
    else:
        trunc = "month"

    rows = (
        db.query(
            sa_func.date_trunc(trunc, Order.created_at).label("bucket"),
            sa_func.coalesce(sa_func.sum(Order.price), 0).label("revenue"),
            sa_func.count(Order.id).label("purchases"),
        )
        .join(Course, Order.course_id == Course.id)
        .filter(
            Course.seller_id == current_user.id,
            Order.status == OrderStatus.paid,
            Order.created_at >= since,
        )
        .group_by("bucket")
        .order_by("bucket")
        .all()
    )

    day_names = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
    month_names = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

    result = []
    for i, r in enumerate(rows):
        if period <= 7:
            label = day_names[r.bucket.weekday()] if r.bucket else f"Día {i+1}"
        elif period <= 30:
            label = f"Sem {i+1}"
        else:
            label = month_names[r.bucket.month - 1] if r.bucket else f"Mes {i+1}"

        result.append(RevenuePoint(
            label=label,
            revenue=float(r.revenue),
            purchases=int(r.purchases),
        ))

    return result


@router.get("/students-over-time", response_model=List[StudentsPoint])
def get_students_over_time(
    period: int = Query(30, description="Period in days: 7, 30, 90"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """New students over time grouped by day/week/month."""
    since = datetime.utcnow() - timedelta(days=period)

    if period <= 7:
        trunc = "day"
    elif period <= 30:
        trunc = "week"
    else:
        trunc = "month"

    rows = (
        db.query(
            sa_func.date_trunc(trunc, Order.created_at).label("bucket"),
            sa_func.count(sa_func.distinct(Order.user_id)).label("students"),
        )
        .join(Course, Order.course_id == Course.id)
        .filter(
            Course.seller_id == current_user.id,
            Order.status == OrderStatus.paid,
            Order.created_at >= since,
        )
        .group_by("bucket")
        .order_by("bucket")
        .all()
    )

    day_names = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
    month_names = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

    result = []
    for i, r in enumerate(rows):
        if period <= 7:
            label = day_names[r.bucket.weekday()] if r.bucket else f"Día {i+1}"
        elif period <= 30:
            label = f"Sem {i+1}"
        else:
            label = month_names[r.bucket.month - 1] if r.bucket else f"Mes {i+1}"

        result.append(StudentsPoint(label=label, students=int(r.students)))

    return result
