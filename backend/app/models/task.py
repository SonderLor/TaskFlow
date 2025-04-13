from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Task(Base):
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    creator_id = Column(Integer, ForeignKey("user.id"))
    status_id = Column(Integer, ForeignKey("taskstatus.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Отношения
    creator = relationship(
        "User", back_populates="tasks_created", foreign_keys=[creator_id]
    )
    status = relationship("TaskStatus", back_populates="tasks")
    assignees = relationship("TaskAssignee", back_populates="task", cascade="all, delete")
    watchers = relationship("TaskWatcher", back_populates="task", cascade="all, delete")
    comments = relationship("Comment", back_populates="task", cascade="all, delete")


class TaskAssignee(Base):
    task_id = Column(Integer, ForeignKey("task.id"), primary_key=True)
    user_id = Column(Integer, ForeignKey("user.id"), primary_key=True)

    # Отношения
    task = relationship("Task", back_populates="assignees")
    user = relationship("User", back_populates="tasks_assigned")


class TaskWatcher(Base):
    task_id = Column(Integer, ForeignKey("task.id"), primary_key=True)
    user_id = Column(Integer, ForeignKey("user.id"), primary_key=True)

    # Отношения
    task = relationship("Task", back_populates="watchers")
    user = relationship("User", back_populates="tasks_watching")
