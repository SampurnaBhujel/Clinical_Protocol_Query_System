# backend/rag/schemas.py

from pydantic import BaseModel

class HistoryMessage(BaseModel):
    role: str      # "user" or "assistant"
    content: str

class QueryRequest(BaseModel):
    question: str
    history: list[HistoryMessage] = []  # conversation history sent from frontend

class QueryResponse(BaseModel):
    answer: str
    sources: list[str]