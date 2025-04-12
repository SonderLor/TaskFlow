from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union

from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import Base

# Определение типов для обобщенного класса
ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)


class CRUDBase(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    """
    Базовый класс CRUD с основными операциями для работы с моделями.
    """

    def __init__(self, model: Type[ModelType]):
        """
        Инициализация с моделью SQLAlchemy.

        Args:
            model: Модель SQLAlchemy
        """
        self.model = model

    async def get(self, db: AsyncSession, id: Any) -> Optional[ModelType]:
        """
        Получение объекта по ID.

        Args:
            db: Асинхронная сессия SQLAlchemy
            id: ID объекта

        Returns:
            Объект модели или None, если не найден
        """
        query = select(self.model).where(self.model.id == id)
        result = await db.execute(query)
        return result.scalars().first()

    async def get_multi(
        self, db: AsyncSession, *, skip: int = 0, limit: int = 100
    ) -> List[ModelType]:
        """
        Получение списка объектов с пагинацией.

        Args:
            db: Асинхронная сессия SQLAlchemy
            skip: Сколько объектов пропустить
            limit: Максимальное количество объектов

        Returns:
            Список объектов модели
        """
        query = select(self.model).offset(skip).limit(limit)
        result = await db.execute(query)
        return result.scalars().all()

    async def create(self, db: AsyncSession, *, obj_in: CreateSchemaType) -> ModelType:
        """
        Создание нового объекта.

        Args:
            db: Асинхронная сессия SQLAlchemy
            obj_in: Схема создания объекта

        Returns:
            Созданный объект модели
        """
        obj_in_data = jsonable_encoder(obj_in)
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update(
        self,
        db: AsyncSession,
        *,
        db_obj: ModelType,
        obj_in: Union[UpdateSchemaType, Dict[str, Any]],
    ) -> ModelType:
        """
        Обновление существующего объекта.

        Args:
            db: Асинхронная сессия SQLAlchemy
            db_obj: Существующий объект модели
            obj_in: Схема обновления или словарь с полями для обновления

        Returns:
            Обновленный объект модели
        """
        obj_data = jsonable_encoder(db_obj)

        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)

        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])

        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def remove(self, db: AsyncSession, *, id: int) -> Optional[ModelType]:
        """
        Удаление объекта по ID.

        Args:
            db: Асинхронная сессия SQLAlchemy
            id: ID объекта

        Returns:
            Удаленный объект модели или None, если не найден
        """
        obj = await self.get(db=db, id=id)
        if obj:
            await db.delete(obj)
            await db.commit()
        return obj
