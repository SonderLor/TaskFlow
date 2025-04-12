from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.auth import get_current_active_user
from app.crud import task
from app.db import get_db
from app.models import Task
from app.models import User


async def get_task_by_id(task_id: int, db: AsyncSession = Depends(get_db)) -> Task:
    """
    Получение задачи по ID

    Args:
        task_id: ID задачи
        db: Сессия базы данных

    Returns:
        Объект задачи

    Raises:
        HTTPException: Если задача не найдена
    """
    db_task = await task.get(db=db, id=task_id)
    if db_task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )
    return db_task


async def check_task_permissions(
    db_task: Task = Depends(get_task_by_id),
    current_user: User = Depends(get_current_active_user),
) -> Task:
    """
    Проверка прав доступа к задаче

    Args:
        db_task: Объект задачи
        current_user: Текущий пользователь

    Returns:
        Объект задачи, если у пользователя есть права

    Raises:
        HTTPException: Если у пользователя нет прав доступа к задаче
    """
    # Проверяем, является ли пользователь создателем задачи
    if db_task.creator_id == current_user.id:
        return db_task

    # Проверяем, является ли пользователь исполнителем задачи
    for assignee in db_task.assignees:
        if assignee.user_id == current_user.id:
            return db_task

    # Проверяем, является ли пользователь наблюдателем задачи
    for watcher in db_task.watchers:
        if watcher.user_id == current_user.id:
            return db_task

    # Проверяем, является ли пользователь суперпользователем
    if current_user.is_superuser:
        return db_task

    # Если ничего из вышеперечисленного, то доступ запрещен
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Not enough permissions to access this task",
    )


async def check_task_edit_permissions(
    db_task: Task = Depends(get_task_by_id),
    current_user: User = Depends(get_current_active_user),
) -> Task:
    """
    Проверка прав на редактирование задачи

    Args:
        db_task: Объект задачи
        current_user: Текущий пользователь

    Returns:
        Объект задачи, если у пользователя есть права на редактирование

    Raises:
        HTTPException: Если у пользователя нет прав на редактирование задачи
    """
    # Только создатель задачи и суперпользователь могут редактировать задачу
    if db_task.creator_id == current_user.id or current_user.is_superuser:
        return db_task

    # Для исполнителей разрешаем только обновление статуса
    for assignee in db_task.assignees:
        if assignee.user_id == current_user.id:
            return db_task

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Not enough permissions to edit this task",
    )


async def check_task_delete_permissions(
    db_task: Task = Depends(get_task_by_id),
    current_user: User = Depends(get_current_active_user),
) -> Task:
    """
    Проверка прав на удаление задачи

    Args:
        db_task: Объект задачи
        current_user: Текущий пользователь

    Returns:
        Объект задачи, если у пользователя есть права на удаление

    Raises:
        HTTPException: Если у пользователя нет прав на удаление задачи
    """
    # Только создатель задачи и суперпользователь могут удалять задачу
    if db_task.creator_id == current_user.id or current_user.is_superuser:
        return db_task

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Not enough permissions to delete this task",
    )
