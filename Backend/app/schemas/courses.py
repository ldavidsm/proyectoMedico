from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List, Any
from datetime import datetime

class ContentBlockBase(BaseModel):
    id: Optional[str] = None
    type: str  # "video", "reading", "quiz", "task"
    title: str = Field(alias="titulo")
    order: int = 0
    duration: Optional[str] = Field(None, alias="duracion")
    content_url: Optional[str] = Field(None, alias="url")
    body_text: Optional[str] = Field(None, alias="contenido")
    quiz_data: Optional[Any] = None

    class Config:
        from_attributes = True
        populate_by_name = True

class ModuleBase(BaseModel):
    id: Optional[str] = None
    title: str = Field(alias="nombre")
    description: Optional[str] = Field(None, alias="descripcion")
    order: int = 0
    blocks: List[ContentBlockBase] = Field([], alias="bloques")

    class Config:
        from_attributes = True
        populate_by_name = True

class BibliographyBase(BaseModel):
    id: Optional[str] = None
    type: str
    reference_text: str = Field(alias="referencia")
    doi_url: Optional[str] = Field(None, alias="enlaceDOI")

    class Config:
        from_attributes = True
        populate_by_name = True

class OfferBase(BaseModel):
    id: Optional[str] = None
    name_public: str = Field(alias="nombrePublico")
    price_base: float = Field(alias="precioBase")
    status: str = "activa"
    access_type: Optional[str] = None 
    certificate_included: bool = True
    
    class Config:
        from_attributes = True
        populate_by_name = True

class CourseCreate(BaseModel):
    # Keep Spanish for Input to avoid breaking existing Frontend Creation Forms immediately
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
    
    visibilidad: Optional[str] = "privado"

    class Config:
        from_attributes = True

class CourseResponse(BaseModel):
    id: str
    title: str
    subtitle: Optional[str] = None
    category: Optional[str] = None
    topic: Optional[str] = None
    subtopic: Optional[str] = None
    level: Optional[str] = None
    short_description: Optional[str] = None
    long_description: Optional[str] = None
    banner_url: Optional[str] = None
    
    target_audience: List[str] = []
    learning_goals: List[str] = []
    requirements: Optional[str] = None
    
    modules: List[ModuleBase] = []
    offers: List[OfferBase] = []
    bibliography: List[BibliographyBase] = []

    seller_id: str
    status: str
    visibility: str
    
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
    
    # NUEVOS
    publicoObjetivo: Optional[List[str]] = None
    queAprendera: Optional[List[str]] = None
    requisitos: Optional[str] = None
    objetivosAprendizaje: Optional[List[str]] = None
    subtema: Optional[str] = None
    dirigidoA: Optional[str] = None
    modalidades: Optional[List[str]] = None
    
    # Módulos completos (reemplaza todos los módulos del curso)
    modulos: Optional[List[ModuleBase]] = None
    
    # Ofertas (reemplaza todas las ofertas)
    ofertas: Optional[List[OfferBase]] = None
    
    # Bibliografía (reemplaza toda la bibliografía)
    bibliografia: Optional[List[BibliographyBase]] = None
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
    upload_url: Optional[str] = None

    class Config:
        from_attributes = True

