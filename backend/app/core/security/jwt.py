from datetime import datetime, timedelta
from typing import Optional, Union

from jose import jwt
from pydantic import ValidationError

from app.core.config import settings
from app.schemas import TokenPayload


def create_access_token(
    subject: Union[str, int], expires_delta: Optional[timedelta] = None
) -> str:
    """
    Создает JWT токен доступа

    Args:
        subject: Идентификатор пользователя
        expires_delta: Время жизни токена

    Returns:
        Строка JWT токена
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt


def decode_token(token: str) -> Optional[TokenPayload]:
    """
    Декодирует JWT токен

    Args:
        token: JWT токен

    Returns:
        Данные из токена или None при ошибке декодирования
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        token_data = TokenPayload(**payload)
        return token_data
    except (jwt.JWTError, ValidationError):
        return None
