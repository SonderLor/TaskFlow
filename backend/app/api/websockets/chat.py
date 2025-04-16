from fastapi import WebSocket, WebSocketDisconnect, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.schemas import CommentCreate, CommentUpdate
from app.crud import comment as crud_comment, task
from app.api.dependencies.auth import get_current_user
from app.api.dependencies.tasks import check_task_permissions


class ConnectionManager:
    def __init__(self):
        # Структура: {task_id: {user_id: websocket}}
        self.active_connections: dict[int, dict[int, WebSocket]] = {}

    async def connect(self, websocket: WebSocket, task_id: int, user_id: int):
        await websocket.accept()
        if task_id not in self.active_connections:
            self.active_connections[task_id] = {}
        self.active_connections[task_id][user_id] = websocket

    def disconnect(self, task_id: int, user_id: int):
        if task_id in self.active_connections:
            if user_id in self.active_connections[task_id]:
                del self.active_connections[task_id][user_id]
            if not self.active_connections[task_id]:
                del self.active_connections[task_id]

    async def broadcast(self, message: dict, task_id: int, exclude_user_id: int = None):
        """Отправляет сообщение всем подключенным к задаче пользователям"""
        if task_id in self.active_connections:
            recipient_count = 0
            for user_id, websocket in self.active_connections[task_id].items():
                if exclude_user_id is None or user_id != exclude_user_id:
                    try:
                        await websocket.send_json(message)
                        recipient_count += 1
                    except Exception as e:
                        pass


manager = ConnectionManager()


async def handle_comment(data: dict, task_id: int, user_id: int, db: AsyncSession):
    """Обрабатывает новый комментарий"""
    try:
        comment_in = CommentCreate(
            task_id=task_id,
            text=data.get("text", ""),
            author_id=user_id,
            mention_ids=data.get("mention_ids", []),
            is_edited=False
        )

        db_comment = await crud_comment.create(db=db, obj_in=comment_in)

        comment_data = {
            "id": db_comment.id,
            "task_id": db_comment.task_id,
            "author_id": db_comment.author_id,
            "author": {
                "id": db_comment.author.id,
                "username": db_comment.author.username
            },
            "text": db_comment.text,
            "attachment_path": db_comment.attachment_path,
            "created_at": db_comment.created_at.isoformat(),
            "updated_at": db_comment.updated_at.isoformat(),
            "mentions": [
                {"id": mention.user.id, "username": mention.user.username}
                for mention in db_comment.mentions
            ],
            "is_edited": db_comment.is_edited,
        }

        await manager.broadcast(
            message={"type": "new_comment", "data": comment_data},
            task_id=task_id
        )

        return comment_data
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"type": "error", "message": str(e)}


async def handle_typing(task_id: int, user_id: int, username: str):
    """Обрабатывает уведомление о печати"""
    try:
        await manager.broadcast(
            message={
                "type": "typing",
                "user_id": user_id,
                "username": username
            },
            task_id=task_id,
            exclude_user_id=user_id
        )
        return True
    except Exception as e:
        return False


async def handle_edit_comment(data: dict, task_id: int, user_id: int, db: AsyncSession):
    """Обрабатывает редактирование комментария"""
    try:
        comment_id = data.get("comment_id")
        text = data.get("text", "")
        mention_ids = data.get("mention_ids", [])

        print(f"Editing comment: id={comment_id}, user_id={user_id}, text={text}")

        # Получаем комментарий из БД
        db_comment = await crud_comment.get(db=db, id=comment_id)
        if not db_comment:
            return {"type": "error", "message": "Comment not found"}

        # Проверяем права на редактирование
        if db_comment.author_id != user_id and not (await is_admin(db, user_id)):
            return {"type": "error", "message": "You don't have permission to edit this comment"}

        # Обновляем комментарий
        comment_update = CommentUpdate(
            text=text,
            mention_ids=mention_ids,
            is_edited=True
        )
        updated_comment = await crud_comment.update(db=db, db_obj=db_comment, obj_in=comment_update)

        # Готовим данные для отправки клиентам
        comment_data = {
            "id": updated_comment.id,
            "task_id": updated_comment.task_id,
            "author_id": updated_comment.author_id,
            "author": {
                "id": updated_comment.author.id,
                "username": updated_comment.author.username
            },
            "text": updated_comment.text,
            "attachment_path": updated_comment.attachment_path,
            "created_at": updated_comment.created_at.isoformat(),
            "updated_at": updated_comment.updated_at.isoformat(),
            "mentions": [
                {"id": mention.user.id, "username": mention.user.username}
                for mention in updated_comment.mentions
            ],
            "is_edited": updated_comment.is_edited,
        }

        # Отправляем всем участникам
        await manager.broadcast(
            message={"type": "edit_comment", "data": comment_data},
            task_id=task_id
        )

        return comment_data

    except Exception as e:
        import traceback
        print(f"Error editing comment: {str(e)}")
        traceback.print_exc()
        return {"type": "error", "message": str(e)}


async def handle_delete_comment(data: dict, task_id: int, user_id: int, db: AsyncSession):
    """Обрабатывает удаление комментария"""
    try:
        comment_id = data.get("comment_id")
        print(f"Deleting comment: id={comment_id}, user_id={user_id}")

        # Получаем комментарий из БД
        db_comment = await crud_comment.get(db=db, id=comment_id)
        if not db_comment:
            return {"type": "error", "message": "Comment not found"}

        # Проверяем права на удаление
        if db_comment.author_id != user_id and not (await is_admin(db, user_id)):
            return {"type": "error", "message": "You don't have permission to delete this comment"}

        # Удаляем комментарий
        await crud_comment.remove(db=db, id=comment_id)

        # Отправляем всем участникам
        await manager.broadcast(
            message={"type": "delete_comment", "data": {"comment_id": comment_id}},
            task_id=task_id
        )

        return {"success": True, "comment_id": comment_id}

    except Exception as e:
        import traceback
        print(f"Error deleting comment: {str(e)}")
        traceback.print_exc()
        return {"type": "error", "message": str(e)}


async def is_admin(db: AsyncSession, user_id: int) -> bool:
    """Проверяет, является ли пользователь администратором"""
    from app.crud import user as crud_user
    user = await crud_user.get(db=db, id=user_id)
    return user and user.is_superuser


async def task_comments_websocket(
        websocket: WebSocket,
        task_id: int,
        token: str = None,
        db: AsyncSession = Depends(get_db)
):
    """WebSocket эндпоинт для комментариев к задаче"""

    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    current_user = await get_current_user(db, token)
    if not current_user:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    try:
        db_task = await task.get(db, id=task_id)
        if not db_task:
            raise Exception("Task not found")

        await check_task_permissions(db_task=db_task, current_user=current_user)
    except Exception as e:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await manager.connect(websocket, task_id, current_user.id)

    try:
        # Отправляем историю комментариев
        comments = await crud_comment.get_by_task(db=db, task_id=task_id)
        comments_data = []

        for comment in comments:
            comment_item = {
                "id": comment.id,
                "task_id": comment.task_id,
                "author_id": comment.author_id,
                "author": {
                    "id": comment.author.id,
                    "username": comment.author.username
                },
                "text": comment.text,
                "attachment_path": comment.attachment_path,
                "created_at": comment.created_at.isoformat(),
                "updated_at": comment.updated_at.isoformat(),
                "mentions": [
                    {"id": mention.user.id, "username": mention.user.username}
                    for mention in comment.mentions
                ],
                "is_edited": comment.is_edited,
            }
            comments_data.append(comment_item)

        await websocket.send_json({
            "type": "history",
            "data": comments_data
        })

        # Обрабатываем новые сообщения
        while True:
            data = await websocket.receive_json()
            message_type = data.get("type")

            if message_type == "typing":
                await handle_typing(task_id, current_user.id, current_user.username)
            elif message_type == "edit_comment":
                result = await handle_edit_comment(data, task_id, current_user.id, db)
                if "type" in result and result["type"] == "error":
                    await websocket.send_json(result)
            elif message_type == "delete_comment":
                result = await handle_delete_comment(data, task_id, current_user.id, db)
                if "type" in result and result["type"] == "error":
                    await websocket.send_json(result)
            else:
                # По умолчанию считаем, что это новый комментарий
                result = await handle_comment(data, task_id, current_user.id, db)
                if "type" in result and result["type"] == "error":
                    await websocket.send_json(result)

    except WebSocketDisconnect:
        manager.disconnect(task_id, current_user.id)
    except Exception as e:
        import traceback
        traceback.print_exc()
        manager.disconnect(task_id, current_user.id)

        try:
            await websocket.send_json({
                "type": "error",
                "message": f"Server error: {str(e)}"
            })
        except:
            pass
