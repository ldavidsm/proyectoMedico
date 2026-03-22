import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.core.rate_limiter import limiter

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
from app.notifications.router import router as notifications_router
from app.users.favorites_router import router as favorites_router
from app.courses.review_routes import router as reviews_router
from app.collections.router import router as collections_router
from app.courses.progress_router import router as progress_router
from app.profile.router import router as profile_router
from app.messaging.router import router as messaging_router
from app.users.students_router import router as students_router
from app.resources.router import router as resources_router
from app.webinars.router import router as webinars_router
from app.forum.router import router as forum_router
from app.cohorts.router import router as cohorts_router


from app.database import Base, engine
from app.models.users import User, SellerRequest
from app.models.courses import Course
from app.models.notifications import Notification
from app.models.collections import Collection, CollectionCourse
from app.models.messaging import Message, MessageReply, CourseAnnouncement, TaskSubmission
from app.models.resources import Resource, FAQ, SupportTicket
from app.models.webinars import Webinar, WebinarRegistration, SellerGoogleToken
from app.models.forum import ForumThread, ForumPost
from app.models.cohorts import Cohort, CohortMember

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

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Read comma-separated origins from env; fall back to localhost for dev
_raw_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:8000"
)
origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]
# -----------------------------------------------------
# Session middleware (required for OAuth state)
# -----------------------------------------------------
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SECRET_KEY", "changeme"),
    https_only=os.getenv("ENVIRONMENT") == "production",
    same_site="lax",
)

# -----------------------------------------------------
# CORS Config
# -----------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------------------------
# Security headers middleware
# -----------------------------------------------------
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    if os.getenv("ENVIRONMENT") == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

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
app.include_router(notifications_router, prefix="/notifications", tags=["notifications"])
app.include_router(favorites_router)
app.include_router(reviews_router)
app.include_router(collections_router)
app.include_router(progress_router)
app.include_router(profile_router)
app.include_router(messaging_router, prefix="/messaging", tags=["messaging"])
app.include_router(students_router)
app.include_router(resources_router, prefix="/resources", tags=["resources"])
app.include_router(webinars_router, prefix="/webinars", tags=["webinars"])
app.include_router(forum_router, prefix="/forum", tags=["forum"])
app.include_router(cohorts_router, prefix="/cohorts", tags=["cohorts"])



@app.get("/")
def root():
    return {"message": "API funcionando correctamente 🚀"}
