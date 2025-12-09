import uuid
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.users import User, UserRole
from app.core.security import hash_password

# Configuración del admin
ADMIN_EMAIL = "lsenramirabal@gmail.com"
ADMIN_PASSWORD = "Cartaya30"
ADMIN_FULL_NAME = "Admin Inicial"

def create_admin():
    db: Session = SessionLocal()

    # Verificar si ya existe un admin con ese email
    existing = db.query(User).filter(User.email == ADMIN_EMAIL).first()
    if existing:
        print(f"Admin con email {ADMIN_EMAIL} ya existe.")
        db.close()
        return

    # Crear usuario admin
    admin = User(
        id=str(uuid.uuid4()),
        email=ADMIN_EMAIL,
        password_hash=hash_password(ADMIN_PASSWORD),
        full_name=ADMIN_FULL_NAME,
        role=UserRole.admin,
        is_active=True
    )

    db.add(admin)
    db.commit()
    db.close()
    print(f"Admin {ADMIN_EMAIL} creado exitosamente!")

if __name__ == "__main__":
    create_admin()
