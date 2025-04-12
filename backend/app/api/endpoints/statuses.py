from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from fastapi import status as status_code
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.auth import get_current_active_user, get_current_superuser
from app.crud import status
from app.db import get_db
from app.models import User
from app.schemas import TaskStatus, TaskStatusCreate, TaskStatusUpdate

router = APIRouter()


@router.get("/", response_model=List[TaskStatus])
async def read_statuses(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Получение списка статусов задач
    """
    statuses = await status.get_multi(db, skip=skip, limit=limit)
    return statuses


@router.post("/", response_model=TaskStatus)
async def create_status(
    *,
    db: AsyncSession = Depends(get_db),
    status_in: TaskStatusCreate,
    current_user: User = Depends(get_current_superuser),
) -> Any:
    """
    Создание нового статуса задачи (только для суперпользователей)
    """
    db_status = await status.get_by_title(db, title=status_in.title)
    if db_status:
        raise HTTPException(
            status_code=status_code.HTTP_400_BAD_REQUEST,
            detail="Status with this title already exists",
        )

    return await status.create(db, obj_in=status_in)


@router.get("/{status_id}", response_model=TaskStatus)
async def read_status(
    status_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Получение информации о статусе задачи по ID
    """
    db_status = await status.get(db, id=status_id)
    if not db_status:
        raise HTTPException(
            status_code=status_code.HTTP_404_NOT_FOUND,
            detail="Status not found",
        )
    return db_status


@router.put("/{status_id}", response_model=TaskStatus)
async def update_status(
    *,
    db: AsyncSession = Depends(get_db),
    status_id: int,
    status_in: TaskStatusUpdate,
    current_user: User = Depends(get_current_superuser),
) -> Any:
    """
    Обновление информации о статусе задачи (только для суперпользователей)
    """
    db_status = await status.get(db, id=status_id)
    if not db_status:
        raise HTTPException(
            status_code=status_code.HTTP_404_NOT_FOUND,
            detail="Status not found",
        )

    # Проверяем, что заголовок не конфликтует с существующим
    if status_in.title and status_in.title != db_status.title:
        existing_status = await status.get_by_title(db, title=status_in.title)
        if existing_status:
            raise HTTPException(
                status_code=status_code.HTTP_400_BAD_REQUEST,
                detail="Status with this title already exists",
            )

    return await status.update(db, db_obj=db_status, obj_in=status_in)


@router.delete("/{status_id}", response_model=TaskStatus)
async def delete_status(
    *,
    db: AsyncSession = Depends(get_db),
    status_id: int,
    current_user: User = Depends(get_current_superuser),
) -> Any:
    """
    Удаление статуса задачи (только для суперпользователей)
    """
    db_status = await status.get(db, id=status_id)
    if not db_status:
        raise HTTPException(
            status_code=status_code.HTTP_404_NOT_FOUND,
            detail="Status not found",
        )

    return await status.remove(db, id=status_id)
