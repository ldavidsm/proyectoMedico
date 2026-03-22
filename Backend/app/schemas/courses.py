from pydantic import BaseModel, Field, HttpUrl, field_validator
from typing import Optional, List, Any
from datetime import datetime
from app.core.sanitize import sanitize_text

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
    is_recommended: bool = Field(False, alias="recomendada")

    # Precio
    currency_origin: Optional[str] = Field(None, alias="monedaOrigen")
    country_origin: Optional[str] = Field(None, alias="paisOrigen")
    country_prices: Optional[list] = Field(None, alias="preciosPorPais")

    # Inscripción
    inscription_type: str = Field("siempre", alias="inscripcionTipo")
    enrollment_start: Optional[str] = None
    enrollment_end: Optional[str] = None
    course_start: Optional[str] = None
    course_end: Optional[str] = None
    max_students: Optional[int] = None

    # Acompañamiento
    accompaniment: Optional[list] = Field(None, alias="acompanamiento")
    chat_questions_per_student: Optional[int] = None
    chat_response_time: Optional[str] = None

    # Acceso
    access_content: str = Field("vitalicio", alias="accesoContenido")
    access_months: Optional[int] = Field(None, alias="accesoMeses")
    access_type: Optional[str] = None
    certificate_included: bool = True
    certificate_min_progress: int = 100
    certificate_requires_exam: bool = False

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

    @field_validator('titulo')
    @classmethod
    def sanitize_titulo(cls, v):
        return sanitize_text(v, max_length=200)

    @field_validator('descripcionCorta')
    @classmethod
    def sanitize_descripcion_corta(cls, v):
        if v is None:
            return v
        return sanitize_text(v, max_length=500)

    @field_validator('descripcionDetallada')
    @classmethod
    def sanitize_descripcion_detallada(cls, v):
        if v is None:
            return v
        return sanitize_text(v, max_length=5000)

    # Sección 6: Calidad
    objetivosAprendizaje: List[str] = []
    bibliografia: List[BibliographyBase] = []
    
    # Sección 7: Ofertas
    ofertas: List[OfferBase] = []
    
    has_forum: Optional[bool] = False
    progresionContenido: Optional[str] = Field("libre", alias="progresionContenido")
    visibilidad: Optional[str] = "privado"
    requires_professional_profile: bool = False

    class Config:
        from_attributes = True
        populate_by_name = True

# ── Response-only schemas (no aliases, so JSON keys = English field names) ──

class ContentBlockResponse(BaseModel):
    id: Optional[str] = None
    type: str
    title: str
    order: int = 0
    duration: Optional[str] = None
    content_url: Optional[str] = None
    body_text: Optional[str] = None
    quiz_data: Optional[Any] = None

    class Config:
        from_attributes = True

class ModuleResponse(BaseModel):
    id: Optional[str] = None
    title: str
    description: Optional[str] = None
    order: int = 0
    blocks: List[ContentBlockResponse] = []

    class Config:
        from_attributes = True

class OfferResponse(BaseModel):
    id: Optional[str] = None
    name_public: str
    price_base: float
    status: str = "activa"
    is_recommended: bool = False
    currency_origin: Optional[str] = None
    country_origin: Optional[str] = None
    country_prices: Optional[list] = None
    inscription_type: str = "siempre"
    max_students: Optional[int] = None
    accompaniment: Optional[list] = None
    chat_questions_per_student: Optional[int] = None
    chat_response_time: Optional[str] = None
    access_content: str = "vitalicio"
    access_months: Optional[int] = None
    access_type: Optional[str] = None
    certificate_included: bool = True
    certificate_min_progress: int = 100
    certificate_requires_exam: bool = False

    class Config:
        from_attributes = True

class BibliographyResponse(BaseModel):
    id: Optional[str] = None
    type: str
    reference_text: str
    doi_url: Optional[str] = None

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

    modules: List[ModuleResponse] = []
    offers: List[OfferResponse] = []
    bibliography: List[BibliographyResponse] = []

    seller_id: str
    status: str
    visibility: str

    rating_avg: Optional[float] = 0.0
    rating_count: Optional[int] = 0
    has_forum: bool = False
    progression_type: str = "libre"
    requires_professional_profile: bool = False
    created_at: Any
    updated_at: Any
    min_price: Optional[float] = None
    total_blocks: Optional[int] = None

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
    has_forum: Optional[bool] = None
    progresionContenido: Optional[str] = None
    requires_professional_profile: Optional[bool] = None

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
    user_name: Optional[str] = None

    class Config:
        from_attributes = True

    @classmethod
    def from_review(cls, review):
        return cls(
            id=review.id,
            user_id=review.user_id,
            course_id=review.course_id,
            rating=review.rating,
            comment=review.comment,
            created_at=review.created_at,
            user_name=review.user.full_name if review.user else None,
        )

class CourseContentResponse(BaseModel):
    id: str
    course_id: str
    file_url: str
    file_type: str
    order: int
    upload_url: Optional[str] = None

    class Config:
        from_attributes = True

