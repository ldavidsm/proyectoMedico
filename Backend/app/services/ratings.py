from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.courses import CourseReview, Course


def update_course_rating(db: Session, course_id: str):
    result = db.query(
        func.avg(CourseReview.rating),
        func.count(CourseReview.id)
    ).filter(
        CourseReview.course_id == course_id
    ).one()

    avg, count = result

    course = db.query(Course).filter(Course.id == course_id).first()
    if course:
        course.rating_avg = round(avg or 0, 2)
        course.rating_count = count

        db.commit()
