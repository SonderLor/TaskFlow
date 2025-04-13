from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.orm import DeclarativeBase


class Base(AsyncAttrs, DeclarativeBase):
    """Базовый класс SQLAlchemy для моделей"""

    @declared_attr.directive
    def __tablename__(cls) -> str:
        return cls.__name__.lower()
