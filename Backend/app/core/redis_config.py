import redis
from app.config import REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_SSL

redis_client = redis.Redis(
    host=REDIS_HOST,
    port=REDIS_PORT,
    password=REDIS_PASSWORD,
    decode_responses=True,
    ssl=REDIS_SSL,
)


def save_code(email: str, code: str, expire_seconds: int = 600):
    redis_client.setex(name=email, time=expire_seconds, value=code)


def get_code(email: str):
    return redis_client.get(email)


def delete_code(email: str):
    redis_client.delete(email)
