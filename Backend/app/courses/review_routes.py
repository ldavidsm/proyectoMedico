from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.dependencies import get_current_user
from app.models.courses import Course, CourseReview
from app.models.orders import Order, OrderStatus
from app.models.users import User
from app.schemas.courses import CourseReviewCreate, CourseReviewResponse
from app.services.ratings import update_course_rating


router = APIRouter(prefix="/courses/{course_id}/reviews", tags=["Course Reviews"])


@router.post("/")
def create_review(
    course_id: str,
    data: CourseReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    has_bought = db.query(Order).filter(
        Order.user_id == current_user.id,
        Order.course_id == course_id,
        Order.status == OrderStatus.paid
    ).first()

    if not has_bought:
        raise HTTPException(status_code=403, detail="Debes comprar el curso para valorarlo")

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
    return CourseReviewResponse.from_review(review)


@router.get("/")
def list_reviews(course_id: str, db: Session = Depends(get_db)):
    reviews = db.query(CourseReview).options(
        joinedload(CourseReview.user)
    ).filter(
        CourseReview.course_id == course_id
    ).order_by(CourseReview.created_at.desc()).all()
    return [CourseReviewResponse.from_review(r) for r in reviews]


@router.patch("/me")
def update_my_review(
    course_id: str,
    data: CourseReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    review = db.query(CourseReview).filter(
        CourseReview.user_id == current_user.id,
        CourseReview.course_id == course_id
    ).first()
    if not review:
        raise HTTPException(404, "No has valorado este curso")
    review.rating = data.rating
    review.comment = data.comment
    db.commit()
    db.refresh(review)
    update_course_rating(db, course_id)
    return CourseReviewResponse.from_review(review)


@router.get("/me")
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

    return CourseReviewResponse.from_review(review)
