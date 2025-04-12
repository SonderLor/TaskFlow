from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud import CRUDBase
from app.models import TaskStatus
from app.schemas import TaskStatusCreate, TaskStatusUpdate


class CRUDTaskStatus(CRUDBase[TaskStatus, TaskStatusCreate, TaskStatusUpdate]):
    """CRUD операции для статусов задач"""

    async def get_by_title(
        self, db: AsyncSession, *, title: str
    ) -> Optional[TaskStatus]:
        """Получение статуса по заголовку"""
        query = select(TaskStatus).where(TaskStatus.title == title)
        result = await db.execute(query)
        return result.scalars().first()


status = CRUDTaskStatus(TaskStatus)
