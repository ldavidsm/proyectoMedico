import os
from fastapi import APIRouter, Depends, HTTPException, status, Query, Path, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List
from app.database import get_db
from app.models.courses import Course, Module, Bibliography, CourseOffer, ContentBlock
from app.schemas.courses import CourseCreate, CourseResponse, CourseUpdate
from app.dependencies import get_current_user
from app.models.users import User, UserRole

router = APIRouter(prefix="/courses", tags=["Courses"])

@router.post("/", response_model=CourseResponse)
def create_course(
    course_data: CourseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Seguridad: Solo sellers
    if current_user.role != UserRole.seller:
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
            status=course_data.visibilidad,
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
                title=mod_schema.nombre,
                description=mod_schema.descripcion,
                order=i
            )
            db.add(new_module)
            db.flush() # Genera ID del módulo

            for j, block_schema in enumerate(mod_schema.bloques):
                new_block = ContentBlock(
                    module_id=new_module.id,
                    type=block_schema.tipo,
                    title=block_schema.titulo,
                    order=j,
                    content_url=block_schema.url,
                    body_text=block_schema.contenido,
                    duration=block_schema.duracion,
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
    
    results = []
    for course in courses_db:
        # Pydantic v2 usa model_validate en lugar de from_orm
        course_data = CourseResponse.model_validate(course)
        
        # Mapeo manual de campos de Figma para compatibilidad
        course_data.titulo = course.title
        course_data.visibilidad = course.status
        
        # Datos estadísticos (Mock por ahora)
        course_data.students_count = 0 
        results.append(course_data)

    return results
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
    
    # Mapeo manual para asegurar que el JSON coincida con Figma
    response = CourseResponse.model_validate(course)
    response.titulo = course.title
    response.queAprendera = course.learning_goals
    response.publicoObjetivo = course.target_audience
    
    return response


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

    if current_user.role != UserRole.admin and course.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado")

    # 1. Limpiar archivos de todos los bloques antes de borrar la DB
    for module in course.modules:
        for block in module.blocks:
            if block.content_url and os.path.exists(block.content_url):
                try: os.remove(block.content_url)
                except: pass

    # 2. Borrar de la DB (dispara el borrado de módulos/bloques/ofertas)
    db.delete(course)
    db.commit()

    return None

# --- UPDATE de un curso ---
@router.patch("/{course_id}", response_model=CourseResponse)
def update_course(
    course_id: str,
    course_data: CourseUpdate, # Recibimos el JSON de actualización
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")

    if current_user.role != UserRole.admin and course.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado")

    # Mapeo de campos actualizados (Figma -> DB)
    update_data = course_data.model_dump(exclude_unset=True)
    
    field_mapping = {
        "titulo": "title",
        "subtitulo": "subtitle",
        "descripcionCorta": "short_description",
        "descripcionDetallada": "long_description",
        "visibilidad": "status"
    }

    for key, value in update_data.items():
        db_field = field_mapping.get(key, key)
        if hasattr(course, db_field):
            setattr(course, db_field, value)

    db.commit()
    db.refresh(course)
    return course