from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.auth import get_current_active_user
from app.api.dependencies.tasks import check_task_permissions
from app.crud import comment
from app.db import get_db
from app.models import Comment, User


async def get_comment_by_id(
    comment_id: int, db: AsyncSession = Depends(get_db)
) -> Comment:
    """
    Получение комментария по ID

    Args:
        comment_id: ID комментария
        db: Сессия базы данных

    Returns:
        Объект комментария

    Raises:
        HTTPException: Если комментарий не найден
    """
    db_comment = await comment.get(db=db, id=comment_id)
    if db_comment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found"
        )
    return db_comment


async def check_comment_permissions(
    db_comment: Comment = Depends(get_comment_by_id),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Comment:
    """
    Проверка прав доступа к комментарию

    Args:
        db_comment: Объект комментария
        current_user: Текущий пользователь
        db: Сессия базы данных

    Returns:
        Объект комментария, если у пользователя есть права

    Raises:
        HTTPException: Если у пользователя нет прав доступа к комментарию
    """
    # Проверяем, что пользователь имеет доступ к задаче, к которой относится комментарий
    await check_task_permissions(
        task_id=db_comment.task_id, current_user=current_user, db=db
    )

    return db_comment


async def check_comment_edit_permissions(
    db_comment: Comment = Depends(get_comment_by_id),
    current_user: User = Depends(get_current_active_user),
) -> Comment:
    """
    Проверка прав на редактирование комментария

    Args:
        db_comment: Объект комментария
        current_user: Текущий пользователь

    Returns:
        Объект комментария, если у пользователя есть права на редактирование

    Raises:
        HTTPException: Если у пользователя нет прав на редактирование комментария
    """
    # Только автор комментария и суперпользователь могут редактировать комментарий
    if db_comment.author_id == current_user.id or current_user.is_superuser:
        return db_comment

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Not enough permissions to edit this comment",
    )


async def check_comment_delete_permissions(
    db_comment: Comment = Depends(get_comment_by_id),
    current_user: User = Depends(get_current_active_user),
) -> Comment:
    """
    Проверка прав на удаление комментария

    Args:
        db_comment: Объект комментария
        current_user: Текущий пользователь

    Returns:
        Объект комментария, если у пользователя есть права на удаление

    Raises:
        HTTPException: Если у пользователя нет прав на удаление комментария
    """
    # Только автор комментария и суперпользователь могут удалять комментарий
    if db_comment.author_id == current_user.id or current_user.is_superuser:
        return db_comment

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Not enough permissions to delete this comment",
    )
