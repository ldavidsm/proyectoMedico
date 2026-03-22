import uuid
from sqlalchemy import (
    Column, String, DateTime, ForeignKey, Integer, Boolean, Text
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Cohort(Base):
    """
    Representa una edición concreta de un curso por convocatoria.
    Una oferta puede tener múltiples cohorts a lo largo del tiempo.
    """
    __tablename__ = "cohorts"

    id = Column(String, primary_key=True,
                default=lambda: str(uuid.uuid4()))
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)
    offer_id = Column(String, ForeignKey("course_offers.id"), nullable=False)
    name = Column(String, nullable=False)  # ej: "Edición Enero 2026"

    enrollment_start = Column(DateTime(timezone=True), nullable=True)
    enrollment_end = Column(DateTime(timezone=True), nullable=True)
    course_start = Column(DateTime(timezone=True), nullable=False)
    course_end = Column(DateTime(timezone=True), nullable=True)
    max_students = Column(Integer, nullable=True)

    is_active = Column(Boolean, default=True)
    announcement = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    course = relationship("Course", backref="cohorts")
    offer = relationship("CourseOffer", backref="cohorts")
    members = relationship(
        "CohortMember", back_populates="cohort",
        cascade="all, delete-orphan"
    )


class CohortMember(Base):
    """
    Relación entre un estudiante y un cohort.
    Se crea automáticamente cuando compra una oferta de convocatoria.
    """
    __tablename__ = "cohort_members"

    id = Column(String, primary_key=True,
                default=lambda: str(uuid.uuid4()))
    cohort_id = Column(String, ForeignKey("cohorts.id"), nullable=False)
    student_id = Column(String, ForeignKey("users.id"), nullable=False)
    order_id = Column(String, ForeignKey("orders.id"), nullable=False)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    cohort = relationship("Cohort", back_populates="members")
    student = relationship("User", foreign_keys=[student_id])
    order = relationship("Order")
