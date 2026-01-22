from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.dependencies import get_current_user
from app.analytics.service import AnalyticsService
from app.schemas.analytics import AnalyticsReport,CourseDetailReport  # El schema que definimos
from app.models.users import User
from app.models.courses import Course

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/summary", response_model=AnalyticsReport)
async def get_creator_analytics(
    period: str = Query("30", description="Periodo en días: 30, 90, all"),
    course_id: str = Query("all", description="ID del curso específico o 'all'"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Endpoint principal para el Dashboard de Analytics.
    Extrae métricas de ventas, estudiantes y progreso para el creador autenticado.
    """
    
    # 1. Seguridad: Verificar que el usuario tenga rol de creador/seller
    if current_user.role != "seller" and current_user.role != "admin":
        raise HTTPException(
            status_code=403, 
            detail="Solo los creadores pueden acceder a las analíticas."
        )

    # 2. Lógica de conversión de periodo
    # Mapeamos los strings del frontend a días reales para la DB
    days_map = {
        "30": 30,
        "90": 90,
        "all": 365 * 10  # 10 años para representar 'todo'
    }
    days = days_map.get(period, 30)

    # 3. Llamada al servicio
    # El servicio se encarga de las queries pesadas de SQLAlchemy
    try:
        stats = AnalyticsService.get_stats(
            db=db, 
            seller_id=current_user.id, 
            course_id=course_id, 
            days=days
        )
        return stats
    except Exception as e:
        # Log del error para debugging
        print(f"Error en Analytics: {e}")
        raise HTTPException(
            status_code=500, 
            detail="Error al procesar las estadísticas de rendimiento."
        )

@router.get("/courses-performance")
async def get_courses_table(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Endpoint específico para la tabla de 'Rendimiento por curso' 
    que tienes debajo de las gráficas en el Dashboard.
    """
    if current_user.role != "seller":
        raise HTTPException(status_code=403, detail="No autorizado")
        
    return AnalyticsService.get_courses_performance_list(db, current_user.id)

@router.get("/course/{course_id}", response_model=CourseDetailReport)
def get_specific_course_analytics(
    course_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verificamos que el curso le pertenezca al que pregunta
    course = db.query(Course).filter(Course.id == course_id, Course.seller_id == current_user.id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Curso no encontrado o no eres el dueño")
    
    return AnalyticsService.get_course_detail_stats(db, course_id)