
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Header
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.courses import Course, ContentBlock, Module
from app.models.users import User, UserRole
from app.dependencies import get_current_user
from app.schemas.courses import  ContentBlockBase,  CourseContentResponse
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
@router.post("/blocks/{block_id}/upload", response_model=CourseContentResponse)
def upload_block_content(
    block_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Buscar el bloque y su curso para validar permisos
    block = db.query(ContentBlock).filter(ContentBlock.id == block_id).first()
    if not block:
        raise HTTPException(status_code=404, detail="Bloque de contenido no encontrado")
    
    # Necesitamos el curso para saber quién es el dueño
    course = db.query(Course).filter(Course.id == block.module.course_id).first()

    if current_user.role != UserRole.admin and course.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para editar este curso")

    # 2. Gestión de archivos (Storage local)
    course_folder = get_course_storage_path(course.id)
    file_name = f"{uuid.uuid4()}_{file.filename}"
    file_location = os.path.join(course_folder, file_name)

    with open(file_location, "wb") as f:
        f.write(file.file.read())

    # 3. Actualizar la URL en el Bloque
    block.content_url = file_location
    db.commit()
    db.refresh(block)

    # Devolvemos un objeto compatible con tu esquema de respuesta
    return CourseContentResponse(
        id=block.id,
        course_id=course.id,
        file_url=block.content_url,
        file_type=block.type,
        order=block.order
    )
# --------------------------
# READ: listar contenidos de un curso
# --------------------------
@router.get("/", response_model=List[ContentBlockBase])
def list_course_contents(
    course_id: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Validar acceso (comprador o dueño)
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    
    if current_user.role != UserRole.admin and course.seller_id != current_user.id:
        require_course_access(db, current_user.id, course_id)
    
    # 2. Obtener todos los bloques de todos los módulos del curso
    # Unimos con Module para filtrar por course_id
    contents = db.query(ContentBlock)\
                 .join(Module)\
                 .filter(Module.course_id == course_id)\
                 .order_by(Module.order, ContentBlock.order)\
                 .all()
    return contents
# --------------------------
# UPDATE: reemplazar o actualizar metadata
# --------------------------
@router.patch("/blocks/{block_id}", response_model=ContentBlockBase)
def update_block_content(
    block_id: str,
    titulo: str | None = Form(None),
    tipo: str | None = Form(None),
    order: int | None = Form(None),
    file: UploadFile | None = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Buscar el bloque
    block = db.query(ContentBlock).filter(ContentBlock.id == block_id).first()
    if not block:
        raise HTTPException(status_code=404, detail="Bloque no encontrado")

    # 2. Validar que el usuario es el dueño del curso
    course = block.module.course
    if current_user.role != UserRole.admin and course.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado para editar este contenido")

    # 3. Si viene un archivo nuevo, reemplazar el anterior
    if file:
        # Borrar archivo viejo si existe para no llenar el disco
        if block.content_url and os.path.exists(block.content_url):
            try: os.remove(block.content_url)
            except: pass

        course_folder = get_course_storage_path(course.id)
        file_name = f"{uuid.uuid4()}_{file.filename}"
        file_location = os.path.join(course_folder, file_name)
        
        with open(file_location, "wb") as f:
            f.write(file.file.read())
        
        block.content_url = file_location

    # 4. Actualizar otros campos
    if titulo is not None: block.title = titulo
    if tipo is not None: block.type = tipo
    if order is not None: block.order = order

    db.commit()
    db.refresh(block)
    return block
# --------------------------
# DELETE: eliminar contenido
# --------------------------
@router.delete("/blocks/{block_id}", status_code=204)
def delete_block_content(
    block_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Buscar bloque y validar dueño
    block = db.query(ContentBlock).filter(ContentBlock.id == block_id).first()
    if not block:
        raise HTTPException(status_code=404, detail="Bloque no encontrado")

    course = block.module.course
    if current_user.role != UserRole.admin and course.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado")

    # 2. Eliminar archivo físico de la carpeta storage
    if block.content_url and os.path.exists(block.content_url):
        try:
            os.remove(block.content_url)
        except Exception as e:
            print(f"Error borrando archivo: {e}")

    # 3. Eliminar de la base de datos
    db.delete(block)
    db.commit()
    return None

def require_course_access(db: Session, user_id: str, course_id: str):
    purchase = db.query(Order).filter(
        Order.user_id == user_id,
        Order.course_id == course_id,
        Order.status == OrderStatus.paid
    ).first()

    if not purchase:
        raise HTTPException(403, "Debes comprar el curso para acceder al contenido")
    
    #__STREAMING__
@router.get("/blocks/{block_id}/stream")
def stream_block_content(
    block_id: str,
    range: str | None = Header(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Buscar el bloque
    block = db.query(ContentBlock).filter(ContentBlock.id == block_id).first()
    if not block or not block.content_url:
        raise HTTPException(status_code=404, detail="Video no disponible")

    # 2. Control de Acceso (Aquí usamos tu lógica de 'require_course_access')
    course_id = block.module.course_id
    if current_user.role != UserRole.admin:
        # Si es el dueño puede verlo, si es alumno validamos compra
        course = db.query(Course).filter(Course.id == course_id).first()
        if course.seller_id != current_user.id:
            require_course_access(db, current_user.id, course_id)

    # 3. Lógica de Streaming (Se mantiene tu excelente implementación de bytes parciales)
    file_path = block.content_url
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Archivo físico no encontrado")

    file_size = os.path.getsize(file_path)
    # ... (Aquí sigue tu código de iter_file() y StreamingResponse que ya tenías)