from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel

from app.database import get_db
from app.dependencies import get_current_user, get_optional_user
from app.models.collections import Collection, CollectionCourse
from app.models.courses import Course
from app.models.users import User, UserRole

router = APIRouter(prefix="/collections", tags=["Collections"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class CollectionCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    progression: Optional[str] = "libre"


class CollectionUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    status: Optional[str] = None
    progression: Optional[str] = None
    courseIds: Optional[List[str]] = None


# ── Helpers ───────────────────────────────────────────────────────────────────

def collection_to_dict(col: Collection):
    course_ids = [cc.course_id for cc in col.courses]
    return {
        "id": col.id,
        "seller_id": col.seller_id,
        "nombre": col.nombre,
        "descripcion": col.descripcion,
        "status": col.status,
        "progression": col.progression,
        "courseIds": course_ids,
        "course_count": len(course_ids),
        "created_at": str(col.created_at) if col.created_at else None,
    }


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/")
def list_collections(
    status: Optional[str] = None,
    seller_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_optional_user),
):
    query = db.query(Collection)
    if status:
        query = query.filter(Collection.status == status)
    if seller_id:
        query = query.filter(Collection.seller_id == seller_id)
    elif not current_user:
        query = query.filter(Collection.status == "publicado")
    elif str(current_user.role) != UserRole.admin.value:
        query = query.filter(
            (Collection.status == "publicado")
            | (Collection.seller_id == current_user.id)
        )
    return [collection_to_dict(c) for c in query.all()]


@router.get("/{collection_id}")
def get_collection(collection_id: str, db: Session = Depends(get_db)):
    col = db.query(Collection).filter(Collection.id == collection_id).first()
    if not col:
        raise HTTPException(404, "Colección no encontrada")

    result = collection_to_dict(col)
    courses_data = []
    for cc in col.courses:
        course = db.query(Course).filter(Course.id == cc.course_id).first()
        if course:
            courses_data.append({
                "id": course.id,
                "title": course.title,
                "subtitle": course.subtitle,
                "category": course.category,
                "level": course.level,
                "banner_url": course.banner_url,
                "short_description": course.short_description,
                "rating_avg": course.rating_avg or 0,
                "rating_count": course.rating_count or 0,
            })
    result["courses"] = courses_data
    return result


@router.post("/")
def create_collection(
    data: CollectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if str(current_user.role) not in [UserRole.seller.value, UserRole.admin.value]:
        raise HTTPException(403, "Solo los sellers pueden crear colecciones")

    col = Collection(
        seller_id=current_user.id,
        nombre=data.nombre,
        descripcion=data.descripcion,
        progression=data.progression or "libre",
    )
    db.add(col)
    db.commit()
    db.refresh(col)
    return collection_to_dict(col)


@router.patch("/{collection_id}")
def update_collection(
    collection_id: str,
    data: CollectionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    col = db.query(Collection).filter(Collection.id == collection_id).first()
    if not col:
        raise HTTPException(404, "Colección no encontrada")
    if col.seller_id != current_user.id and str(current_user.role) != UserRole.admin.value:
        raise HTTPException(403, "No autorizado")

    if data.nombre is not None:
        col.nombre = data.nombre
    if data.descripcion is not None:
        col.descripcion = data.descripcion
    if data.status is not None:
        col.status = data.status
    if data.progression is not None:
        col.progression = data.progression

    if data.courseIds is not None:
        db.query(CollectionCourse).filter(
            CollectionCourse.collection_id == collection_id
        ).delete()
        for i, course_id in enumerate(data.courseIds):
            db.add(CollectionCourse(
                collection_id=collection_id,
                course_id=course_id,
                order=i,
            ))

    db.commit()
    db.refresh(col)
    return collection_to_dict(col)


@router.delete("/{collection_id}")
def delete_collection(
    collection_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    col = db.query(Collection).filter(Collection.id == collection_id).first()
    if not col:
        raise HTTPException(404, "Colección no encontrada")
    if col.seller_id != current_user.id and str(current_user.role) != UserRole.admin.value:
        raise HTTPException(403, "No autorizado")
    db.delete(col)
    db.commit()
    return {"ok": True}
