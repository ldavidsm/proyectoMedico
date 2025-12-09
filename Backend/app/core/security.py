from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta

# argon2
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

#token configuracion
SECRET_KEY = "CARTAYA30"   
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def hash_password(password: str) -> str:
    """
    Hashea la contraseña usando Argon2.
    Soporta cualquier longitud y caracteres UTF-8.
    """
    return pwd_context.hash(password)

def verify_password(password: str, hashed: str) -> bool:
    """
    Verifica la contraseña contra el hash.
    """
    return pwd_context.verify(password, hashed)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})

    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return token

def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
