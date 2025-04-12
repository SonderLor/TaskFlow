from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import decode_token
from app.crud import user
from app.db import get_db
from app.models import User
from app.schemas import TokenPayload

# Определяем OAuth2 схему с путем получения токена
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


async def get_current_user(
    db: AsyncSession = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> User:
    """
    Получение текущего пользователя по JWT токену

    Args:
        db: Сессия базы данных
        token: JWT токен

    Returns:
        Объект пользователя

    Raises:
        HTTPException: Если токен недействителен или пользователь не найден
    """
    try:
        payload = decode_token(token)
        if payload is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Could not validate credentials",
            )
        token_data = payload
    except (jwt.JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )

    current_user = await user.get(db, id=token_data.sub)

    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    return current_user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Проверка, что текущий пользователь активен

    Args:
        current_user: Текущий пользователь

    Returns:
        Объект пользователя

    Raises:
        HTTPException: Если пользователь неактивен
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )
    return current_user


async def get_current_superuser(
    current_user: User = Depends(get_current_active_user),
) -> User:
    """
    Проверка, что текущий пользователь является суперпользователем

    Args:
        current_user: Текущий пользователь

    Returns:
        Объект пользователя

    Raises:
        HTTPException: Если пользователь не является суперпользователем
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges",
        )
    return current_user
