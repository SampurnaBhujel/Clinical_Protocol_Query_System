# backend/chat/schemas.py

from datetime import datetime

from pydantic import BaseModel, Field


class ConversationSummary(BaseModel):
    id: int
    title: str
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationMessage(BaseModel):
    role: str
    content: str
    sources: list[dict] = Field(default_factory=list)
    confidence: str | None = None

    class Config:
        from_attributes = True


class ConversationDetail(BaseModel):
    id: int
    title: str
    messages: list[ConversationMessage]

    class Config:
        from_attributes = True
