from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, String, Integer
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class User(Base):
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    first_name = Column(String)
    last_name = Column(String)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean(), default=True)
    is_superuser = Column(Boolean(), default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Отношения
    tasks_created = relationship(
        "Task", back_populates="creator", foreign_keys="Task.creator_id"
    )
    tasks_assigned = relationship("TaskAssignee", back_populates="user", cascade="all, delete")
    tasks_watching = relationship("TaskWatcher", back_populates="user", cascade="all, delete")
    comments = relationship("Comment", back_populates="author", cascade="all, delete")
    comment_mentions = relationship("CommentMention", back_populates="user", cascade="all, delete")
