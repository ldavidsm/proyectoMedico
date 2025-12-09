from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Cargar variables del .env
load_dotenv()


DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("❌ ERROR: No se encontró DATABASE_URL en el archivo .env")

# Motor de conexión
engine = create_engine(DATABASE_URL, echo=False)

# Sesiones de la BD
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Clase base para modelos
Base = declarative_base()

# Dependencia global para obtener la sesión en cada endpoint
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
