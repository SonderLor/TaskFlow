from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, validator

from app.schemas.base import BaseSchema, TimestampMixin


class UserBase(BaseSchema):
    """Базовые атрибуты пользователя"""

    email: EmailStr
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: bool = True


class UserCreate(UserBase):
    """Схема для создания пользователя"""

    password: str

    @validator("password")
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        # Можно добавить больше проверок для надежности пароля
        return v


class UserUpdate(BaseSchema):
    """Схема для обновления пользователя"""

    email: Optional[EmailStr] = None
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None


class UserInDB(UserBase, TimestampMixin):
    """Схема пользователя в БД"""

    id: int
    hashed_password: str
    is_superuser: bool = False


class User(UserBase, TimestampMixin):
    """Схема пользователя (без хэша пароля) для возврата API"""

    id: int
    is_superuser: bool = False


class UserWithTasks(User):
    """Схема пользователя с его задачами"""

    # Эти поля будем заполнять через relationships
    # tasks_created: List["Task"] = []
    # tasks_assigned: List["TaskAssignee"] = []
    # tasks_watching: List["TaskWatcher"] = []
    pass


# Для авторизации
class Token(BaseModel):
    """JWT токен"""

    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    """Данные, хранимые в JWT токене"""

    sub: int  # subject (id пользователя)
    exp: datetime  # expiration time
