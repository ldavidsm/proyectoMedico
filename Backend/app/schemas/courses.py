from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List, Any
from datetime import datetime

class ContentBlockBase(BaseModel):
    id: Optional[str] = None
    tipo: str  # "video", "lectura", "tarea", "examen"
    titulo: str
    order: int = 0
    duracion: Optional[str] = None
    url: Optional[str] = None
    contenido: Optional[str] = None  # Para lecturas
    quiz_data: Optional[Any] = None  # Para JSON de preguntas

class ModuleBase(BaseModel):
    id: Optional[str] = None
    nombre: str
    descripcion: Optional[str] = None
    order: int = 0
    bloques: List[ContentBlockBase] = []
    
class BibliographyBase(BaseModel):
    id: Optional[str] = None
    tipo: str
    referencia: str
    enlaceDOI: Optional[str] = None

class OfferBase(BaseModel):
    id: Optional[str] = None
    nombrePublico: str
    precioBase: float
    estado: str = "activa"
    bloqueAcceso: dict # {"tipo": "permanente", ...}
    bloqueCertificacion: dict
    # Podemos ser más específicos con esquemas para estos dicts luego    

class CourseCreate(BaseModel):
    # Sección 1: Definición
    titulo: str
    subtitulo: Optional[str] = None
    categoria: Optional[str] = None
    tema: Optional[str] = None
    subtema: Optional[str] = None
    nivelCurso: Optional[str] = None
    publicoObjetivo: List[str] = []
    descripcionCorta: Optional[str] = None

    # Sección 2: Estructura
    modulos: List[ModuleBase] = []

    # Sección 3: Landing
    queAprendera: List[str] = []
    requisitos: Optional[str] = None
    descripcionDetallada: Optional[str] = None

    # Sección 6: Calidad
    objetivosAprendizaje: List[str] = []
    bibliografia: List[BibliographyBase] = []
    
    # Sección 7: Ofertas
    ofertas: List[OfferBase] = []
    
    visibilidad: str = "borrador"

    class Config:
        from_attributes = True
class CourseResponse(CourseCreate):
    id: str
    seller_id: str
    rating_avg: float = 0.0
    rating_count: int = 0
    created_at: Any
    updated_at: Any

    class Config:
        from_attributes = True
        
class CourseUpdate(BaseModel):
    titulo: Optional[str] = None
    subtitulo: Optional[str] = None
    descripcionCorta: Optional[str] = None
    descripcionDetallada: Optional[str] = None
    categoria: Optional[str] = None
    tema: Optional[str] = None
    nivelCurso: Optional[str] = None
    visibilidad: Optional[str] = None # "borrador", "publicado"
class CourseContentCreate(BaseModel):
    file_type: str       # "video", "pdf", "ppt"
    order: Optional[int] = 0


class CourseReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class CourseReviewResponse(BaseModel):
    id: str
    user_id: str
    course_id: str
    rating: int
    comment: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True  

class CourseContentResponse(BaseModel):
    id: str
    course_id: str
    file_url: str
    file_type: str
    order: int

    class Config:
        from_attributes = True

