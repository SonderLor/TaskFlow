from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Comment(Base):
    task_id = Column(Integer, ForeignKey("task.id"))
    author_id = Column(Integer, ForeignKey("user.id"))
    text = Column(Text, nullable=False)
    attachment_path = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Отношения
    task = relationship("Task", back_populates="comments")
    author = relationship("User", back_populates="comments")
    mentions = relationship("CommentMention", back_populates="comment")


class CommentMention(Base):
    comment_id = Column(Integer, ForeignKey("comment.id"), primary_key=True)
    user_id = Column(Integer, ForeignKey("user.id"), primary_key=True)

    # Отношения
    comment = relationship("Comment", back_populates="mentions")
    user = relationship("User", back_populates="comment_mentions")
