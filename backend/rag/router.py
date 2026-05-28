# backend/rag/router.py

from fastapi import APIRouter, Depends, HTTPException
from rag.schemas import QueryRequest, QueryResponse
from rag.pipeline import run_rag_pipeline
from auth.dependencies import get_current_user
from auth.models import User

router = APIRouter()

@router.post("/query", response_model=QueryResponse)
async def query(
    request: QueryRequest,
    current_user: User = Depends(get_current_user)  # any authenticated user can query
):
    try:
        # Convert Pydantic history objects to plain dicts for the pipeline
        history = [{"role": m.role, "content": m.content} for m in request.history]
        result = run_rag_pipeline(request.question, history)
        return QueryResponse(answer=result["answer"], sources=result["sources"])
    except Exception as e:
        error_str = str(e)
        # Map known API errors to user-friendly messages
        if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str or "quota" in error_str.lower():
            raise HTTPException(
                status_code=429,
                detail="API quota exceeded. Please try again later."
            )
        elif "503" in error_str or "UNAVAILABLE" in error_str:
            raise HTTPException(
                status_code=503,
                detail="AI service is currently unavailable. Please try again shortly."
            )
        else:
            raise HTTPException(
                status_code=500,
                detail="An error occurred while processing your query."
            )