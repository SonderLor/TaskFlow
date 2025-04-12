from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.auth import get_current_user
from app.core.config import settings
from app.core.security import create_access_token
from app.crud import user
from app.db import get_db
from app.models import User
from app.schemas import Token, User as UserSchema, UserCreate

router = APIRouter()


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Регистрация нового пользователя

    Args:
        user_data: Данные пользователя для регистрации
        db: Сессия базы данных

    Returns:
        JSON ответ с сообщением об успешной регистрации

    Raises:
        HTTPException: Если пользователь с таким email уже существует
    """
    existing_user = await user.get_by_email(db, email=user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )

    await user.create(db, obj_in=user_data)

    return JSONResponse(
        {"message": "User successfully registered"}, status_code=status.HTTP_201_CREATED
    )


@router.post("/login", response_model=Token)
async def login_access_token(
    db: AsyncSession = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    Получение OAuth2 токена для аутентификации
    """
    db_user = await user.authenticate(
        db, email=form_data.username, password=form_data.password
    )
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not db_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )

    # Создаем токен с временем жизни из настроек
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(
            subject=db_user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }


@router.post("/test-token", response_model=UserSchema)
async def test_token(current_user: User = Depends(get_current_user)) -> Any:
    """
    Тестовый эндпоинт для проверки токена
    """
    return current_user
