from fastapi import APIRouter
from .chat import task_comments_websocket

router = APIRouter()

# WebSocket эндпоинт для комментариев к задаче
router.websocket("/tasks/{task_id}/comments")(task_comments_websocket)
