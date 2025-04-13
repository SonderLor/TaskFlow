from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.auth import get_current_active_user
from app.api.dependencies.tasks import (
    check_task_delete_permissions,
    check_task_edit_permissions,
    check_task_permissions,
)
from app.crud import task
from app.db import get_db
from app.models import User
from app.schemas import Task, TaskCreate, TaskDetail, TaskUpdate

router = APIRouter()


@router.get("/", response_model=List[Task])
async def read_tasks(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Получение списка задач
    """
    tasks = await task.get_multi(db, skip=skip, limit=limit)
    return tasks


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

    return TaskDetail(
        id=created_task.id,
        title=created_task.title,
        description=created_task.description,
        creator=created_task.creator,
        status=created_task.status,
        assignees=[assignee.user for assignee in created_task.assignees],
        watchers=[watcher.user for watcher in created_task.watchers],
    )


@router.get("/me", response_model=List[Task])
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
    tasks = await task.get_user_tasks(
        db, user_id=current_user.id, skip=skip, limit=limit
    )
    return tasks


@router.get("/created", response_model=List[Task])
async def read_created_tasks(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Получение задач, созданных текущим пользователем
    """
    tasks = await task.get_by_creator(
        db, creator_id=current_user.id, skip=skip, limit=limit
    )
    return tasks


@router.get("/assigned", response_model=List[Task])
async def read_assigned_tasks(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Получение задач, назначенных текущему пользователю
    """
    tasks = await task.get_assigned_to_user(
        db, user_id=current_user.id, skip=skip, limit=limit
    )
    return tasks


@router.get("/watching", response_model=List[Task])
async def read_watching_tasks(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Получение задач, за которыми наблюдает текущий пользователь
    """
    tasks = await task.get_watched_by_user(
        db, user_id=current_user.id, skip=skip, limit=limit
    )
    return tasks


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

    return TaskDetail(
        id=db_task.id,
        title=db_task.title,
        description=db_task.description,
        creator=db_task.creator,
        status=db_task.status,
        assignees=[assignee.user for assignee in db_task.assignees],
        watchers=[watcher.user for watcher in db_task.watchers],
    )


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

    return TaskDetail(
        id=updated_task.id,
        title=updated_task.title,
        description=updated_task.description,
        creator=updated_task.creator,
        status=updated_task.status,
        assignees=[assignee.user for assignee in updated_task.assignees],
        watchers=[watcher.user for watcher in updated_task.watchers],
    )


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

    return TaskDetail(
        id=removed_task.id,
        title=removed_task.title,
        description=removed_task.description,
        creator=removed_task.creator,
        status=removed_task.status,
        assignees=[assignee.user for assignee in removed_task.assignees],
        watchers=[watcher.user for watcher in removed_task.watchers],
    )
