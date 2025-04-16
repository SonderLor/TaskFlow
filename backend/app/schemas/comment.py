from typing import List, Optional

from app.schemas.base import BaseSchema, TimestampMixin
from app.schemas.user import User


class CommentBase(BaseSchema):
    """Базовые атрибуты комментария"""

    task_id: int
    author_id: int
    text: str
    attachment_path: Optional[str] = None
    is_edited: Optional[bool] = False


class CommentCreate(CommentBase):
    """Схема для создания комментария"""

    mention_ids: Optional[List[int]] = []


class CommentUpdate(BaseSchema):
    """Схема для обновления комментария"""

    text: Optional[str] = None
    attachment_path: Optional[str] = None
    mention_ids: Optional[List[int]] = None
    is_edited: bool = True


class Comment(CommentBase, TimestampMixin):
    """Схема комментария для возврата API"""

    id: int
    author: Optional[User] = None
    mentions: List[User] = []
    is_edited: bool


class CommentMention(BaseSchema):
    """Схема для связи комментария с упоминаемым пользователем"""

    comment_id: int
    user_id: int
