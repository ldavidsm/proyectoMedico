from pydantic import BaseModel
from typing import Optional, List

class CourseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    price: float
    category: Optional[str] = None
    tags: Optional[List[str]] = []
    is_published: Optional[bool] = False

class CourseResponse(BaseModel):
    id: str
    title: str
    description: str
    price: float
    seller_id: str
    category: Optional[str]
    tags: List[str]
    is_published: bool
    
class CourseUpdate(BaseModel):
    title: Optional[str]
    description: Optional[str]
    price: Optional[float]
    category: Optional[str]
    tags: Optional[List[str]]
    is_published: Optional[bool]
    content_url: Optional[str]   # URL al nuevo contenido
    content_type: Optional[str]  # tipo de contenido  
    
class CourseContentCreate(BaseModel):
    file_type: str       # "video", "pdf", "ppt"
    order: Optional[int] = 0

class CourseContentResponse(BaseModel):
    id: str
    course_id: str
    file_url: str
    file_type: str
    order: int        

    class Config:
        orm_mode = True

class CourseDetail(CourseResponse):
    # Aquí puedes agregar campos extra en el futuro, como reviews o rating
    pass