from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.dependencies import get_current_user
from app.models.courses import UserProgress, Course, Module, ContentBlock
from app.models.orders import Order, OrderStatus
from app.models.users import User
import uuid

router = APIRouter(prefix="/courses/{course_id}/progress", tags=["Progress"])


@router.get("/")
def get_course_progress(
    course_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get user's progress for a course"""
    completed = (
        db.query(UserProgress)
        .filter(
            UserProgress.user_id == current_user.id,
            UserProgress.course_id == course_id,
        )
        .all()
    )

    completed_block_ids = [p.module_id for p in completed]

    # Calculate total blocks
    total_blocks = (
        db.query(func.count(ContentBlock.id))
        .join(Module, ContentBlock.module_id == Module.id)
        .filter(Module.course_id == course_id)
        .scalar()
        or 0
    )

    completed_count = len(completed_block_ids)
    percentage = round((completed_count / total_blocks * 100) if total_blocks > 0 else 0)

    return {
        "completed_block_ids": completed_block_ids,
        "completed_count": completed_count,
        "total_blocks": total_blocks,
        "percentage": percentage,
        "is_complete": percentage == 100,
    }


@router.post("/blocks/{block_id}/complete")
def mark_block_complete(
    course_id: str,
    block_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark a block/lesson as completed"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(404, "Curso no encontrado")

    # Check if already completed
    existing = (
        db.query(UserProgress)
        .filter(
            UserProgress.user_id == current_user.id,
            UserProgress.course_id == course_id,
            UserProgress.module_id == block_id,
        )
        .first()
    )

    if not existing:
        progress = UserProgress(
            user_id=current_user.id,
            course_id=course_id,
            module_id=block_id,
            is_completed=True,
        )
        db.add(progress)
        db.commit()

    return {"ok": True, "block_id": block_id}


@router.delete("/blocks/{block_id}/complete")
def mark_block_incomplete(
    course_id: str,
    block_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark a block as not completed"""
    db.query(UserProgress).filter(
        UserProgress.user_id == current_user.id,
        UserProgress.course_id == course_id,
        UserProgress.module_id == block_id,
    ).delete()
    db.commit()
    return {"ok": True}


# --- PROGRESS SUMMARY (all purchased courses) ---
# Note: this endpoint uses a dummy course_id since the router has a prefix.
# The course_id path param is ignored — it returns progress for ALL purchased courses.
@router.get("/summary")
def get_courses_progress_summary(
    course_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Progress summary for all purchased courses of the current user."""
    orders = db.query(Order).filter(
        Order.user_id == current_user.id,
        Order.status == OrderStatus.paid
    ).all()

    result = []
    for order in orders:
        cid = order.course_id
        course = db.query(Course).filter(Course.id == cid).first()
        if not course:
            continue

        total_blocks = (
            db.query(func.count(ContentBlock.id))
            .join(Module, ContentBlock.module_id == Module.id)
            .filter(Module.course_id == cid)
            .scalar() or 0
        )

        completed = db.query(UserProgress).filter(
            UserProgress.user_id == current_user.id,
            UserProgress.course_id == cid,
        ).all()

        completed_count = len(completed)
        percentage = round((completed_count / total_blocks * 100) if total_blocks > 0 else 0)

        last_progress = (
            db.query(UserProgress)
            .filter(
                UserProgress.user_id == current_user.id,
                UserProgress.course_id == cid,
            )
            .order_by(UserProgress.completed_at.desc())
            .first()
        )

        result.append({
            "course_id": cid,
            "course_title": course.title,
            "percentage": percentage,
            "completed_blocks": completed_count,
            "total_blocks": total_blocks,
            "last_block_id": last_progress.module_id if last_progress else None,
            "is_complete": percentage == 100,
        })

    return result
