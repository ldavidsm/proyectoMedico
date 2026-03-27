import uuid
import enum
from sqlalchemy import Column, String, Float, ForeignKey, DateTime, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class OrderStatus(enum.Enum):
    pending = "pending"
    paid = "paid"
    failed = "failed"
    refunded = "refunded"

class Order(Base):
    __tablename__ = "orders"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    course_id = Column(String, ForeignKey("courses.id"), nullable=False, index=True)
    offer_id = Column(String, ForeignKey("course_offers.id"), nullable=False)

    price = Column(Float, nullable=False)  # Precio capturado en el momento de compra
    status = Column(Enum(OrderStatus), default=OrderStatus.pending, nullable=False, index=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relaciones
    user = relationship("User", backref="orders")
    course = relationship("Course")
    offer = relationship("CourseOffer")