from fastapi import APIRouter, Depends, HTTPException, status, Query, Path, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.database import get_db
from app.models.courses import Course, CourseContent
from app.schemas.courses import CourseCreate, CourseResponse, CourseDetail, CourseUpdate, CourseContentCreate,CourseContentResponse
from app.dependencies import get_current_user
from app.models.users import User, UserRole

router = APIRouter(prefix="/courses", tags=["Courses"])

@router.post("/", response_model=CourseResponse)
def create_course(
    course_data: CourseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Solo sellers pueden crear cursos
    if current_user.role != UserRole.seller:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los sellers pueden crear cursos"
        )

    # Crear curso
    course = Course(
        title=course_data.title,
        description=course_data.description,
        price=course_data.price,
        is_published=course_data.is_published,
        seller_id=current_user.id
    )
    db.add(course)
    db.commit()
    db.refresh(course)

    return course

# --- Listar cursos ---
@router.get("/", response_model=list[CourseResponse])
def list_courses(
    seller_id: str | None = Query(None),
    category: str | None = Query(None),
    tags: list[str] | None = Query(None),  # se puede pasar ?tags=python&tags=fastapi
    is_published: bool | None = Query(True),
    db: Session = Depends(get_db)
):
    query = db.query(Course)

    filters = []

    if seller_id:
        filters.append(Course.seller_id == seller_id)
    
    if category:
        filters.append(Course.category.ilike(f"%{category}%"))  # búsqueda parcial
    
    if tags:
        for tag in tags:
            filters.append(Course.tags.any(tag))  # PostgreSQL ARRAY

    if is_published is not None:
        filters.append(Course.is_published == is_published)

    if filters:
        query = query.filter(and_(*filters))

    courses = query.all()
    return courses

# --- DETALLES ---
@router.get("/{course_id}", response_model=CourseDetail)
def get_course(course_id: str, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    return course


# --- DELETE ---
@router.delete("/{course_id}", status_code=204)
def delete_course(
    course_id: str = Path(..., description="ID del curso a eliminar"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Buscar el curso
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")

    # Solo el seller dueño del curso o admin puede eliminar
    if current_user.role != UserRole.admin and course.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado a eliminar este curso")

    db.delete(course)
    db.commit()

    return {"message": "Curso eliminado correctamente"}

# --- UPDATE de un curso ---
@router.patch("/{course_id}", response_model=CourseResponse)
def update_course(
    course_id: str,
    course_data: CourseUpdate = Depends(),  # metadata opcional
    content_file: UploadFile | None = File(None),  # nuevo archivo opcional
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")

    # Solo el seller dueño o admin
    if current_user.role != UserRole.admin and course.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado")

    # Actualizar metadata
    for key, value in course_data.dict(exclude_unset=True).items():
        setattr(course, key, value)

    # Actualizar contenido si llega un archivo
    if content_file:
        # Subir archivo al storage (S3, GCP, local)
        # Por simplicidad ejemplo local:
        file_location = f"storage/{course.id}_{content_file.filename}"
        with open(file_location, "wb") as f:
            f.write(content_file.file.read())
        course.content_url = file_location
        course.content_type = content_file.content_type

    db.commit()
    db.refresh(course)
    return course

