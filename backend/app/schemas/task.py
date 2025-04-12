from typing import List, Optional

from app.schemas.base import BaseSchema, TimestampMixin
from app.schemas.status import TaskStatus
from app.schemas.user import User


class TaskBase(BaseSchema):
    """Базовые атрибуты задачи"""

    title: str
    description: Optional[str] = None
    status_id: Optional[int] = None
    creator_id: Optional[int] = None


class TaskCreate(TaskBase):
    """Схема для создания задачи"""

    assignee_ids: Optional[List[int]] = []
    watcher_ids: Optional[List[int]] = []


class TaskUpdate(BaseSchema):
    """Схема для обновления задачи"""

    title: Optional[str] = None
    description: Optional[str] = None
    status_id: Optional[int] = None
    assignee_ids: Optional[List[int]] = None
    watcher_ids: Optional[List[int]] = None


class Task(TaskBase, TimestampMixin):
    """Схема задачи для возврата API"""

    id: int
    creator: Optional[User] = None
    status: Optional[TaskStatus] = None


class TaskDetail(Task):
    """Детализированная схема задачи с исполнителями и наблюдателями"""

    assignees: List[User] = []
    watchers: List[User] = []
    # comments: List["Comment"] = []  # Будет добавлено позже


class TaskAssignee(BaseSchema):
    """Схема для связи задачи с исполнителем"""

    task_id: int
    user_id: int


class TaskWatcher(BaseSchema):
    """Схема для связи задачи с наблюдателем"""

    task_id: int
    user_id: int
