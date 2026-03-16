from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.notifications import Notification
from app.models.users import User

router = APIRouter()


@router.get("/")
def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notifs = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(50)
        .all()
    )
    unread = sum(1 for n in notifs if not n.is_read)
    return {
        "notifications": [
            {
                "id": n.id,
                "user_id": n.user_id,
                "type": n.type,
                "title": n.title,
                "message": n.message,
                "is_read": n.is_read,
                "created_at": str(n.created_at),
                "metadata_json": n.metadata_json,
            }
            for n in notifs
        ],
        "unread_count": unread,
    }


@router.patch("/{notification_id}/read")
def mark_as_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    n = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id,
    ).first()
    if n:
        n.is_read = True
        db.commit()
    return {"ok": True}


@router.patch("/read-all")
def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False,
    ).update({"is_read": True})
    db.commit()
    return {"ok": True}


@router.delete("/{notification_id}")
def delete_notification(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id,
    ).delete()
    db.commit()
    return {"ok": True}
