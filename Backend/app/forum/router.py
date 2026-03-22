from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app.dependencies import get_current_user
from app.models.forum import ForumThread, ForumPost
from app.models.courses import Course
from app.models.orders import Order, OrderStatus
from app.models.users import User, UserRole
from app.schemas.forum import (
    ForumThreadCreate, ForumThreadResponse,
    ForumThreadDetail, ForumPostCreate, ForumPostResponse,
)

router = APIRouter(tags=["forum"])


def check_course_access(
    course_id: str,
    current_user: User,
    db: Session,
) -> Course:
    """
    Verifica que el usuario tiene acceso al foro del curso.
    Acceso permitido si:
    - Es el seller del curso
    - Es admin
    - Tiene una orden paid para el curso
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")

    if not course.has_forum:
        raise HTTPException(
            status_code=403,
            detail="Este curso no tiene foro habilitado",
        )

    role = str(
        current_user.role.value
        if hasattr(current_user.role, "value")
        else current_user.role
    )

    # Seller del curso o admin tienen acceso
    if role == "admin" or str(course.seller_id) == str(current_user.id):
        return course

    # Estudiante: verificar orden paid
    order = (
        db.query(Order)
        .filter(
            Order.user_id == current_user.id,
            Order.course_id == course_id,
            Order.status == OrderStatus.paid,
        )
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=403,
            detail="Debes estar matriculado para acceder al foro",
        )
    return course


def build_thread_response(
    thread: ForumThread,
    db: Session,
) -> ForumThreadResponse:
    post_count = (
        db.query(func.count(ForumPost.id))
        .filter(ForumPost.thread_id == thread.id)
        .scalar()
        or 0
    )

    last_post = (
        db.query(ForumPost)
        .filter(ForumPost.thread_id == thread.id)
        .order_by(ForumPost.created_at.desc())
        .first()
    )

    role = str(
        thread.author.role.value
        if hasattr(thread.author.role, "value")
        else thread.author.role
    )

    return ForumThreadResponse(
        id=thread.id,
        course_id=thread.course_id,
        author_id=thread.author_id,
        author_name=thread.author.full_name or "Usuario",
        author_role=role,
        title=thread.title,
        body=thread.body,
        is_pinned=thread.is_pinned,
        is_closed=thread.is_closed,
        views=thread.views,
        post_count=post_count,
        last_post_at=last_post.created_at if last_post else None,
        created_at=thread.created_at,
        updated_at=thread.updated_at,
    )


# ── THREADS ──────────────────────────────────────────


@router.get(
    "/courses/{course_id}/threads",
    response_model=List[ForumThreadResponse],
)
def list_threads(
    course_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    check_course_access(course_id, current_user, db)

    threads = (
        db.query(ForumThread)
        .filter(ForumThread.course_id == course_id)
        .order_by(ForumThread.is_pinned.desc(), ForumThread.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return [build_thread_response(t, db) for t in threads]


@router.post(
    "/courses/{course_id}/threads",
    response_model=ForumThreadResponse,
    status_code=201,
)
def create_thread(
    course_id: str,
    data: ForumThreadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    check_course_access(course_id, current_user, db)

    thread = ForumThread(
        course_id=course_id,
        author_id=current_user.id,
        title=data.title.strip(),
        body=data.body.strip(),
    )
    db.add(thread)
    db.commit()
    db.refresh(thread)
    return build_thread_response(thread, db)


@router.get("/threads/{thread_id}", response_model=ForumThreadDetail)
def get_thread(
    thread_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    thread = db.query(ForumThread).filter(ForumThread.id == thread_id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="Hilo no encontrado")

    check_course_access(thread.course_id, current_user, db)

    # Incrementar vistas
    thread.views += 1
    db.commit()

    posts = (
        db.query(ForumPost)
        .filter(ForumPost.thread_id == thread_id)
        .order_by(ForumPost.created_at.asc())
        .all()
    )

    base = build_thread_response(thread, db)
    detail = ForumThreadDetail(**base.model_dump())
    detail.posts = [
        ForumPostResponse(
            id=p.id,
            thread_id=p.thread_id,
            author_id=p.author_id,
            author_name=p.author.full_name or "Usuario",
            author_role=str(
                p.author.role.value
                if hasattr(p.author.role, "value")
                else p.author.role
            ),
            body=p.body,
            is_answer=p.is_answer,
            created_at=p.created_at,
            updated_at=p.updated_at,
        )
        for p in posts
    ]
    return detail


@router.delete("/threads/{thread_id}", status_code=204)
def delete_thread(
    thread_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    thread = db.query(ForumThread).filter(ForumThread.id == thread_id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="Hilo no encontrado")

    role = str(
        current_user.role.value
        if hasattr(current_user.role, "value")
        else current_user.role
    )

    course = db.query(Course).filter(Course.id == thread.course_id).first()

    is_author = str(thread.author_id) == str(current_user.id)
    is_seller = course and str(course.seller_id) == str(current_user.id)
    is_admin = role == "admin"

    if not (is_author or is_seller or is_admin):
        raise HTTPException(status_code=403, detail="Sin permiso")

    db.delete(thread)
    db.commit()


@router.patch("/threads/{thread_id}/pin")
def toggle_pin(
    thread_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    thread = db.query(ForumThread).filter(ForumThread.id == thread_id).first()
    if not thread:
        raise HTTPException(status_code=404)

    course = db.query(Course).filter(Course.id == thread.course_id).first()
    role = str(
        current_user.role.value
        if hasattr(current_user.role, "value")
        else current_user.role
    )

    if role != "admin" and (
        not course or str(course.seller_id) != str(current_user.id)
    ):
        raise HTTPException(status_code=403)

    thread.is_pinned = not thread.is_pinned
    db.commit()
    return {"is_pinned": thread.is_pinned}


@router.patch("/threads/{thread_id}/close")
def toggle_close(
    thread_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    thread = db.query(ForumThread).filter(ForumThread.id == thread_id).first()
    if not thread:
        raise HTTPException(status_code=404)

    course = db.query(Course).filter(Course.id == thread.course_id).first()
    role = str(
        current_user.role.value
        if hasattr(current_user.role, "value")
        else current_user.role
    )

    if role != "admin" and (
        not course or str(course.seller_id) != str(current_user.id)
    ):
        raise HTTPException(status_code=403)

    thread.is_closed = not thread.is_closed
    db.commit()
    return {"is_closed": thread.is_closed}


# ── POSTS ─────────────────────────────────────────────


@router.post(
    "/threads/{thread_id}/posts",
    response_model=ForumPostResponse,
    status_code=201,
)
def create_post(
    thread_id: str,
    data: ForumPostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    thread = db.query(ForumThread).filter(ForumThread.id == thread_id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="Hilo no encontrado")
    if thread.is_closed:
        raise HTTPException(status_code=403, detail="Este hilo está cerrado")

    check_course_access(thread.course_id, current_user, db)

    post = ForumPost(
        thread_id=thread_id,
        author_id=current_user.id,
        body=data.body.strip(),
    )
    db.add(post)
    db.commit()
    db.refresh(post)

    role = str(
        current_user.role.value
        if hasattr(current_user.role, "value")
        else current_user.role
    )

    return ForumPostResponse(
        id=post.id,
        thread_id=post.thread_id,
        author_id=post.author_id,
        author_name=current_user.full_name or "Usuario",
        author_role=role,
        body=post.body,
        is_answer=post.is_answer,
        created_at=post.created_at,
        updated_at=post.updated_at,
    )


@router.delete("/posts/{post_id}", status_code=204)
def delete_post(
    post_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = db.query(ForumPost).filter(ForumPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404)

    thread = (
        db.query(ForumThread).filter(ForumThread.id == post.thread_id).first()
    )
    course = (
        db.query(Course).filter(Course.id == thread.course_id).first()
        if thread
        else None
    )

    role = str(
        current_user.role.value
        if hasattr(current_user.role, "value")
        else current_user.role
    )

    is_author = str(post.author_id) == str(current_user.id)
    is_seller = course and str(course.seller_id) == str(current_user.id)
    is_admin = role == "admin"

    if not (is_author or is_seller or is_admin):
        raise HTTPException(status_code=403)

    db.delete(post)
    db.commit()


@router.patch("/posts/{post_id}/mark-answer")
def mark_as_answer(
    post_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = db.query(ForumPost).filter(ForumPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404)

    thread = (
        db.query(ForumThread).filter(ForumThread.id == post.thread_id).first()
    )
    course = db.query(Course).filter(Course.id == thread.course_id).first()

    role = str(
        current_user.role.value
        if hasattr(current_user.role, "value")
        else current_user.role
    )

    if role != "admin" and (
        not course or str(course.seller_id) != str(current_user.id)
    ):
        raise HTTPException(
            status_code=403,
            detail="Solo el instructor puede marcar respuestas",
        )

    post.is_answer = not post.is_answer
    db.commit()
    return {"is_answer": post.is_answer}


@router.get("/courses/{course_id}/stats")
def get_forum_stats(
    course_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404)

    role = str(
        current_user.role.value
        if hasattr(current_user.role, "value")
        else current_user.role
    )

    if role != "admin" and str(course.seller_id) != str(current_user.id):
        raise HTTPException(status_code=403)

    total_threads = (
        db.query(func.count(ForumThread.id))
        .filter(ForumThread.course_id == course_id)
        .scalar()
        or 0
    )

    total_posts = (
        db.query(func.count(ForumPost.id))
        .join(ForumThread, ForumPost.thread_id == ForumThread.id)
        .filter(ForumThread.course_id == course_id)
        .scalar()
        or 0
    )

    unanswered = (
        db.query(func.count(ForumThread.id))
        .filter(
            ForumThread.course_id == course_id,
            ~ForumThread.posts.any(ForumPost.is_answer == True),
        )
        .scalar()
        or 0
    )

    return {
        "total_threads": total_threads,
        "total_posts": total_posts,
        "unanswered_threads": unanswered,
    }
