from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.users import Favorite
from app.models.courses import Course

router = APIRouter(prefix="/favorites", tags=["Favorites"])

@router.post("/{course_id}")
def add_favorite(
    course_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(404, "Curso no encontrado")

    fav = db.query(Favorite).filter(
        Favorite.course_id == course_id,
        Favorite.user_id == current_user.id
    ).first()

    if fav:
        return {"message": "Ya está en favoritos"}

    fav = Favorite(user_id=current_user.id, course_id=course_id)
    db.add(fav)
    db.commit()

    return {"message": "Añadido a favoritos"}


@router.delete("/{course_id}")
def remove_favorite(
    course_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    fav = db.query(Favorite).filter(
        Favorite.course_id == course_id,
        Favorite.user_id == current_user.id
    ).first()

    if not fav:
        raise HTTPException(404, "Ese curso no está en favoritos")

    db.delete(fav)
    db.commit()

    return {"message": "Eliminado de favoritos"}

@router.get("/")
def list_favorites(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    favorites = db.query(Favorite).filter(
        Favorite.user_id == current_user.id
    ).all()

    return [db.query(Course).get(f.course_id) for f in favorites]
