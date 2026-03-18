import re
import html


def sanitize_text(value: str, max_length: int = 500) -> str:
    """Elimina HTML/scripts y limita longitud."""
    if not value:
        return value
    cleaned = html.escape(value.strip())
    cleaned = re.sub(
        r'&lt;script.*?&gt;.*?&lt;/script&gt;', '',
        cleaned, flags=re.IGNORECASE | re.DOTALL
    )
    return cleaned[:max_length]


def sanitize_url(value: str) -> str:
    """Valida que sea una URL segura (http/https)."""
    if not value:
        return value
    value = value.strip()
    if not value.startswith(('http://', 'https://')):
        raise ValueError("URL debe empezar con http:// o https://")
    return value
