# backend/chat/schemas.py

from datetime import datetime

from pydantic import BaseModel


class ConversationSummary(BaseModel):
    id: int
    title: str
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationMessage(BaseModel):
    role: str
    content: str

    class Config:
        from_attributes = True


class ConversationDetail(BaseModel):
    id: int
    title: str
    messages: list[ConversationMessage]

    class Config:
        from_attributes = True
