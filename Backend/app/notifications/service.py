from sqlalchemy.orm import Session
from app.models.notifications import Notification


def create_notification(
    db: Session,
    user_id: str,
    type: str,
    title: str,
    message: str,
    metadata: dict = None,
):
    n = Notification(
        user_id=user_id,
        type=type,
        title=title,
        message=message,
        metadata_json=metadata,
    )
    db.add(n)
    db.commit()
    return n
