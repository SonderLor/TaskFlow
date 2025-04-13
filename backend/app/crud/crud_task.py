from typing import Any, Dict, List, Optional, Union

from sqlalchemy import delete, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.crud import CRUDBase
from app.models import Task, TaskAssignee, TaskWatcher
from app.schemas import TaskCreate, TaskUpdate


class CRUDTask(CRUDBase[Task, TaskCreate, TaskUpdate]):
    """CRUD операции для задач"""

    async def get(self, db: AsyncSession, id: Any) -> Optional[Task]:
        """Получение задачи по ID с загрузкой связанных объектов"""
        query = (
            select(Task)
            .where(Task.id == id)
            .options(
                selectinload(Task.creator),
                selectinload(Task.status),
                selectinload(Task.assignees).options(selectinload(TaskAssignee.user)),
                selectinload(Task.watchers).options(selectinload(TaskWatcher.user)),
            )
        )
        result = await db.execute(query)
        return result.scalars().first()

    async def get_multi(
        self, db: AsyncSession, *, skip: int = 0, limit: int = 100
    ) -> List[Task]:
        """Получение списка задач с загрузкой связанных объектов"""
        query = (
            select(Task)
            .options(selectinload(Task.creator), selectinload(Task.status))
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return result.scalars().all()

    async def get_by_creator(
        self, db: AsyncSession, *, creator_id: int, skip: int = 0, limit: int = 100
    ) -> List[Task]:
        """Получение задач по ID создателя"""
        query = (
            select(Task)
            .where(Task.creator_id == creator_id)
            .options(selectinload(Task.creator), selectinload(Task.status))
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return result.scalars().all()

    async def get_assigned_to_user(
        self, db: AsyncSession, *, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[Task]:
        """Получение задач, назначенных пользователю"""
        query = (
            select(Task)
            .join(TaskAssignee, Task.id == TaskAssignee.task_id)
            .where(TaskAssignee.user_id == user_id)
            .options(selectinload(Task.creator), selectinload(Task.status))
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return result.scalars().all()

    async def get_watched_by_user(
        self, db: AsyncSession, *, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[Task]:
        """Получение задач, за которыми наблюдает пользователь"""
        query = (
            select(Task)
            .join(TaskWatcher, Task.id == TaskWatcher.task_id)
            .where(TaskWatcher.user_id == user_id)
            .options(selectinload(Task.creator), selectinload(Task.status))
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return result.scalars().all()

    async def get_user_tasks(
        self, db: AsyncSession, *, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[Task]:
        """
        Получение всех задач, связанных с пользователем
        (созданные им, назначенные ему или за которыми он наблюдает)
        """
        query = (
            select(Task)
            .where(
                or_(
                    Task.creator_id == user_id,
                    Task.id.in_(
                        select(TaskAssignee.task_id).where(
                            TaskAssignee.user_id == user_id
                        )
                    ),
                    Task.id.in_(
                        select(TaskWatcher.task_id).where(
                            TaskWatcher.user_id == user_id
                        )
                    ),
                )
            )
            .options(selectinload(Task.creator), selectinload(Task.status))
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return result.scalars().all()

    async def create(self, db: AsyncSession, *, obj_in: TaskCreate) -> Task:
        """Создание новой задачи с назначением исполнителей и наблюдателей"""
        assignee_ids = obj_in.assignee_ids or []
        watcher_ids = obj_in.watcher_ids or []

        # Создаем копию данных без assignee_ids и watcher_ids
        obj_in_data = obj_in.model_dump(exclude={"assignee_ids", "watcher_ids"})

        db_obj = Task(**obj_in_data)
        db.add(db_obj)
        await db.flush()  # Сохраняем задачу для получения ID

        # Создаем записи для исполнителей
        for user_id in assignee_ids:
            assignee = TaskAssignee(task_id=db_obj.id, user_id=user_id)
            db.add(assignee)

        # Создаем записи для наблюдателей
        for user_id in watcher_ids:
            watcher = TaskWatcher(task_id=db_obj.id, user_id=user_id)
            db.add(watcher)

        await db.commit()
        await db.refresh(db_obj)
        return await self.get(db, id=db_obj.id)

    async def update(
        self,
        db: AsyncSession,
        *,
        db_obj: Task,
        obj_in: Union[TaskUpdate, Dict[str, Any]],
    ) -> Task:
        """Обновление задачи с обновлением исполнителей и наблюдателей"""
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)

        # Извлекаем и удаляем assignee_ids и watcher_ids из update_data
        assignee_ids = update_data.pop("assignee_ids", None)
        watcher_ids = update_data.pop("watcher_ids", None)

        # Обновляем основные поля задачи
        for field in update_data:
            setattr(db_obj, field, update_data[field])

        # Обновляем исполнителей, если они были предоставлены
        if assignee_ids is not None:
            # Удаляем существующих исполнителей
            query = delete(TaskAssignee).where(TaskAssignee.task_id == db_obj.id)
            await db.execute(query)

            # Добавляем новых исполнителей
            for user_id in assignee_ids:
                assignee = TaskAssignee(task_id=db_obj.id, user_id=user_id)
                db.add(assignee)

        # Обновляем наблюдателей, если они были предоставлены
        if watcher_ids is not None:
            # Удаляем существующих наблюдателей
            query = delete(TaskWatcher).where(TaskWatcher.task_id == db_obj.id)
            await db.execute(query)

            # Добавляем новых наблюдателей
            for user_id in watcher_ids:
                watcher = TaskWatcher(task_id=db_obj.id, user_id=user_id)
                db.add(watcher)

        await db.commit()
        await db.refresh(db_obj)
        return db_obj


task = CRUDTask(Task)
