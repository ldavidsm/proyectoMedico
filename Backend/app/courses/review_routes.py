from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.courses import Course, CourseReview
from app.models.orders import Order, OrderStatus
from app.models.users import User
from app.schemas.courses import CourseReviewCreate, CourseReviewResponse
from app.services.ratings import update_course_rating


router = APIRouter(prefix="/courses/{course_id}/reviews", tags=["Course Reviews"])


@router.post("/", response_model=CourseReviewResponse)
def create_review(
    course_id: str,
    data: CourseReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1️⃣ Verificar compra
    has_bought = db.query(Order).filter(
        Order.user_id == current_user.id,
        Order.course_id == course_id,
        Order.status == OrderStatus.paid
    ).first()

    if not has_bought:
        raise HTTPException(status_code=403, detail="Debes comprar el curso para valorarlo")

    # 2️⃣ Evitar doble review
    existing = db.query(CourseReview).filter(
        CourseReview.user_id == current_user.id,
        CourseReview.course_id == course_id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Ya has valorado este curso")

    review = CourseReview(
        user_id=current_user.id,
        course_id=course_id,
        rating=data.rating,
        comment=data.comment
    )

    db.add(review)
    db.commit()
    db.refresh(review)
    update_course_rating(db, course_id)
    return review


@router.get("/", response_model=list[CourseReviewResponse])
def list_reviews(course_id: str, db: Session = Depends(get_db)):
    return db.query(CourseReview).filter(
        CourseReview.course_id == course_id
    ).all()


@router.get("/me", response_model=CourseReviewResponse)
def get_my_review(
    course_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    review = db.query(CourseReview).filter(
        CourseReview.course_id == course_id,
        CourseReview.user_id == current_user.id
    ).first()

    if not review:
        raise HTTPException(status_code=404, detail="No has valorado este curso")

    return review
