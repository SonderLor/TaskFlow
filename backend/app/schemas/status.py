from typing import Optional

from app.schemas.base import BaseSchema, TimestampMixin


class TaskStatusBase(BaseSchema):
    """Базовые атрибуты статуса задачи"""

    title: str
    description: Optional[str] = None


class TaskStatusCreate(TaskStatusBase):
    """Схема для создания статуса задачи"""

    pass


class TaskStatusUpdate(BaseSchema):
    """Схема для обновления статуса задачи"""

    title: Optional[str] = None
    description: Optional[str] = None


class TaskStatus(TaskStatusBase, TimestampMixin):
    """Схема статуса задачи для возврата API"""

    id: int
