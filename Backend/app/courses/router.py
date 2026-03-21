from fastapi import APIRouter, Depends, HTTPException, status, Query, Path, UploadFile, File as FastAPIFile
from sqlalchemy.orm import Session
from sqlalchemy import and_, func as sqlfunc
from typing import List
from app.database import get_db
from app.models.courses import Course, Module, Bibliography, CourseOffer, ContentBlock
from app.schemas.courses import CourseCreate, CourseResponse, CourseUpdate
from app.dependencies import get_current_user, get_optional_user
from app.models.users import User, UserRole
from app.courses.recommendations import get_recommendations
import uuid

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
        print(f"DEBUG role: {current_user.role!r} type: {type(current_user.role)}")
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
            learning_goals=course_data.queAprendera, # Mapeamos queAprendera a learning_goals
            requirements=course_data.requisitos,
            status="borrador",
            visibility=course_data.visibilidad,
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
                name_public=offer.nombrePublico,
                price_base=offer.precioBase,
                access_type=offer.bloqueAcceso.get("tipo", "permanente"),
                certificate_included=offer.bloqueCertificacion.get("incluida", True)
                # Aquí puedes añadir más campos de los dicts si los mapeaste en el modelo
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
        print(f"Error creando curso: {e}")
        raise HTTPException(status_code=500, detail="Error interno al procesar la estructura del curso")
    
@router.get("/", response_model=List[CourseResponse])
def list_courses(
    seller_id: str | None = Query(None),
    category: str | None = Query(None),
    status: str | None = Query(None), # Reemplaza is_published
    db: Session = Depends(get_db)
):
    query = db.query(Course)
    
    if seller_id:
        query = query.filter(Course.seller_id == seller_id)
    if category:
        query = query.filter(Course.category.ilike(f"%{category}%"))
    if status:
        query = query.filter(Course.status == status)

    courses_db = query.all()

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

    return result

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

# --- DETALLES ---
from sqlalchemy.orm import joinedload

@router.get("/{course_id}", response_model=CourseResponse)
def get_course(course_id: str, db: Session = Depends(get_db)):
    course = db.query(Course).options(
        joinedload(Course.modules).joinedload(Module.blocks),
        joinedload(Course.offers),
        joinedload(Course.bibliography)
    ).filter(Course.id == course_id).first()

    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    
    return course


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

    # 1. Limpiar archivos de todos los bloques antes de borrar la DB
    from app.services.s3_service import s3_service # Late import to avoid circular dependency if any

    for module in course.modules:
        for block in module.blocks:
            if block.content_url and not block.content_url.startswith("http"):
                 s3_service.delete_file(block.content_url)

    # 2. Borrar de la DB (dispara el borrado de módulos/bloques/ofertas)
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
                access_type=offer_schema.access_type,
                certificate_included=offer_schema.certificate_included
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