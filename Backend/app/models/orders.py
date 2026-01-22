import uuid
import enum
from sqlalchemy import Column, String, Float, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import ENUM
from app.database import Base


class OrderStatus(enum.Enum):
    pending = "pending"
    paid = "paid"
    failed = "failed"
    refunded = "refunded"


order_status_enum = ENUM(
    "pending",
    "paid",
    "failed",
    "refunded",
    name="orderstatus",
    create_type=False  
)


class Order(Base):
    __tablename__ = "orders"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    course_id = Column(String, ForeignKey("courses.id"), nullable=False)

    price = Column(Float, nullable=False)  # precio congelado del curso

    status = Column(
        order_status_enum,  # usamos el ENUM seguro
        nullable=False,
        server_default="pending"  # default en DB, no Python
    )

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relaciones
    user = relationship("User", backref="orders")
    course = relationship("Course", backref="orders")
