# backend/rag/schemas.py

from pydantic import BaseModel, Field

class HistoryMessage(BaseModel):
    role: str      # "user" or "assistant"
    content: str

class QueryRequest(BaseModel):
    question: str
    history: list[HistoryMessage] = Field(default_factory=list)
    conversation_id: int | None = None

class CitationSource(BaseModel):
    id: int
    source: str
    page: str
    excerpt: str | None = None

class QueryResponse(BaseModel):
    answer: str
    sources: list[CitationSource]
    conversation_id: int
