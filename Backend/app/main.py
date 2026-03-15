import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth.router import router as auth_router
from app.users.router import router as users_router
from app.courses.router import router as courses_router
from app.orders.router import router as orders_router
from app.courses.content_router import router as content_router
from app.admin.router import router as admin_router
from app.payments.router import router as payments_router
from app.analytics.router import router as analytics_router
from app.users.seller_profile_router import router as seller_profile_router
from app.users.seller_requests_router import router as seller_requests_router
from app.catalogs.router import router as catalogs_router


from app.database import Base, engine
from app.models.users import User, SellerRequest
from app.models.courses import Course

# Crear tablas automáticamente (solo en desarrollo)
Base.metadata.create_all(bind=engine)

description = """
# HealthLearn API - Fase 3
API para marketplace de cursos en salud C2C.

## Roles
* **Compradores**: Pueden ver catálogo y comprar.
* **Vendedores**: Pueden crear y configurar cursos, subir contenido y gestionar revisiones.
* **Administradores**: Gestionan catálogo, roles y pagos.

## Seguridad
Utiliza tokens JWT almacenados en cookies `HttpOnly` para mayor seguridad en el frontend.
"""

app = FastAPI(
    title="Marketplace de Cursos C2C",
    description=description,
    version="1.0.0",
)
# Read comma-separated origins from env; fall back to localhost for dev
_raw_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:8000"
)
origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]
# -----------------------------------------------------
# CORS Config
# -----------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # luego lo limitas con el dominio real
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
app.include_router(analytics_router)
app.include_router(seller_profile_router)
app.include_router(seller_requests_router)
app.include_router(catalogs_router)



@app.get("/")
def root():
    return {"message": "API funcionando correctamente 🚀"}
