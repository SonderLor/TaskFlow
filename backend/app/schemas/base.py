from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class BaseSchema(BaseModel):
    """Базовая схема для всех моделей"""

    class Config:
        from_attributes = True
        populate_by_name = True


class TimestampMixin(BaseModel):
    """Примесь для сущностей с временными метками"""

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
