from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

Base = declarative_base()

class Conversation(Base):
    __tablename__ = 'conversations'
    id = Column(Integer, primary_key=True)
    title = Column(String(100), default="New Chat")
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = 'messages'
    id = Column(Integer, primary_key=True)
    conversation_id = Column(Integer, ForeignKey('conversations.id'))
    role = Column(String(10))  # 'user' or 'bot'
    text = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    conversation = relationship("Conversation", back_populates="messages")