import redis
import os

# Conexión a Redis (por defecto corre en localhost:6379)
redis_client = redis.Redis(
    host='localhost', 
    port=6379, 
    db=0, 
    decode_responses=True # Muy importante para que nos devuelva strings y no bytes
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