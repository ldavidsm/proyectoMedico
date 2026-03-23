import os
from dotenv import load_dotenv

load_dotenv()


def _require(key: str) -> str:
    """Lee una variable de entorno obligatoria.
    Lanza ValueError si no está definida."""
    value = os.getenv(key)
    if not value:
        raise ValueError(
            f"Variable de entorno obligatoria no definida: {key}\n"
            f"Añádela al archivo .env antes de arrancar el servidor."
        )
    return value


def _optional(key: str, default: str = "") -> str:
    """Lee una variable de entorno opcional."""
    return os.getenv(key, default)


# ── AUTH ──────────────────────────────────────────
SECRET_KEY = _require("SECRET_KEY")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    _optional("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
)
REFRESH_TOKEN_EXPIRE_DAYS = int(
    _optional("REFRESH_TOKEN_EXPIRE_DAYS", "7")
)
ALGORITHM = "HS256"

# ── BASE DE DATOS ─────────────────────────────────
DATABASE_URL = _require("DATABASE_URL")

# ── AWS S3 ────────────────────────────────────────
AWS_ACCESS_KEY_ID = _optional("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = _optional("AWS_SECRET_ACCESS_KEY")
AWS_S3_BUCKET_NAME = _optional("AWS_S3_BUCKET_NAME")
AWS_S3_REGION = _optional("AWS_S3_REGION", "us-east-1")

# ── EMAIL ─────────────────────────────────────────
MAIL_USERNAME = _optional("MAIL_USERNAME")
MAIL_PASSWORD = _optional("MAIL_PASSWORD")
MAIL_FROM = _optional("MAIL_FROM", "noreply@healthlearn.com")
MAIL_PORT = int(_optional("MAIL_PORT", "587"))
MAIL_SERVER = _optional("MAIL_SERVER")
RESEND_API_KEY = _optional("RESEND_API_KEY")

# ── GOOGLE OAUTH ──────────────────────────────────
GOOGLE_CLIENT_ID = _optional("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = _optional("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = _optional(
    "GOOGLE_REDIRECT_URI",
    "http://localhost:8000/webinars/auth/callback",
)
GOOGLE_REDIRECT_URI_AUTH = _optional(
    "GOOGLE_REDIRECT_URI_AUTH",
    "http://localhost:8000/auth/google/callback",
)

# ── FRONTEND ──────────────────────────────────────
FRONTEND_URL = _optional("FRONTEND_URL", "http://localhost:3000")

# ── ENTORNO ───────────────────────────────────────
ENVIRONMENT = _optional("ENVIRONMENT", "development")
IS_PRODUCTION = ENVIRONMENT == "production"

# ── CORS ──────────────────────────────────────────
ALLOWED_ORIGINS = [
    o.strip()
    for o in _optional(
        "ALLOWED_ORIGINS",
        "http://localhost:3000,http://localhost:8000",
    ).split(",")
    if o.strip()
]

# ── REDIS ─────────────────────────────────────────
REDIS_HOST = _optional("REDIS_HOST", "localhost")
REDIS_PORT = int(_optional("REDIS_PORT", "6379"))
