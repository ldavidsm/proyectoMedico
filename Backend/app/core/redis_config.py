import redis
from app.config import REDIS_HOST, REDIS_PORT

# Conexión a Redis
redis_client = redis.Redis(
    host=REDIS_HOST,
    port=REDIS_PORT,
    db=0,
    decode_responses=True,
)

def save_code(email: str, code: str, expire_seconds: int = 600):
    """Guarda el código con un tiempo de vida (TTL) de 10 minutos por defecto"""
    redis_client.setex(name=email, time=expire_seconds, value=code)

def get_code(email: str):
    """Recupera el código. Si expiró o no existe, devuelve None"""
    return redis_client.get(email)

def delete_code(email: str):
    """Borra el código una vez usado"""
    redis_client.delete(email)