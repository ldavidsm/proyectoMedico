import uuid
from sqlalchemy import Column, String, Text, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Collection(Base):
    __tablename__ = "collections"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    seller_id = Column(String, ForeignKey("users.id"), nullable=False)
    nombre = Column(String, nullable=False)
    descripcion = Column(Text, nullable=True)
    status = Column(String, default="borrador")  # borrador, publicado
    progression = Column(String, default="libre")  # libre, secuencial
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    seller = relationship("User", backref="collections")
    courses = relationship(
        "CollectionCourse",
        back_populates="collection",
        cascade="all, delete-orphan",
        order_by="CollectionCourse.order",
    )


class CollectionCourse(Base):
    __tablename__ = "collection_courses"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    collection_id = Column(String, ForeignKey("collections.id"), nullable=False)
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)
    order = Column(Integer, default=0)

    collection = relationship("Collection", back_populates="courses")
    course = relationship("Course")
