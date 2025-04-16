from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.auth import get_current_active_user, get_current_superuser
from app.api.dependencies.tasks import (
    check_task_delete_permissions,
    check_task_edit_permissions,
    check_task_permissions,
)
from app.crud import task
from app.db import get_db
from app.models import User, Task as TaskModel
from app.schemas import Task, TaskCreate, TaskDetail, TaskUpdate

router = APIRouter()


def task_to_detail(t: TaskModel) -> TaskDetail:
    """Преобразует объект модели Task в схему TaskDetail"""
    return TaskDetail(
        id=t.id,
        title=t.title,
        description=t.description,
        creator=t.creator,
        status=t.status,
        assignees=[assignee.user for assignee in t.assignees],
        watchers=[watcher.user for watcher in t.watchers],
        created_at=t.created_at,
        updated_at=t.updated_at,
        status_id=t.status_id,
        creator_id=t.creator_id
    )


@router.get("/", response_model=List[TaskDetail])
async def read_tasks(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_superuser),
) -> Any:
    """
    Получение списка задач
    """
    db_tasks = await task.get_multi(db, skip=skip, limit=limit)
    return [task_to_detail(t) for t in db_tasks]


@router.post("/", response_model=TaskDetail)
async def create_task(
    *,
    db: AsyncSession = Depends(get_db),
    task_in: TaskCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Создание новой задачи
    """
    # Устанавливаем текущего пользователя как создателя задачи
    task_data = task_in.model_dump()
    task_data["creator_id"] = current_user.id

    created_task = await task.create(db, obj_in=TaskCreate(**task_data))

    return task_to_detail(created_task)


@router.get("/me", response_model=List[TaskDetail])
async def read_my_tasks(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Получение задач текущего пользователя
    (созданные им, назначенные ему или за которыми он наблюдает)
    """
    db_tasks = await task.get_user_tasks(
        db, user_id=current_user.id, skip=skip, limit=limit
    )
    return [task_to_detail(t) for t in db_tasks]


@router.get("/created", response_model=List[TaskDetail])
async def read_created_tasks(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Получение задач, созданных текущим пользователем
    """
    db_tasks = await task.get_by_creator(
        db, creator_id=current_user.id, skip=skip, limit=limit
    )
    return [task_to_detail(t) for t in db_tasks]


@router.get("/assigned", response_model=List[TaskDetail])
async def read_assigned_tasks(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Получение задач, назначенных текущему пользователю
    """
    db_tasks = await task.get_assigned_to_user(
        db, user_id=current_user.id, skip=skip, limit=limit
    )
    return [task_to_detail(t) for t in db_tasks]


@router.get("/watching", response_model=List[TaskDetail])
async def read_watching_tasks(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Получение задач, за которыми наблюдает текущий пользователь
    """
    db_tasks = await task.get_watched_by_user(
        db, user_id=current_user.id, skip=skip, limit=limit
    )
    return [task_to_detail(t) for t in db_tasks]


@router.get("/{task_id}", response_model=TaskDetail)
async def read_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Получение конкретной задачи по ID
    """
    db_task = await task.get(db, id=task_id)
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )

    # Проверка прав доступа к задаче
    await check_task_permissions(db_task=db_task, current_user=current_user)

    return task_to_detail(db_task)


@router.put("/{task_id}", response_model=TaskDetail)
async def update_task(
    *,
    db: AsyncSession = Depends(get_db),
    task_id: int,
    task_in: TaskUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Обновление задачи
    """
    db_task = await task.get(db, id=task_id)
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )

    # Проверка прав на редактирование задачи
    await check_task_edit_permissions(db_task=db_task, current_user=current_user)

    updated_task = await task.update(db, db_obj=db_task, obj_in=task_in)
    await db.refresh(updated_task)

    return task_to_detail(updated_task)


@router.delete("/{task_id}", response_model=TaskDetail)
async def delete_task(
    *,
    db: AsyncSession = Depends(get_db),
    task_id: int,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Удаление задачи
    """
    db_task = await task.get(db, id=task_id)
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )

    # Проверка прав на удаление задачи
    await check_task_delete_permissions(db_task=db_task, current_user=current_user)

    removed_task = await task.remove(db, id=task_id)

    return task_to_detail(removed_task)
