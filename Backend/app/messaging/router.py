from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func as sa_func
from datetime import datetime, timezone
from typing import List, Optional

from app.database import get_db
from app.dependencies import get_current_user
from app.models.users import User
from app.models.courses import Course, ContentBlock, Module as CourseModule
from app.models.orders import Order, OrderStatus
from app.models.messaging import Message, MessageReply, CourseAnnouncement, TaskSubmission
from app.schemas.messaging import (
    MessageCreate, MessageResponse, MessageReplyCreate, MessageReplyResponse,
    AnnouncementCreate, AnnouncementUpdate, AnnouncementResponse,
    TaskSubmissionCreate, TaskSubmissionResponse, GradeSubmissionRequest,
    TaskSummary,
)

router = APIRouter()


# ═══════════════════════════════════════════════════════════
#  HELPERS
# ═══════════════════════════════════════════════════════════

def _message_to_response(msg: Message, replies: list | None = None) -> dict:
    data = {
        "id": msg.id,
        "sender_id": msg.sender_id,
        "receiver_id": msg.receiver_id,
        "course_id": msg.course_id,
        "subject": msg.subject,
        "body": msg.body,
        "is_read": msg.is_read,
        "is_starred": msg.is_starred,
        "created_at": msg.created_at,
        "sender_name": msg.sender.full_name or msg.sender.email,
        "course_title": msg.course.title if msg.course else "",
        "replies": [],
    }
    if replies is not None:
        data["replies"] = [
            {
                "id": r.id,
                "message_id": r.message_id,
                "sender_id": r.sender_id,
                "body": r.body,
                "created_at": r.created_at,
                "sender_name": r.sender.full_name or r.sender.email,
            }
            for r in replies
        ]
    return data


def _announcement_to_response(ann: CourseAnnouncement, recipient_count: int) -> dict:
    return {
        "id": ann.id,
        "course_id": ann.course_id,
        "seller_id": ann.seller_id,
        "title": ann.title,
        "body": ann.body,
        "created_at": ann.created_at,
        "course_title": ann.course.title if ann.course else "",
        "recipient_count": recipient_count,
    }


def _submission_to_response(sub: TaskSubmission) -> dict:
    return {
        "id": sub.id,
        "block_id": sub.block_id,
        "course_id": sub.course_id,
        "student_id": sub.student_id,
        "submission_text": sub.submission_text,
        "file_url": sub.file_url,
        "file_name": sub.file_name,
        "status": sub.status,
        "grade": sub.grade,
        "feedback": sub.feedback,
        "submitted_at": sub.submitted_at,
        "graded_at": sub.graded_at,
        "student_name": sub.student.full_name or sub.student.email,
        "student_email": sub.student.email,
    }


# ═══════════════════════════════════════════════════════════
#  MESSAGES
# ═══════════════════════════════════════════════════════════

@router.get("/messages", response_model=List[MessageResponse])
def list_messages(
    course_id: Optional[str] = Query(None),
    is_read: Optional[bool] = Query(None),
    is_starred: Optional[bool] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(Message).filter(Message.receiver_id == current_user.id)
    if course_id:
        q = q.filter(Message.course_id == course_id)
    if is_read is not None:
        q = q.filter(Message.is_read == is_read)
    if is_starred is not None:
        q = q.filter(Message.is_starred == is_starred)
    messages = q.order_by(Message.created_at.desc()).all()
    return [_message_to_response(m) for m in messages]


@router.get("/messages/{message_id}", response_model=MessageResponse)
def get_message(
    message_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")
    if current_user.id not in (msg.sender_id, msg.receiver_id):
        raise HTTPException(status_code=403, detail="Sin acceso a este mensaje")
    # Auto-mark as read
    if not msg.is_read and current_user.id == msg.receiver_id:
        msg.is_read = True
        db.commit()
        db.refresh(msg)
    replies = (
        db.query(MessageReply)
        .filter(MessageReply.message_id == message_id)
        .order_by(MessageReply.created_at.asc())
        .all()
    )
    return _message_to_response(msg, replies)


@router.post("/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def create_message(
    data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == data.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    if course.seller_id != data.receiver_id:
        raise HTTPException(status_code=400, detail="El receptor debe ser el vendedor del curso")
    msg = Message(
        sender_id=data.sender_id,
        receiver_id=data.receiver_id,
        course_id=data.course_id,
        subject=data.subject,
        body=data.body,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return _message_to_response(msg)


@router.post("/messages/{message_id}/reply", response_model=MessageReplyResponse, status_code=status.HTTP_201_CREATED)
def reply_to_message(
    message_id: str,
    data: MessageReplyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")
    if current_user.id != msg.receiver_id:
        raise HTTPException(status_code=403, detail="Solo el receptor puede responder")
    reply = MessageReply(
        message_id=message_id,
        sender_id=current_user.id,
        body=data.body,
    )
    db.add(reply)
    db.commit()
    db.refresh(reply)
    return {
        "id": reply.id,
        "message_id": reply.message_id,
        "sender_id": reply.sender_id,
        "body": reply.body,
        "created_at": reply.created_at,
        "sender_name": current_user.full_name or current_user.email,
    }


@router.patch("/messages/{message_id}/read")
def mark_message_read(
    message_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")
    msg.is_read = True
    db.commit()
    return {"ok": True}


@router.patch("/messages/{message_id}/star")
def toggle_message_star(
    message_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")
    msg.is_starred = not msg.is_starred
    db.commit()
    return {"is_starred": msg.is_starred}


@router.delete("/messages/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_message(
    message_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")
    if current_user.id != msg.receiver_id:
        raise HTTPException(status_code=403, detail="Solo el receptor puede eliminar")
    # Delete replies first
    db.query(MessageReply).filter(MessageReply.message_id == message_id).delete()
    db.delete(msg)
    db.commit()


# ═══════════════════════════════════════════════════════════
#  ANNOUNCEMENTS
# ═══════════════════════════════════════════════════════════

def _get_recipient_count(db: Session, course_id: str) -> int:
    return (
        db.query(sa_func.count(Order.id))
        .filter(Order.course_id == course_id, Order.status == OrderStatus.paid)
        .scalar()
    ) or 0


@router.get("/announcements", response_model=List[AnnouncementResponse])
def list_announcements(
    seller_id: str = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    anns = (
        db.query(CourseAnnouncement)
        .filter(CourseAnnouncement.seller_id == seller_id)
        .order_by(CourseAnnouncement.created_at.desc())
        .all()
    )
    return [
        _announcement_to_response(a, _get_recipient_count(db, a.course_id))
        for a in anns
    ]


@router.post("/announcements", response_model=AnnouncementResponse, status_code=status.HTTP_201_CREATED)
def create_announcement(
    data: AnnouncementCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == data.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    if course.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="No eres el vendedor de este curso")
    ann = CourseAnnouncement(
        course_id=data.course_id,
        seller_id=current_user.id,
        title=data.title,
        body=data.body,
    )
    db.add(ann)
    db.commit()
    db.refresh(ann)
    return _announcement_to_response(ann, _get_recipient_count(db, ann.course_id))


@router.patch("/announcements/{announcement_id}", response_model=AnnouncementResponse)
def update_announcement(
    announcement_id: str,
    data: AnnouncementUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ann = db.query(CourseAnnouncement).filter(CourseAnnouncement.id == announcement_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Anuncio no encontrado")
    if ann.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="No eres el autor de este anuncio")
    if data.title is not None:
        ann.title = data.title
    if data.body is not None:
        ann.body = data.body
    db.commit()
    db.refresh(ann)
    return _announcement_to_response(ann, _get_recipient_count(db, ann.course_id))


@router.delete("/announcements/{announcement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_announcement(
    announcement_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ann = db.query(CourseAnnouncement).filter(CourseAnnouncement.id == announcement_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Anuncio no encontrado")
    if ann.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="No eres el autor de este anuncio")
    db.delete(ann)
    db.commit()


# ═══════════════════════════════════════════════════════════
#  TASKS
# ═══════════════════════════════════════════════════════════

@router.get("/tasks", response_model=List[TaskSummary])
def list_tasks(
    seller_id: str = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Get all courses for this seller
    courses = db.query(Course).filter(Course.seller_id == seller_id).all()
    course_ids = [c.id for c in courses]
    course_map = {c.id: c.title for c in courses}

    if not course_ids:
        return []

    # Get all task/file_task blocks from those courses
    blocks = (
        db.query(ContentBlock)
        .join(CourseModule, ContentBlock.module_id == CourseModule.id)
        .filter(
            CourseModule.course_id.in_(course_ids),
            ContentBlock.type.in_(["task", "file_task"]),
        )
        .all()
    )

    result = []
    for block in blocks:
        course_id = block.module.course_id
        # Count submissions
        submitted_count = (
            db.query(sa_func.count(TaskSubmission.id))
            .filter(TaskSubmission.block_id == block.id)
            .scalar()
        ) or 0
        graded_count = (
            db.query(sa_func.count(TaskSubmission.id))
            .filter(
                TaskSubmission.block_id == block.id,
                TaskSubmission.status.in_(["calificada", "requiere-cambios"]),
            )
            .scalar()
        ) or 0
        # Total students = paid orders for that course
        total_students = (
            db.query(sa_func.count(Order.id))
            .filter(Order.course_id == course_id, Order.status == OrderStatus.paid)
            .scalar()
        ) or 0

        result.append(
            TaskSummary(
                block_id=block.id,
                block_title=block.title,
                course_id=course_id,
                course_title=course_map.get(course_id, ""),
                submitted_count=submitted_count,
                total_students=total_students,
                graded_count=graded_count,
                due_date=None,
            )
        )

    return result


@router.get("/tasks/{block_id}/submissions", response_model=List[TaskSubmissionResponse])
def list_submissions(
    block_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    block = db.query(ContentBlock).filter(ContentBlock.id == block_id).first()
    if not block:
        raise HTTPException(status_code=404, detail="Bloque no encontrado")
    course = db.query(Course).filter(Course.id == block.module.course_id).first()
    if not course or course.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes acceso a este bloque")
    subs = (
        db.query(TaskSubmission)
        .filter(TaskSubmission.block_id == block_id)
        .order_by(TaskSubmission.submitted_at.desc())
        .all()
    )
    return [_submission_to_response(s) for s in subs]


@router.post("/tasks/submit", response_model=TaskSubmissionResponse, status_code=status.HTTP_201_CREATED)
def submit_task(
    data: TaskSubmissionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Validate student has access (paid order)
    order = (
        db.query(Order)
        .filter(
            Order.user_id == current_user.id,
            Order.course_id == data.course_id,
            Order.status == OrderStatus.paid,
        )
        .first()
    )
    if not order:
        raise HTTPException(status_code=403, detail="No tienes acceso a este curso")
    sub = TaskSubmission(
        block_id=data.block_id,
        course_id=data.course_id,
        student_id=current_user.id,
        submission_text=data.submission_text,
        file_url=data.file_url,
        file_name=data.file_name,
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return _submission_to_response(sub)


@router.patch("/tasks/submissions/{submission_id}/grade", response_model=TaskSubmissionResponse)
def grade_submission(
    submission_id: str,
    data: GradeSubmissionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sub = db.query(TaskSubmission).filter(TaskSubmission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Entrega no encontrada")
    # Validate that the course belongs to this seller
    course = db.query(Course).filter(Course.id == sub.course_id).first()
    if not course or course.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para calificar esta entrega")
    sub.grade = data.grade
    sub.feedback = data.feedback
    sub.status = data.status
    sub.graded_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(sub)
    return _submission_to_response(sub)
