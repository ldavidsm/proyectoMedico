from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query, Path, UploadFile, File as FastAPIFile
from sqlalchemy.orm import Session
from sqlalchemy import and_, func as sqlfunc
from typing import List, Optional
from app.database import get_db
from app.models.courses import Course, Module, Bibliography, CourseOffer, ContentBlock
from app.models.orders import Order, OrderStatus
from app.schemas.courses import CourseCreate, CourseResponse, CourseUpdate
from app.dependencies import get_current_user, get_optional_user
from app.models.users import User, UserRole
from app.courses.recommendations import get_recommendations
import uuid
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/courses", tags=["Courses"])

@router.post(
    "/", 
    response_model=CourseResponse,
    summary="Crear un nuevo curso",
    description="Crea un borrador de curso. Solo los usuarios con rol 'seller' pueden crear cursos. Permite incluir módulos, bloques, ofertas y bibliografía. El curso se creará con estado 'borrador' by default."
)
def create_course(
    course_data: CourseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Seguridad: Solo sellers
    if str(current_user.role) != UserRole.seller.value:
        raise HTTPException(status_code=403, detail="Solo los sellers pueden crear cursos")

    try:
        # 2. Crear la cabecera del curso
        new_course = Course(
            title=course_data.titulo,
            subtitle=course_data.subtitulo,
            category=course_data.categoria,
            topic=course_data.tema,
            subtopic=course_data.subtema,
            level=course_data.nivelCurso,
            short_description=course_data.descripcionCorta,
            long_description=course_data.descripcionDetallada,
            target_audience=course_data.publicoObjetivo,
            learning_goals=course_data.queAprendera,
            requirements=course_data.requisitos,
            status="borrador",
            visibility=course_data.visibilidad,
            has_forum=course_data.has_forum or False,
            progression_type=course_data.progresionContenido or 'libre',
            requires_professional_profile=course_data.requires_professional_profile or False,
            seller_id=current_user.id
        )
        db.add(new_course)
        db.flush() # Flush genera el ID del curso sin hacer commit todavía

        # 3. Guardar Bibliografía
        for bib in course_data.bibliografia:
            new_bib = Bibliography(
                course_id=new_course.id,
                type=bib.tipo,
                reference_text=bib.referencia,
                doi_url=bib.enlaceDOI
            )
            db.add(new_bib)

        # 4. Guardar Ofertas (Precios)
        for offer in course_data.ofertas:
            new_offer = CourseOffer(
                course_id=new_course.id,
                name_public=offer.name_public,
                price_base=offer.price_base,
                is_recommended=offer.is_recommended or False,
                currency_origin=offer.currency_origin,
                country_origin=offer.country_origin,
                country_prices=offer.country_prices,
                inscription_type=offer.inscription_type or 'siempre',
                max_students=offer.max_students,
                accompaniment=offer.accompaniment,
                chat_questions_per_student=offer.chat_questions_per_student,
                chat_response_time=offer.chat_response_time,
                access_content=offer.access_content or 'vitalicio',
                access_months=offer.access_months,
                access_type=offer.access_type,
                certificate_included=offer.certificate_included,
                certificate_min_progress=offer.certificate_min_progress,
                certificate_requires_exam=offer.certificate_requires_exam,
            )
            db.add(new_offer)

        # 5. Guardar Módulos y sus Bloques (Jerarquía)
        for i, mod_schema in enumerate(course_data.modulos):
            new_module = Module(
                course_id=new_course.id,
                title=mod_schema.title,
                description=mod_schema.description,
                order=i
            )
            db.add(new_module)
            db.flush() # Genera ID del módulo

            for j, block_schema in enumerate(mod_schema.blocks):
                new_block = ContentBlock(
                    module_id=new_module.id,
                    type=block_schema.type,
                    title=block_schema.title,
                    order=j,
                    content_url=block_schema.content_url,
                    body_text=block_schema.body_text,
                    duration=block_schema.duration,
                    quiz_data=block_schema.quiz_data
                )
                db.add(new_block)

        db.commit()
        db.refresh(new_course)
        return new_course

    except Exception as e:
        db.rollback()
        logger.error(f"Error creando curso: {e}")
        raise HTTPException(status_code=500, detail="Error interno al procesar la estructura del curso")
    
@router.get("/")
def list_courses(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    seller_id: str | None = Query(None),
    category: str | None = Query(None),
    status: str | None = Query(None),
    search: str | None = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Course)

    if seller_id:
        query = query.filter(Course.seller_id == seller_id)
    if category:
        query = query.filter(Course.category.ilike(f"%{category}%"))
    if status:
        query = query.filter(Course.status == status)
    if search:
        query = query.filter(
            Course.title.ilike(f"%{search}%")
            | Course.short_description.ilike(f"%{search}%")
        )

    total = query.count()
    courses_db = query.order_by(Course.created_at.desc()).offset(
        (page - 1) * limit
    ).limit(limit).all()

    # Compute min_price and total_blocks for each course
    result = []
    for course in courses_db:
        course_dict = CourseResponse.model_validate(course).model_dump()

        min_price = (
            db.query(sqlfunc.min(CourseOffer.price_base))
            .filter(CourseOffer.course_id == course.id)
            .scalar()
        )
        total_blocks = (
            db.query(sqlfunc.count(ContentBlock.id))
            .join(Module, ContentBlock.module_id == Module.id)
            .filter(Module.course_id == course.id)
            .scalar() or 0
        )

        course_dict["min_price"] = min_price
        course_dict["total_blocks"] = total_blocks
        result.append(course_dict)

    return {
        "data": result,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit,
            "has_next": page * limit < total,
            "has_prev": page > 1,
        },
    }

# --- RECOMMENDATIONS ---
@router.get("/recommendations", response_model=List[CourseResponse])
def get_course_recommendations(
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
    limit: int = 6
):
    courses = get_recommendations(
        db,
        user_id=current_user.id if current_user else None,
        limit=limit,
    )
    return courses

# --- PLATFORM STATS (public) ---
@router.get("/platform-stats")
def get_platform_stats(db: Session = Depends(get_db)):
    """Estadísticas públicas de la plataforma. No requiere autenticación."""
    from sqlalchemy import distinct

    total_courses = db.query(sqlfunc.count(Course.id)).filter(
        Course.status == "publicado"
    ).scalar() or 0

    total_users = db.query(sqlfunc.count(User.id)).filter(
        User.is_active == True
    ).scalar() or 0

    total_instructors = db.query(sqlfunc.count(User.id)).filter(
        User.role == UserRole.seller.value
    ).scalar() or 0

    total_specialties = db.query(
        sqlfunc.count(distinct(Course.category))
    ).filter(
        Course.status == "publicado",
        Course.category.isnot(None)
    ).scalar() or 0

    # Fallback: if no published courses have categories, count all categories
    if total_specialties == 0:
        total_specialties = db.query(
            sqlfunc.count(distinct(Course.category))
        ).filter(
            Course.category.isnot(None),
            Course.category != ''
        ).scalar() or 0

    return {
        "total_courses": total_courses,
        "total_users": total_users,
        "total_instructors": total_instructors,
        "total_specialties": total_specialties,
    }

# --- RELATED COURSES ---
@router.get("/{course_id}/related")
def get_related_courses(
    course_id: str,
    limit: int = Query(4, le=8),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """Courses from the same category, ordered by rating."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")

    related = db.query(Course).filter(
        Course.id != course_id,
        Course.category == course.category,
        Course.status == "publicado",
        Course.visibility == "publico",
    ).order_by(
        Course.rating_avg.desc(),
        Course.rating_count.desc(),
    ).limit(limit).all()

    if len(related) < limit:
        existing_ids = {c.id for c in related} | {course_id}
        extra = db.query(Course).filter(
            Course.id.notin_(existing_ids),
            Course.status == "publicado",
            Course.visibility == "publico",
        ).order_by(
            Course.rating_avg.desc(),
        ).limit(limit - len(related)).all()
        related.extend(extra)

    return related


# --- DETALLES ---
from sqlalchemy.orm import joinedload

@router.get("/{course_id}")
def get_course(course_id: str, db: Session = Depends(get_db)):
    course = db.query(Course).options(
        joinedload(Course.modules).joinedload(Module.blocks),
        joinedload(Course.offers),
        joinedload(Course.bibliography)
    ).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")

    course_data = CourseResponse.model_validate(course).model_dump()

    # Buscar oferta con convocatoria activa o próxima
    now = datetime.now(timezone.utc)
    active_offer = db.query(CourseOffer).filter(
        CourseOffer.course_id == course_id,
        CourseOffer.inscription_type == 'convocatoria',
    ).order_by(CourseOffer.course_start.asc()).first()

    cohort_info = None
    if active_offer:
        enrolled = db.query(sqlfunc.count(Order.id)).filter(
            Order.course_id == course_id,
            Order.offer_id == active_offer.id,
            Order.status == OrderStatus.paid,
        ).scalar() or 0

        spots_left = None
        if active_offer.max_students:
            spots_left = max(0, active_offer.max_students - enrolled)

        cohort_info = {
            "enrollment_start": active_offer.enrollment_start.isoformat() if active_offer.enrollment_start else None,
            "enrollment_end": active_offer.enrollment_end.isoformat() if active_offer.enrollment_end else None,
            "course_start": active_offer.course_start.isoformat() if active_offer.course_start else None,
            "course_end": active_offer.course_end.isoformat() if active_offer.course_end else None,
            "max_students": active_offer.max_students,
            "enrolled_count": enrolled,
            "spots_left": spots_left,
            "enrollment_open": (
                (not active_offer.enrollment_start or
                 now >= active_offer.enrollment_start) and
                (not active_offer.enrollment_end or
                 now <= active_offer.enrollment_end)
            ),
            "course_started": (
                active_offer.course_start is not None and
                now >= active_offer.course_start
            ),
        }

    course_data["cohort_info"] = cohort_info

    # Seller profile info
    from app.models.users import User as UserModel, ProfessionalProfile
    seller = db.query(UserModel).filter(UserModel.id == course.seller_id).first()
    seller_profile = None
    if seller:
        prof = db.query(ProfessionalProfile).filter(
            ProfessionalProfile.user_id == seller.id
        ).first()
        seller_profile = {
            "id": seller.id,
            "name": seller.full_name or '',
            "bio": prof.bio if prof else None,
            "specialty": prof.specialties[0] if prof and prof.specialties else None,
            "image": prof.profile_image if prof else None,
            "credentials": prof.credentials if prof else None,
        }
    course_data["seller_profile"] = seller_profile

    return course_data


# --- DELETE ---
@router.delete("/{course_id}", status_code=204)
def delete_course(
    course_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")

    if str(current_user.role) != UserRole.admin.value and course.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado")

    # 1. Limpiar archivos S3 (best effort)
    try:
        from app.services.s3_service import s3_service
        for module in course.modules:
            for block in module.blocks:
                if block.content_url and not block.content_url.startswith("http"):
                    s3_service.delete_file(block.content_url)
    except Exception as e:
        logger.warning(f"S3 cleanup failed for course {course_id}: {e}")

    # 2. Limpiar registros dependientes sin cascade configurado
    from app.models.courses import CourseContent, CourseReview, UserProgress, Bibliography
    from app.models.orders import Order
    from app.models.users import Favorite
    from app.models.forum import ForumThread, ForumPost
    from app.models.collections import CollectionCourse
    from app.models.cohorts import Cohort, CohortMember
    from app.models.webinars import Webinar
    from app.models.messaging import Message, MessageReply, CourseAnnouncement, TaskSubmission

    # Forum: posts depend on threads, delete posts first
    thread_ids = [t.id for t in db.query(ForumThread.id).filter(ForumThread.course_id == course_id).all()]
    if thread_ids:
        db.query(ForumPost).filter(ForumPost.thread_id.in_(thread_ids)).delete(synchronize_session=False)
    db.query(ForumThread).filter(ForumThread.course_id == course_id).delete(synchronize_session=False)

    # Cohorts: members depend on cohorts, delete members first
    cohort_ids = [c.id for c in db.query(Cohort.id).filter(Cohort.course_id == course_id).all()]
    if cohort_ids:
        db.query(CohortMember).filter(CohortMember.cohort_id.in_(cohort_ids)).delete(synchronize_session=False)
    db.query(Cohort).filter(Cohort.course_id == course_id).delete(synchronize_session=False)

    # Messaging: replies depend on messages, delete replies first
    message_ids = [m.id for m in db.query(Message.id).filter(Message.course_id == course_id).all()]
    if message_ids:
        db.query(MessageReply).filter(MessageReply.message_id.in_(message_ids)).delete(synchronize_session=False)
    db.query(Message).filter(Message.course_id == course_id).delete(synchronize_session=False)
    db.query(CourseAnnouncement).filter(CourseAnnouncement.course_id == course_id).delete(synchronize_session=False)
    db.query(TaskSubmission).filter(TaskSubmission.course_id == course_id).delete(synchronize_session=False)

    # Tablas directas
    db.query(CourseContent).filter(CourseContent.course_id == course_id).delete(synchronize_session=False)
    db.query(CourseReview).filter(CourseReview.course_id == course_id).delete(synchronize_session=False)
    db.query(UserProgress).filter(UserProgress.course_id == course_id).delete(synchronize_session=False)
    db.query(Bibliography).filter(Bibliography.course_id == course_id).delete(synchronize_session=False)
    db.query(Order).filter(Order.course_id == course_id).delete(synchronize_session=False)
    db.query(Favorite).filter(Favorite.course_id == course_id).delete(synchronize_session=False)
    db.query(CollectionCourse).filter(CollectionCourse.course_id == course_id).delete(synchronize_session=False)
    db.query(Webinar).filter(Webinar.course_id == course_id).update({"course_id": None}, synchronize_session=False)

    # Flush para que los deletes se ejecuten en la DB antes del cascade
    db.flush()

    # 4. Borrar curso (cascade eliminará modules/blocks/offers)
    db.delete(course)
    db.commit()

    return None

# --- UPDATE de un curso ---
@router.patch(
    "/{course_id}", 
    response_model=CourseResponse,
    summary="Actualizar un curso (Autoguardado)",
    description="Actualiza parcialmente la información de un curso. Puede modificar la cabecera (título, descripción, visibilidad) y recrear módulos y ofertas si se proveen."
)
def update_course(
    course_id: str,
    course_data: CourseUpdate, # Recibimos el JSON de actualización
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")

    if str(current_user.role) != UserRole.admin.value and course.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado")

    # Mapeo de campos actualizados (Figma -> DB)
    update_data = course_data.model_dump(exclude_unset=True)
    
    field_mapping = {
        "titulo": "title",
        "subtitulo": "subtitle",
        "descripcionCorta": "short_description",
        "descripcionDetallada": "long_description",
        "visibilidad": "visibility",
        "publicoObjetivo": "target_audience",
        "queAprendera": "learning_goals",
        "requisitos": "requirements",
        "categoria": "category",
        "tema": "topic",
        "subtema": "subtopic",
        "nivelCurso": "level",
        "dirigidoA": "directed_to",
        "modalidades": "modalities",
        "has_forum": "has_forum",
        "progresionContenido": "progression_type",
        "requires_professional_profile": "requires_professional_profile",
    }

    for key, value in update_data.items():
        if key in field_mapping:
            setattr(course, field_mapping[key], value)

    # Módulos — recrear si vienen
    if "modulos" in update_data and course_data.modulos is not None:
        for mod in course.modules:
            db.delete(mod)
        db.flush()
        for i, mod_schema in enumerate(course_data.modulos):
            new_module = Module(
                course_id=course.id,
                title=mod_schema.title,
                description=mod_schema.description,
                order=i
            )
            db.add(new_module)
            db.flush()
            for j, block_schema in enumerate(mod_schema.blocks):
                new_block = ContentBlock(
                    module_id=new_module.id,
                    type=block_schema.type,
                    title=block_schema.title,
                    order=j,
                    content_url=block_schema.content_url,
                    body_text=block_schema.body_text,
                    duration=block_schema.duration,
                    quiz_data=block_schema.quiz_data
                )
                db.add(new_block)

    # Ofertas — recrear si vienen
    if "ofertas" in update_data and course_data.ofertas is not None:
        for offer in course.offers:
            db.delete(offer)
        db.flush()
        for offer_schema in course_data.ofertas:
            new_offer = CourseOffer(
                course_id=course.id,
                name_public=offer_schema.name_public,
                price_base=offer_schema.price_base,
                is_recommended=offer_schema.is_recommended or False,
                currency_origin=offer_schema.currency_origin,
                country_origin=offer_schema.country_origin,
                country_prices=offer_schema.country_prices,
                inscription_type=offer_schema.inscription_type or 'siempre',
                max_students=offer_schema.max_students,
                accompaniment=offer_schema.accompaniment,
                chat_questions_per_student=offer_schema.chat_questions_per_student,
                chat_response_time=offer_schema.chat_response_time,
                access_content=offer_schema.access_content or 'vitalicio',
                access_months=offer_schema.access_months,
                access_type=offer_schema.access_type,
                certificate_included=offer_schema.certificate_included,
                certificate_min_progress=offer_schema.certificate_min_progress,
                certificate_requires_exam=offer_schema.certificate_requires_exam,
            )
            db.add(new_offer)

    # Bibliografía — recrear si vienen
    if "bibliografia" in update_data and course_data.bibliografia is not None:
        for bib in course.bibliography:
            db.delete(bib)
        db.flush()
        for bib_schema in course_data.bibliografia:
            new_bib = Bibliography(
                course_id=course.id,
                type=bib_schema.type,
                reference_text=bib_schema.reference_text,
                doi_url=bib_schema.doi_url
            )
            db.add(new_bib)

    db.commit()
    db.refresh(course)
    return course


# ─────────────────────────────────────────────────────────────────────────────
# PUBLISH: POST /courses/{course_id}/publish
# ─────────────────────────────────────────────────────────────────────────────

@router.post(
    "/{course_id}/publish", 
    response_model=CourseResponse,
    summary="Enviar curso a revisión",
    description="Cambia el estado del curso a 'revision'. Valida que el curso tenga título, módulos y ofertas antes de permitir el envío."
)
def publish_course(
    course_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from sqlalchemy.orm import joinedload

    course = db.query(Course).options(
        joinedload(Course.modules).joinedload(Module.blocks),
        joinedload(Course.offers),
        joinedload(Course.bibliography)
    ).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")

    # Only the owner (or admin) can publish
    if str(current_user.role) != UserRole.admin.value and course.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado")

    # Minimum-field validation
    campos_faltantes = []
    if not course.title:
        campos_faltantes.append("titulo")
    if not course.modules:
        campos_faltantes.append("modulos")
    if not course.offers:
        campos_faltantes.append("ofertas")

    if campos_faltantes:
        raise HTTPException(
            status_code=422,
            detail={
                "message": "Faltan campos requeridos para publicar",
                "campos_faltantes": campos_faltantes
            }
        )

    course.status = "revision"
    db.commit()
    db.refresh(course)
    return course


# ─────────────────────────────────────────────────────────────────────────────
# BANNER UPLOAD: POST /courses/{course_id}/banner
# ─────────────────────────────────────────────────────────────────────────────

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}

@router.post(
    "/{course_id}/banner", 
    response_model=dict,
    summary="Subir imagen de banner",
    description="Sube una imagen (JPEG, PNG, WEBP) a S3 para usarla como banner del curso. Retorna la clave de S3 generada en la base de datos."
)
async def upload_banner(
    course_id: str,
    file: UploadFile = FastAPIFile(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")

    if str(current_user.role) != UserRole.admin.value and course.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado")

    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Formato no permitido. Use: {', '.join(ALLOWED_IMAGE_TYPES)}"
        )

    # Generate a unique S3 key for the banner
    ext = (file.filename or "image").rsplit(".", 1)[-1].lower()
    s3_key = f"banners/{course_id}/{uuid.uuid4()}.{ext}"

    # Read file into memory and upload directly to S3
    from app.services.s3_service import s3_service
    file_data = await file.read()

    try:
        s3_service.client.put_object(
            Bucket=s3_service.bucket_name,
            Key=s3_key,
            Body=file_data,
            ContentType=file.content_type or "image/jpeg",
        )
    except Exception as e:
        raise HTTPException(
            status_code=503, 
            detail="Servicio de almacenamiento no disponible. Configura las variables AWS."
        )

    # Delete old banner from S3 if it exists
    if course.banner_url:
        s3_service.delete_file(course.banner_url)

    # Persist the S3 key
    course.banner_url = s3_key
    db.commit()
    db.refresh(course)

    return {"banner_url": s3_key}