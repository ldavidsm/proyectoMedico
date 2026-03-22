from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone
from typing import List, Optional
from app.database import get_db
from app.dependencies import get_current_user
from app.models.cohorts import Cohort, CohortMember
from app.models.courses import Course, UserProgress, ContentBlock, Module, CourseOffer
from app.models.orders import Order, OrderStatus
from app.models.users import User, UserRole
from app.schemas.cohorts import (
    CohortCreate, CohortUpdate, CohortResponse, CohortMemberResponse
)

router = APIRouter(tags=["cohorts"])


def _role_str(user: User) -> str:
    return str(user.role.value if hasattr(user.role, 'value') else user.role)


def require_seller_or_admin(current_user: User):
    if _role_str(current_user) not in ('seller', 'admin'):
        raise HTTPException(
            status_code=403,
            detail="Solo sellers pueden gestionar cohorts"
        )
    return current_user


def _require_course_owner(db: Session, course_id: str, user: User) -> Course:
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    if _role_str(user) != 'admin' and course.seller_id != user.id:
        raise HTTPException(status_code=403, detail="No autorizado")
    return course


def build_cohort_response(cohort: Cohort, db: Session) -> CohortResponse:
    now = datetime.now(timezone.utc)
    member_count = (
        db.query(func.count(CohortMember.id))
        .filter(CohortMember.cohort_id == cohort.id)
        .scalar() or 0
    )

    spots_left = None
    if cohort.max_students:
        spots_left = max(0, cohort.max_students - member_count)

    enrollment_open = (
        (not cohort.enrollment_start or now >= cohort.enrollment_start)
        and (not cohort.enrollment_end or now <= cohort.enrollment_end)
        and cohort.is_active
        and (spots_left is None or spots_left > 0)
    )

    return CohortResponse(
        id=cohort.id,
        course_id=cohort.course_id,
        offer_id=cohort.offer_id,
        name=cohort.name,
        enrollment_start=cohort.enrollment_start,
        enrollment_end=cohort.enrollment_end,
        course_start=cohort.course_start,
        course_end=cohort.course_end,
        max_students=cohort.max_students,
        is_active=cohort.is_active,
        announcement=cohort.announcement,
        created_at=cohort.created_at,
        member_count=member_count,
        spots_left=spots_left,
        enrollment_open=enrollment_open,
        course_started=now >= cohort.course_start,
    )


# ── LIST ────────────────────────────────────────────────────
@router.get("/", response_model=List[CohortResponse])
def list_cohorts(
    course_id: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_seller_or_admin(current_user)
    _require_course_owner(db, course_id, current_user)

    cohorts = (
        db.query(Cohort)
        .filter(Cohort.course_id == course_id)
        .order_by(Cohort.course_start.desc())
        .all()
    )
    return [build_cohort_response(c, db) for c in cohorts]


# ── CREATE ──────────────────────────────────────────────────
@router.post("/", response_model=CohortResponse, status_code=201)
def create_cohort(
    data: CohortCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_seller_or_admin(current_user)
    _require_course_owner(db, data.course_id, current_user)

    offer = db.query(CourseOffer).filter(
        CourseOffer.id == data.offer_id,
        CourseOffer.course_id == data.course_id,
    ).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Oferta no encontrada")

    cohort = Cohort(**data.model_dump())
    db.add(cohort)
    db.commit()
    db.refresh(cohort)
    return build_cohort_response(cohort, db)


# ── UPDATE ──────────────────────────────────────────────────
@router.patch("/{cohort_id}", response_model=CohortResponse)
def update_cohort(
    cohort_id: str,
    data: CohortUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_seller_or_admin(current_user)
    cohort = db.query(Cohort).filter(Cohort.id == cohort_id).first()
    if not cohort:
        raise HTTPException(status_code=404, detail="Cohort no encontrado")
    _require_course_owner(db, cohort.course_id, current_user)

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(cohort, field, value)

    db.commit()
    db.refresh(cohort)
    return build_cohort_response(cohort, db)


# ── DELETE ──────────────────────────────────────────────────
@router.delete("/{cohort_id}", status_code=204)
def delete_cohort(
    cohort_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_seller_or_admin(current_user)
    cohort = db.query(Cohort).filter(Cohort.id == cohort_id).first()
    if not cohort:
        raise HTTPException(status_code=404, detail="Cohort no encontrado")
    _require_course_owner(db, cohort.course_id, current_user)

    db.delete(cohort)
    db.commit()


# ── MEMBERS ─────────────────────────────────────────────────
@router.get("/{cohort_id}/members", response_model=List[CohortMemberResponse])
def list_members(
    cohort_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_seller_or_admin(current_user)
    cohort = db.query(Cohort).filter(Cohort.id == cohort_id).first()
    if not cohort:
        raise HTTPException(status_code=404, detail="Cohort no encontrado")
    _require_course_owner(db, cohort.course_id, current_user)

    members = (
        db.query(CohortMember)
        .filter(CohortMember.cohort_id == cohort_id)
        .all()
    )

    total_blocks = (
        db.query(func.count(ContentBlock.id))
        .join(Module, ContentBlock.module_id == Module.id)
        .filter(Module.course_id == cohort.course_id)
        .scalar() or 1
    )

    result = []
    for m in members:
        completed = (
            db.query(func.count(UserProgress.id))
            .filter(
                UserProgress.user_id == m.student_id,
                UserProgress.course_id == cohort.course_id,
            )
            .scalar() or 0
        )
        progress_pct = round((completed / total_blocks) * 100)

        result.append(CohortMemberResponse(
            id=m.id,
            student_id=m.student_id,
            student_name=m.student.full_name or "Usuario",
            student_email=m.student.email,
            joined_at=m.joined_at,
            progress_percentage=progress_pct,
        ))

    return result


# ── ANNOUNCE ────────────────────────────────────────────────
@router.post("/{cohort_id}/announce")
def send_announcement(
    cohort_id: str,
    message: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_seller_or_admin(current_user)
    cohort = db.query(Cohort).filter(Cohort.id == cohort_id).first()
    if not cohort:
        raise HTTPException(status_code=404, detail="Cohort no encontrado")
    course = _require_course_owner(db, cohort.course_id, current_user)

    cohort.announcement = message
    db.commit()

    from app.notifications.service import create_notification
    members = (
        db.query(CohortMember)
        .filter(CohortMember.cohort_id == cohort_id)
        .all()
    )

    for member in members:
        create_notification(
            db=db,
            user_id=member.student_id,
            type="cohort_announcement",
            title=f"Anuncio: {course.title}",
            message=message,
            metadata={
                "courseId": cohort.course_id,
                "cohortId": cohort_id,
            },
        )

    return {"ok": True, "notified": len(members)}


# ── MY COHORT (student) ────────────────────────────────────
@router.get("/my-cohort")
def get_my_cohort(
    course_id: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """El estudiante obtiene su cohort para un curso."""
    member = (
        db.query(CohortMember)
        .join(Cohort, CohortMember.cohort_id == Cohort.id)
        .filter(
            Cohort.course_id == course_id,
            CohortMember.student_id == current_user.id,
        )
        .first()
    )

    if not member:
        return None

    return build_cohort_response(member.cohort, db)
