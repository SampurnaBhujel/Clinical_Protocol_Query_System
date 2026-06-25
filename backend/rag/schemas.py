# backend/rag/schemas.py

from pydantic import BaseModel, Field

class HistoryMessage(BaseModel):
    role: str      # "user" or "assistant"
    content: str

class QueryRequest(BaseModel):
    question: str
    conversation_id: int | None = None

class CitationSource(BaseModel):
    id: int
    source: str
    document: str | None = None
    section: str | None = None
    subsection: str | None = None
    heading_path: str | None = None
    page: str
    chunk_id: str | None = None
    excerpt: str | None = None

class QueryResponse(BaseModel):
    answer: str
    confidence: str
    sources: list[CitationSource]
    conversation_id: int
