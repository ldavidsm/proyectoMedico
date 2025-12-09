from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth.router import router as auth_router
from app.users.router import router as users_router
from app.courses.router import router as courses_router
from app.orders.router import router as orders_router
from app.courses.content_router import router as content_router
from app.admin.router import router as admin_router
from app.payments.router import router as payments_router



from app.database import Base, engine
from app.models.users import User, SellerRequest
from app.models.courses import Course

# Crear tablas automáticamente (solo en desarrollo; en producción usa Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Marketplace de Cursos C2C",
    version="1.0.0",
)

# -----------------------------------------------------
# CORS Config
# -----------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # luego lo limitas con el dominio real
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------------------------
# Routers
# -----------------------------------------------------
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(courses_router)
app.include_router(orders_router)
app.include_router(content_router, prefix="/courses/{course_id}/contents", tags=["course-content"])
app.include_router(admin_router, prefix="/admin", tags=["admin"])
app.include_router(payments_router)



@app.get("/")
def root():
    return {"message": "API funcionando correctamente 🚀"}
