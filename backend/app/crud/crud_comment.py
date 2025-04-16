from typing import Any, Dict, List, Optional, Union

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.crud import CRUDBase
from app.models import Comment, CommentMention
from app.schemas import CommentCreate, CommentUpdate


class CRUDComment(CRUDBase[Comment, CommentCreate, CommentUpdate]):
    """CRUD операции для комментариев"""

    async def get(self, db: AsyncSession, id: Any) -> Optional[Comment]:
        """Получение комментария по ID с загрузкой связанных объектов"""
        query = (
            select(Comment)
            .where(Comment.id == id)
            .options(selectinload(Comment.author), selectinload(Comment.mentions))
        )
        result = await db.execute(query)
        return result.scalars().first()

    async def get_multi(
        self, db: AsyncSession, *, skip: int = 0, limit: int = 100
    ) -> List[Comment]:
        """Получение списка комментариев с загрузкой связанных объектов"""
        query = (
            select(Comment)
            .options(selectinload(Comment.author))
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return result.scalars().all()

    async def get_by_task(
        self, db: AsyncSession, *, task_id: int, skip: int = 0, limit: int = 100
    ) -> List[Comment]:
        """Получение комментариев по ID задачи"""
        query = (
            select(Comment)
            .where(Comment.task_id == task_id)
            .options(selectinload(Comment.author), selectinload(Comment.mentions))
            .offset(skip)
            .limit(limit)
        ).order_by(Comment.created_at)
        result = await db.execute(query)
        return result.scalars().all()

    async def create(self, db: AsyncSession, *, obj_in: CommentCreate) -> Comment:
        """Создание нового комментария с упоминаниями пользователей"""
        mention_ids = obj_in.mention_ids or []

        # Создаем копию данных без mention_ids
        obj_in_data = obj_in.model_dump(exclude={"mention_ids"})

        db_obj = Comment(**obj_in_data)
        db.add(db_obj)
        await db.flush()  # Сохраняем комментарий для получения ID

        # Создаем записи для упоминаний
        for user_id in mention_ids:
            mention = CommentMention(comment_id=db_obj.id, user_id=user_id)
            db.add(mention)

        await db.commit()
        await db.refresh(db_obj)
        return await self.get(db, id=db_obj.id)

    async def update(
        self,
        db: AsyncSession,
        *,
        db_obj: Comment,
        obj_in: Union[CommentUpdate, Dict[str, Any]],
    ) -> Comment:
        """Обновление комментария с обновлением упоминаний пользователей"""
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)

        # Извлекаем и удаляем mention_ids из update_data
        mention_ids = update_data.pop("mention_ids", None)

        # Обновляем основные поля комментария
        for field in update_data:
            setattr(db_obj, field, update_data[field])

        # Обновляем упоминания, если они были предоставлены
        if mention_ids is not None:
            # Удаляем существующие упоминания
            query = delete(CommentMention).where(CommentMention.comment_id == db_obj.id)
            await db.execute(query)

            # Добавляем новые упоминания
            for user_id in mention_ids:
                mention = CommentMention(comment_id=db_obj.id, user_id=user_id)
                db.add(mention)

        await db.commit()
        await db.refresh(db_obj)
        return db_obj


comment = CRUDComment(Comment)
