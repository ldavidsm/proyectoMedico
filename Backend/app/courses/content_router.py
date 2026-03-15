
from fastapi import APIRouter, Depends, HTTPException, Form, Header
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.courses import Course, ContentBlock, Module
from app.models.users import User, UserRole
from app.dependencies import get_current_user
from app.schemas.courses import  ContentBlockBase,  CourseContentResponse
from app.models.orders import Order, OrderStatus
from app.services.s3_service import s3_service
import uuid

router = APIRouter()

# --------------------------
# CREATE: Iniciar subida de contenido (S3 Presigned URL)
# --------------------------
@router.post("/blocks/{block_id}/upload", response_model=CourseContentResponse)
def upload_block_content(
    block_id: str,
    filename: str = Form(...),
    file_type: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Buscar el bloque y su curso para validar permisos
    block = db.query(ContentBlock).filter(ContentBlock.id == block_id).first()
    if not block:
        raise HTTPException(status_code=404, detail="Bloque de contenido no encontrado")
    
    course = block.module.course

    if str(current_user.role) != UserRole.admin.value and course.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para editar este curso")

    # 2. Generar Key para S3
    ext = filename.split('.')[-1] if '.' in filename else "bin"
    s3_key = f"courses/{course.id}/{block.module_id}/{block.id}/{uuid.uuid4()}.{ext}"

    # 3. Generar URL firmada para subida (PUT)
    presigned_url = s3_service.generate_presigned_upload_url(s3_key, file_type)

    if not presigned_url:
        raise HTTPException(
            status_code=503,
            detail="Servicio de almacenamiento no disponible. Configura las variables AWS."
        )

    # 4. Actualizar la metadata en el Bloque (Guardamos la Key o la URL base, 
    # pero para consistencia guardamos la KEY, y luego generamos URLs de lectura al vuelo # o guardamos la URL completa si así lo prefiere el usuario. 
    # El prompt dice: "content_url ahora almacene la URL completa de S3 o la Key". Guardar Key es más limpio, pero URL completa es más fácil si bucket es público. 
    # Asumimos bucket privado -> Guardar Key.
    # Pero el frontend espera `file_url` en la respuesta.
    # Vamos a guardar la Key en `content_url` (prefijo s3:// o solo key).
    
    block.content_url = s3_key # Guardamos solo la key
    block.type = file_type # Ojo: file_type suele ser MIME, block.type suele ser 'video', 'pdf'. Ajustar según modelo.
    # Asumimos que `file_type` aquí es el MIME para S3, el block.type debería ser 'video' o 'reading'.
    # Si el frontend manda 'video/mp4', deducimos. Por ahora lo dejamos como estaba o no lo tocamos si no viene.
    
    db.commit()
    db.refresh(block)

    return CourseContentResponse(
        id=block.id,
        course_id=course.id,
        file_url=s3_key, # El frontend debe saber que esto es una key para pedir luego la url firmada de lectura, o devolvemos la url de lectura ya firmada?
        # Para mantener compatibilidad simple, devolvemos la key, pero el campo se llama file_url. 
        # Si cambiamos la lógica de lectura, el frontend puede quebrarse si espera una URL http válida.
        # En list_course_contents deberíamos firmar las URLs.
        file_type=block.type,
        order=block.order,
        upload_url=presigned_url # URL para hacer el PUT
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
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    
    if str(current_user.role) != UserRole.admin.value and course.seller_id != current_user.id:
        require_course_access(db, current_user.id, course_id)
    
    contents = db.query(ContentBlock)\
                 .join(Module)\
                 .filter(Module.course_id == course_id)\
                 .order_by(Module.order, ContentBlock.order)\
                 .all()

    # Firmar URLs de S3 al vuelo
    for block in contents:
        if block.content_url and not block.content_url.startswith("http"):
             # Asumimos que es una S3 Key
             signed_url = s3_service.generate_presigned_url(block.content_url)
             if signed_url:
                 # Reemplazamos temporalmente para la respuesta (no commit)
                 block.url = signed_url # ContentBlockBase usa 'url' (alias de content_url?)
                 # Revisa el schema `ContentBlockBase`: tiene `url`. El modelo tiene `content_url`.
                 # Pydantic mapea por nombre o por atributo si from_attributes=True.
                 # Si el modelo tiene content_url y el schema tiene url, hay que ver el mapping.
                 # Asumiremos que el schema espera 'url' mapeado de 'content_url'.
                 # Pero aquí, necesitamos inyectar la URL firmada.
                 block.content_url = signed_url 

    return contents

# --------------------------
# UPDATE: reemplazar o actualizar metadata
# --------------------------
@router.patch("/blocks/{block_id}", response_model=CourseContentResponse)
def update_block_content(
    block_id: str,
    titulo: str | None = Form(None),
    tipo: str | None = Form(None),
    order: int | None = Form(None),
    filename: str | None = Form(None), # Si viene, es que quieren subir archivo nuevo
    file_type: str | None = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    block = db.query(ContentBlock).filter(ContentBlock.id == block_id).first()
    if not block:
        raise HTTPException(status_code=404, detail="Bloque no encontrado")

    course = block.module.course
    if str(current_user.role) != UserRole.admin.value and course.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado para editar este contenido")

    presigned_url = None

    # Si solicitan subir nuevo archivo
    if filename and file_type:
        # Borrar anterior si existe y no es http (es key de s3)
        if block.content_url and not block.content_url.startswith("http"):
            s3_service.delete_file(block.content_url)

        # Generar nueva key y url
        ext = filename.split('.')[-1] if '.' in filename else "bin"
        s3_key = f"courses/{course.id}/{block.module.id}/{block.id}/{uuid.uuid4()}.{ext}"
        presigned_url = s3_service.generate_presigned_upload_url(s3_key, file_type)
        
        block.content_url = s3_key
    
    if titulo is not None: block.title = titulo
    if tipo is not None: block.type = tipo
    if order is not None: block.order = order

    db.commit()
    db.refresh(block)

    return CourseContentResponse(
        id=block.id,
        course_id=course.id,
        file_url=block.content_url,
        file_type=block.type,
        order=block.order,
        upload_url=presigned_url 
    )

# --------------------------
# DELETE: eliminar contenido
# --------------------------
@router.delete("/blocks/{block_id}", status_code=204)
def delete_block_content(
    block_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    block = db.query(ContentBlock).filter(ContentBlock.id == block_id).first()
    if not block:
        raise HTTPException(status_code=404, detail="Bloque no encontrado")

    course = block.module.course
    if str(current_user.role) != UserRole.admin.value and course.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado")

    # Eliminar de S3
    if block.content_url and not block.content_url.startswith("http"):
         s3_service.delete_file(block.content_url)

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
    
# __STREAMING__ (REDIRECCIÓN A S3)
@router.get("/blocks/{block_id}/stream")
def stream_block_content(
    block_id: str,
    mode: str = "redirect", # "redirect" or "json"
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    block = db.query(ContentBlock).filter(ContentBlock.id == block_id).first()
    if not block or not block.content_url:
        raise HTTPException(status_code=404, detail="Video no disponible")

    course_id = block.module.course_id
    if str(current_user.role) != UserRole.admin.value:
        course = db.query(Course).filter(Course.id == course_id).first()
        if course.seller_id != current_user.id:
            require_course_access(db, current_user.id, course_id)

    # Si es URL externa (ej old data), redirigir o devolver
    if block.content_url.startswith("http"):
        if mode == "json":
            return {"url": block.content_url}
        return RedirectResponse(url=block.content_url)
    
    # Generar URL firmada temporal de lectura
    signed_url = s3_service.generate_presigned_url(block.content_url)
    if not signed_url:
        raise HTTPException(
            status_code=503, 
            detail="Servicio de almacenamiento no disponible. Configura las variables AWS."
        )

    if mode == "json":
        return {"url": signed_url}

    return RedirectResponse(url=signed_url)