
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Header
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.courses import Course, CourseContent
from app.models.users import User, UserRole
from app.dependencies import get_current_user
from app.schemas.courses import CourseContentResponse
from app.models.orders import Order, OrderStatus
from app.services.access import require_course_owner_or_admin

import os
import uuid

router = APIRouter()

# Carpeta de almacenamiento local (solo MVP)
STORAGE_PATH = "storage"
os.makedirs(STORAGE_PATH, exist_ok=True)

def get_course_storage_path(course_id: str) -> str:
    """Devuelve la ruta de almacenamiento de un curso específico y la crea si no existe"""
    path = os.path.join(STORAGE_PATH, course_id)
    os.makedirs(path, exist_ok=True)
    return path
# --------------------------
# CREATE: subir contenido
# --------------------------
@router.post("/", response_model=CourseContentResponse)
def upload_course_content(
    course_id: str,
    file: UploadFile = File(...),
    file_type: str = Form(...),
    order: int = Form(0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")

    if current_user.role != UserRole.admin and course.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado")

    # Guardar archivo localmente
    file_name = f"{uuid.uuid4()}_{file.filename}"
    course_folder = get_course_storage_path(course_id)
    file_location = os.path.join(course_folder, file_name)

    with open(file_location, "wb") as f:
        f.write(file.file.read())

    # Crear registro en DB
    content = CourseContent(
        course_id=course.id,
        file_url=file_location,
        file_type=file_type,
        order=order
    )
    db.add(content)
    db.commit()
    db.refresh(content)
    return content

# --------------------------
# READ: listar contenidos de un curso
# --------------------------
@router.get("/", response_model=List[CourseContentResponse])
def list_course_contents(course_id: str, 
                         db: Session = Depends(get_db),
                         current_user: User = Depends(get_current_user)):
    
    require_course_access(db, current_user.id, course_id)
    
    contents = db.query(CourseContent)\
                 .filter(CourseContent.course_id == course_id)\
                 .order_by(CourseContent.order)\
                 .all()
    return contents

# --------------------------
# UPDATE: reemplazar o actualizar metadata
# --------------------------
@router.patch("/{content_id}", response_model=CourseContentResponse)
def update_course_content(
    course_id: str,
    content_id: str,
    file: UploadFile | None = File(None),
    file_type: str | None = Form(None),
    order: int | None = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_course_owner_or_admin(current_user, course)
    content = db.query(CourseContent).filter(CourseContent.id == content_id,
                                             CourseContent.course_id == course_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Contenido no encontrado")

    course = db.query(Course).filter(Course.id == course_id).first()
    if current_user.role != UserRole.admin and course.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado")

    # Reemplazar archivo si se envía uno nuevo
    if file:
        course_folder = get_course_storage_path(course_id)
        file_name = f"{uuid.uuid4()}_{file.filename}"
        file_location = os.path.join(course_folder, file_name)
        with open(file_location, "wb") as f:
            f.write(file.file.read())
        content.file_url = file_location

    # Actualizar metadata
    if file_type is not None:
        content.file_type = file_type
    if order is not None:
        content.order = order

    db.commit()
    db.refresh(content)
    return content

# --------------------------
# DELETE: eliminar contenido
# --------------------------
@router.delete("/{content_id}", status_code=204)
def delete_course_content(
    course_id: str,
    content_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_course_owner_or_admin(current_user, course)

    content = db.query(CourseContent).filter(CourseContent.id == content_id,
                                             CourseContent.course_id == course_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Contenido no encontrado")

    course = db.query(Course).filter(Course.id == course_id).first()
    if current_user.role != UserRole.admin and course.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado")

    # Eliminar archivo local
    if os.path.exists(content.file_url):
        os.remove(content.file_url)

    db.delete(content)
    db.commit()
    return {"message": "Contenido eliminado correctamente"}


def require_course_access(db: Session, user_id: str, course_id: str):
    purchase = db.query(Order).filter(
        Order.user_id == user_id,
        Order.course_id == course_id,
        Order.status == OrderStatus.paid
    ).first()

    if not purchase:
        raise HTTPException(403, "Debes comprar el curso para acceder al contenido")
    
    #__STREAMING__
@router.get("/{content_id}/stream")
def stream_course_content(
    course_id: str,
    content_id: str,
    range: str | None = Header(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    content = db.query(CourseContent).filter(
        CourseContent.id == content_id,
        CourseContent.course_id == course_id
    ).first()

    if not content:
        raise HTTPException(status_code=404, detail="Contenido no encontrado")

    course = db.query(Course).filter(Course.id == course_id).first()

    # Control de acceso
    if current_user.role != UserRole.admin:
        if current_user.role == UserRole.seller and course.seller_id != current_user.id:
            raise HTTPException(status_code=403, detail="No autorizado")
        if current_user.role == UserRole.buyer:
            require_course_access(db, current_user.id, course_id)

    file_path = content.file_url
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")

    file_size = os.path.getsize(file_path)
    start = 0
    end = file_size - 1

    # Manejar rango de bytes (para streaming parcial)
    if range:
        bytes_range = range.replace("bytes=", "").split("-")
        if bytes_range[0]:
            start = int(bytes_range[0])
        if len(bytes_range) > 1 and bytes_range[1]:
            end = int(bytes_range[1])

    # Función generadora para el streaming
    def iter_file():
        with open(file_path, "rb") as f:
            f.seek(start)
            remaining = end - start + 1
            chunk_size = 1024 * 1024  # 1 MB
            while remaining > 0:
                read_bytes = min(chunk_size, remaining)
                data = f.read(read_bytes)
                if not data:
                    break
                remaining -= len(data)
                yield data

    headers = {
        "Content-Range": f"bytes {start}-{end}/{file_size}",
        "Accept-Ranges": "bytes",
        "Content-Length": str(end - start + 1),
        "Content-Type": "application/octet-stream",
    }

    return StreamingResponse(iter_file(), headers=headers, status_code=206)
   