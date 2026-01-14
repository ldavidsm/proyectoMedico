from pydantic import BaseModel, Field
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
    rating_avg: float
    rating_count: int
    
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

class CourseReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class CourseReviewResponse(BaseModel):
    id: str
    user_id: str
    course_id: str
    rating: int
    comment: Optional[str]

    class Config:
        from_attributes = True     


    class Config:
        orm_mode = True

