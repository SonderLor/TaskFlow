from datetime import datetime

from sqlalchemy import Column, DateTime, String, Text
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class TaskStatus(Base):
    title = Column(String(50), nullable=False, unique=True)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Отношения
    tasks = relationship("Task", back_populates="status")
