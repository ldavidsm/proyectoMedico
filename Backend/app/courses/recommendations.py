from datetime import datetime, timezone
from sqlalchemy.orm import Session
from typing import Optional

from app.models.courses import Course
from app.models.orders import Order, OrderStatus
from app.models.users import Favorite


def get_recommendations(
    db: Session,
    user_id: Optional[str] = None,
    limit: int = 6,
) -> list[Course]:
    base_query = db.query(Course).filter(Course.status == "publicado")

    if not user_id:
        return base_query.order_by(
            Course.rating_avg.desc(),
            Course.rating_count.desc(),
            Course.created_at.desc(),
        ).limit(limit).all()

    # Gather user signals
    purchased_ids = [
        o.course_id for o in db.query(Order).filter(
            Order.user_id == user_id,
            Order.status == OrderStatus.paid,
        ).all()
    ]

    favorite_ids = [
        f.course_id for f in db.query(Favorite).filter(
            Favorite.user_id == user_id,
        ).all()
    ]

    signal_ids = list(set(favorite_ids + purchased_ids))

    # Extract preference signals
    preferred_categories: list[str] = []
    preferred_topics: list[str] = []
    preferred_levels: list[str] = []
    preferred_audiences: list[str] = []

    if signal_ids:
        signal_courses = db.query(Course).filter(Course.id.in_(signal_ids)).all()
        preferred_categories = list({c.category for c in signal_courses if c.category})
        preferred_topics = list({c.topic for c in signal_courses if c.topic})
        preferred_levels = list({c.level for c in signal_courses if c.level})
        for c in signal_courses:
            if c.target_audience:
                preferred_audiences.extend(c.target_audience)
        preferred_audiences = list(set(preferred_audiences))

    # Exclude purchased courses
    all_courses = base_query.all()
    candidates = [c for c in all_courses if c.id not in set(purchased_ids)]

    def score_course(course: Course) -> float:
        s = 0.0
        if course.category and course.category in preferred_categories:
            s += 3.0
        if course.topic and course.topic in preferred_topics:
            s += 2.0
        if course.level and course.level in preferred_levels:
            s += 1.0
        if course.target_audience and preferred_audiences:
            overlap = len(set(course.target_audience) & set(preferred_audiences))
            s += overlap * 0.5
        if course.rating_avg and course.rating_avg > 0:
            s += course.rating_avg / 5.0
        if course.created_at:
            days_old = (datetime.now(timezone.utc) - course.created_at).days
            if days_old < 30:
                s += 0.5
            elif days_old < 90:
                s += 0.2
        return s

    scored = sorted(candidates, key=score_course, reverse=True)
    return scored[:limit]
