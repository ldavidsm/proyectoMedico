from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime, timezone

from app.database import get_db
from app.models.users import User, SellerRequest, UserRole, SellerProfile
from app.models.courses import Course, Module, ContentBlock
from app.schemas.users import UserResponse
from app.dependencies import get_current_user
from app.notifications.service import create_notification

router = APIRouter()

# Dependencia: solo admin
def admin_required(current_user: User = Depends(get_current_user)):
    if str(current_user.role) != UserRole.admin.value:
        raise HTTPException(status_code=403, detail="No autorizado")
    return current_user

# ------------------------
# Listar todos los usuarios
# ------------------------
@router.get("/users", response_model=List[UserResponse])
def list_users(db: Session = Depends(get_db), current_user: User = Depends(admin_required)):
    return db.query(User).all()

# ------------------------
# Ver detalle de un usuario
# ------------------------
@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: str, db: Session = Depends(get_db), current_user: User = Depends(admin_required)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user

# ------------------------
# Listar solicitudes de seller (con filtro opcional por status)
# ------------------------
@router.get("/seller-requests")
def list_seller_requests(
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required),
):
    query = db.query(SellerRequest)
    if status:
        query = query.filter(SellerRequest.status == status)

    requests = query.all()

    result = []
    for req in requests:
        user = db.query(User).filter(User.id == req.user_id).first()
        result.append({
            "id": req.id,
            "user_id": req.user_id,
            "user_email": user.email if user else None,
            "user_name": user.full_name if user else None,
            "bio": req.bio,
            "education": req.education,
            "achievements": req.achievements,
            "experience_years": req.experience_years,
            "linkedin_url": req.linkedin_url,
            "website_url": req.website_url,
            "document_url": getattr(req, 'document_url', None),
            "status": req.status,
            "created_at": str(req.created_at) if req.created_at else None,
            "reviewed_by": req.reviewed_by,
            "reviewed_at": str(req.reviewed_at) if req.reviewed_at else None,
        })

    return result

# ------------------------
# Aprobar o rechazar solicitud de seller
# ------------------------
@router.patch("/seller-requests/{request_id}")
async def approve_seller_request(
    request_id: str,
    status: str = Query(..., description="approved or rejected"),
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required),
):
    request = db.query(SellerRequest).filter(SellerRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")

    if status not in ("approved", "rejected"):
        raise HTTPException(status_code=400, detail="Status debe ser 'approved' o 'rejected'")

    request.status = status
    request.reviewed_by = current_user.id
    request.reviewed_at = datetime.now(timezone.utc)

    user = db.query(User).filter(User.id == request.user_id).first()

    if status == "approved" and user:
        user.role = UserRole.seller.value

    db.commit()

    if status == "approved":
        create_notification(
            db, request.user_id, "seller_approved",
            "Ya eres instructor!",
            "Tu solicitud fue aprobada. Ya puedes crear y publicar cursos.",
        )
    else:
        create_notification(
            db, request.user_id, "seller_rejected",
            "Solicitud no aprobada",
            "Tu solicitud de instructor no fue aprobada en este momento.",
        )

    # Send email notification
    if user:
        from app.core.mail_config import send_seller_approved_email, send_seller_rejected_email
        try:
            if status == "approved":
                await send_seller_approved_email(
                    user.email, user.full_name or "Instructor"
                )
            else:
                await send_seller_rejected_email(
                    user.email, user.full_name or "Usuario"
                )
        except Exception:
            pass  # Don't block if email fails

    return {"message": f"Solicitud {'aprobada' if status == 'approved' else 'rechazada'}"}

# ------------------------
# Listar cursos en revisión
# ------------------------
@router.get("/courses/review")
def list_courses_for_review(
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required),
):
    courses = db.query(Course).filter(Course.status == "revision").all()
    result = []
    for course in courses:
        seller = db.query(User).filter(User.id == course.seller_id).first()
        result.append({
            "id": course.id,
            "title": course.title,
            "subtitle": course.subtitle,
            "category": course.category,
            "level": course.level,
            "short_description": course.short_description,
            "status": course.status,
            "seller_id": course.seller_id,
            "seller_name": seller.full_name if seller else None,
            "seller_email": seller.email if seller else None,
            "created_at": str(course.created_at) if course.created_at else None,
            "updated_at": str(course.updated_at) if course.updated_at else None,
        })
    return result

# ------------------------
# Aprobar o rechazar curso
# ------------------------
@router.get("/courses/{course_id}/detail")
def get_course_detail_for_review(
    course_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required),
):
    course = db.query(Course).options(
        joinedload(Course.modules).joinedload(Module.blocks),
    ).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")

    seller = db.query(User).filter(User.id == course.seller_id).first()

    return {
        "id": course.id,
        "title": course.title,
        "subtitle": course.subtitle,
        "category": course.category,
        "level": course.level,
        "short_description": course.short_description,
        "long_description": course.long_description,
        "target_audience": course.target_audience,
        "learning_goals": course.learning_goals,
        "requirements": course.requirements,
        "banner_url": course.banner_url,
        "seller_name": seller.full_name if seller else None,
        "seller_email": seller.email if seller else None,
        "modules": [
            {
                "title": m.title,
                "order": m.order,
                "blocks": [
                    {
                        "title": b.title,
                        "type": b.type,
                        "duration": b.duration,
                    }
                    for b in sorted(m.blocks, key=lambda x: x.order)
                ],
            }
            for m in sorted(course.modules, key=lambda x: x.order)
        ],
    }


@router.patch("/courses/{course_id}/review")
def review_course(
    course_id: str,
    action: str = Query(..., description="approve or reject"),
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")

    if action == "approve":
        course.status = "publicado"
    elif action == "reject":
        course.status = "borrador"
    else:
        raise HTTPException(status_code=400, detail="Action debe ser 'approve' o 'reject'")

    db.commit()

    if action == "approve":
        create_notification(
            db, course.seller_id, "course_approved",
            "Curso aprobado",
            f'Tu curso "{course.title}" ha sido aprobado y esta publicado.',
            {"courseId": course.id},
        )
    else:
        create_notification(
            db, course.seller_id, "course_rejected",
            "Curso necesita cambios",
            f'Tu curso "{course.title}" fue rechazado. Revisa y vuelve a enviar.',
            {"courseId": course.id},
        )

    return {"message": f"Curso {'aprobado' if action == 'approve' else 'rechazado'}"}


@router.patch("/sellers/{user_id}/verify")
def verify_seller(
    user_id: str,
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_db),
):
    profile = db.query(SellerProfile).filter(
        SellerProfile.user_id == user_id
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")

    profile.is_verified = True
    db.commit()

    return {"message": "Seller verificado"}
