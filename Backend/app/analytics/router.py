from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func as sa_func
from datetime import datetime, timedelta, timezone
from collections import defaultdict
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

import logging
logger = logging.getLogger(__name__)

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
        logger.error(f"Error en Analytics: {e}")
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
    course_id: str = Query("all"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Summary KPIs for the seller dashboard."""
    seller_id = current_user.id

    if course_id != "all":
        # Single course overview
        course = db.query(Course).filter(Course.id == course_id, Course.seller_id == seller_id).first()
        if not course:
            return AnalyticsSummary(total_courses=0, total_students=0, total_revenue=0, avg_rating=0)

        total_students = (
            db.query(sa_func.count(sa_func.distinct(Order.user_id)))
            .filter(Order.course_id == course_id, Order.status == OrderStatus.paid)
            .scalar()
        ) or 0
        total_revenue = (
            db.query(sa_func.coalesce(sa_func.sum(Order.price), 0))
            .filter(Order.course_id == course_id, Order.status == OrderStatus.paid)
            .scalar()
        ) or 0
        return AnalyticsSummary(
            total_courses=1,
            total_students=total_students,
            total_revenue=float(total_revenue),
            avg_rating=round(float(course.rating_avg or 0), 1),
        )

    total_courses = db.query(sa_func.count(Course.id)).filter(Course.seller_id == seller_id).scalar() or 0

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
    course_id: str = Query("all"),
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

    query = (
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
    )
    if course_id != "all":
        query = query.filter(Order.course_id == course_id)

    rows = query.group_by("bucket").order_by("bucket").all()

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
    course_id: str = Query("all"),
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

    query = (
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
    )
    if course_id != "all":
        query = query.filter(Order.course_id == course_id)

    rows = query.group_by("bucket").order_by("bucket").all()

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


@router.get("/retention")
def get_retention_data(
    course_id: str = Query("all"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retención real por mes de inscripción.
    Para cada mes calcula qué porcentaje de estudiantes
    sigue activo (tiene UserProgress) en la semana 4.
    """
    if str(current_user.role) not in [UserRole.seller.value, UserRole.admin.value]:
        raise HTTPException(status_code=403, detail="Solo creadores pueden ver retención")

    seller_courses = db.query(Course.id).filter(Course.seller_id == current_user.id)
    if course_id != "all":
        seller_courses = seller_courses.filter(Course.id == course_id)
    course_ids = [r[0] for r in seller_courses.all()]

    if not course_ids:
        return []

    since = datetime.now(timezone.utc) - timedelta(days=365)

    orders = db.query(
        Order.id, Order.user_id, Order.course_id, Order.created_at
    ).filter(
        Order.course_id.in_(course_ids),
        Order.status == OrderStatus.paid,
        Order.created_at >= since,
    ).all()

    if not orders:
        return []

    monthly = defaultdict(list)
    for order in orders:
        created = order.created_at
        if hasattr(created, 'tzinfo') and created.tzinfo:
            created = created.replace(tzinfo=None)
        monthly[created.strftime('%Y-%m')].append(order)

    MONTH_NAMES = {
        '01': 'Enero', '02': 'Febrero', '03': 'Marzo',
        '04': 'Abril', '05': 'Mayo', '06': 'Junio',
        '07': 'Julio', '08': 'Agosto', '09': 'Septiembre',
        '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre',
    }

    now = datetime.utcnow()
    result = []

    for month_key in sorted(monthly.keys()):
        month_orders = monthly[month_key]
        initial_active = len(month_orders)
        year, month = month_key.split('-')
        month_name = f"{MONTH_NAMES[month]} {year}"

        month_start = datetime(int(year), int(month), 1)
        too_recent = (now - month_start).days < 35

        if too_recent:
            result.append({
                "month": month_name,
                "month_key": month_key,
                "initial_active": initial_active,
                "week4_active": None,
                "retention_percent": None,
                "status": "too_recent",
            })
            continue

        week4_count = 0
        for order in month_orders:
            created = order.created_at
            if hasattr(created, 'tzinfo') and created.tzinfo:
                created = created.replace(tzinfo=None)
            week4_start = created + timedelta(days=21)
            week4_end = created + timedelta(days=42)

            has_activity = db.query(UserProgress.id).filter(
                UserProgress.user_id == order.user_id,
                UserProgress.course_id == order.course_id,
                UserProgress.completed_at >= week4_start,
                UserProgress.completed_at <= week4_end,
            ).first()

            if has_activity:
                week4_count += 1

        percent = round(week4_count / initial_active * 100) if initial_active > 0 else 0
        status = "excellent" if percent >= 80 else "good" if percent >= 60 else "improvable"

        result.append({
            "month": month_name,
            "month_key": month_key,
            "initial_active": initial_active,
            "week4_active": week4_count,
            "retention_percent": percent,
            "status": status,
        })

    return result


@router.get("/dropoff")
def get_dropoff_data(
    course_id: str = Query(..., description="ID del curso"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Curva de drop-off por lección para un curso específico.

    Para cada bloque del curso calcula:
    - total_enrolled: estudiantes inscritos en el curso
    - completed: estudiantes que completaron ese bloque
    - completion_rate: completed / total_enrolled * 100
    - is_dropoff: si la caída respecto al bloque anterior > 15%
    """
    course = db.query(Course).filter(
        Course.id == course_id,
        Course.seller_id == current_user.id,
    ).first()

    if not course and str(current_user.role) != UserRole.admin.value:
        raise HTTPException(status_code=404, detail="Curso no encontrado")

    if not course:
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise HTTPException(status_code=404, detail="Curso no encontrado")

    total_enrolled = (
        db.query(sa_func.count(sa_func.distinct(Order.user_id)))
        .filter(Order.course_id == course_id, Order.status == OrderStatus.paid)
        .scalar()
    ) or 0

    if total_enrolled == 0:
        return {
            "course_id": course_id,
            "course_title": course.title,
            "total_enrolled": 0,
            "avg_completion": 0,
            "blocks": [],
        }

    modules = (
        db.query(CourseModule)
        .filter(CourseModule.course_id == course_id)
        .order_by(CourseModule.order)
        .all()
    )

    blocks_data = []
    prev_rate = 100.0
    global_order = 0

    for module in modules:
        blocks = (
            db.query(ContentBlock)
            .filter(ContentBlock.module_id == module.id)
            .order_by(ContentBlock.order)
            .all()
        )

        for block in blocks:
            global_order += 1

            completed = (
                db.query(sa_func.count(sa_func.distinct(UserProgress.user_id)))
                .filter(
                    UserProgress.course_id == course_id,
                    UserProgress.module_id == block.id,
                    UserProgress.is_completed == True,
                )
                .scalar()
            ) or 0

            rate = round(completed / total_enrolled * 100, 1)
            drop = round(prev_rate - rate, 1)
            is_dropoff = drop > 15 and global_order > 1

            blocks_data.append({
                "block_id": block.id,
                "block_title": block.title,
                "block_type": block.type,
                "module_title": module.title,
                "order": global_order,
                "completed": completed,
                "completion_rate": rate,
                "drop_from_prev": drop,
                "is_dropoff": is_dropoff,
            })

            prev_rate = rate

    return {
        "course_id": course_id,
        "course_title": course.title,
        "total_enrolled": total_enrolled,
        "avg_completion": round(
            sum(b["completion_rate"] for b in blocks_data) / len(blocks_data), 1
        ) if blocks_data else 0,
        "blocks": blocks_data,
    }


@router.get("/students-ranking")
def get_students_ranking(
    course_id: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Ranking de estudiantes por progreso en un curso específico.
    """
    course = db.query(Course).filter(
        Course.id == course_id,
        Course.seller_id == current_user.id,
    ).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")

    total_blocks = (
        db.query(sa_func.count(ContentBlock.id))
        .join(CourseModule, ContentBlock.module_id == CourseModule.id)
        .filter(CourseModule.course_id == course_id)
        .scalar()
    ) or 1

    orders = (
        db.query(Order)
        .filter(Order.course_id == course_id, Order.status == OrderStatus.paid)
        .all()
    )

    now = datetime.utcnow()
    result = []

    for order in orders:
        student = db.query(User).filter(User.id == order.user_id).first()
        if not student:
            continue

        progress_entries = (
            db.query(UserProgress)
            .filter(
                UserProgress.user_id == order.user_id,
                UserProgress.course_id == course_id,
                UserProgress.is_completed == True,
            )
            .all()
        )

        completed_blocks = len(progress_entries)
        pct = round(completed_blocks / total_blocks * 100, 1)

        last_activity = None
        if progress_entries:
            dates = [p.completed_at for p in progress_entries if p.completed_at]
            if dates:
                last_activity = max(dates)

        if last_activity:
            last_act_naive = (
                last_activity.replace(tzinfo=None)
                if hasattr(last_activity, "tzinfo") and last_activity.tzinfo
                else last_activity
            )
            days_inactive = (now - last_act_naive).days
            if days_inactive <= 7:
                status = "active"
            elif days_inactive <= 21:
                status = "at_risk"
            else:
                status = "inactive"
        else:
            status = "inactive"

        result.append({
            "user_id": student.id,
            "name": student.full_name or student.email,
            "email": student.email,
            "completed_blocks": completed_blocks,
            "total_blocks": total_blocks,
            "progress_pct": pct,
            "last_activity": last_activity.isoformat() if last_activity else None,
            "status": status,
            "enrolled_at": order.created_at.isoformat() if order.created_at else None,
        })

    result.sort(key=lambda x: x["progress_pct"], reverse=True)
    return result
