# backend/rag/router.py

import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from rag.schemas import QueryRequest, QueryResponse
from rag.pipeline import run_rag_pipeline
from auth.dependencies import get_current_user
from auth.models import User
from chat.models import ChatMessage, Conversation

router = APIRouter()


def _conversation_title(question: str) -> str:
    title = " ".join(question.strip().split())
    return title[:120] or "New conversation"

@router.post("/query", response_model=QueryResponse)
async def query(
    request: QueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # any authenticated user can query
):
    try:
        if request.conversation_id is None:
            conversation = Conversation(
                user_id=current_user.id,
                title=_conversation_title(request.question)
            )
            db.add(conversation)
            db.commit()
            db.refresh(conversation)
        else:
            conversation = (
                db.query(Conversation)
                .filter(
                    Conversation.id == request.conversation_id,
                    Conversation.user_id == current_user.id
                )
                .first()
            )
            if not conversation:
                raise HTTPException(status_code=404, detail="Conversation not found")

        previous_messages = (
            db.query(ChatMessage)
            .filter(ChatMessage.conversation_id == conversation.id)
            .order_by(ChatMessage.id.asc())
            .all()
        )
        history = [
            {"role": message.role, "content": message.content}
            for message in previous_messages
        ]

        user_message = ChatMessage(
            conversation_id=conversation.id,
            role="user",
            content=request.question
        )
        db.add(user_message)
        db.commit()

        result = run_rag_pipeline(request.question, history, conversation_id=conversation.id)

        assistant_message = ChatMessage(
            conversation_id=conversation.id,
            role="assistant",
            content=result["answer"],
            sources_json=json.dumps(result["sources"], ensure_ascii=False),
            confidence=result["confidence"]
        )
        db.add(assistant_message)
        db.commit()

        return QueryResponse(
            answer=result["answer"],
            confidence=result["confidence"],
            sources=result["sources"],
            conversation_id=conversation.id
        )
    except HTTPException:
        raise
    # except Exception as e:
    #     error_str = str(e)
    except Exception as e:
        import traceback

        print("\n========== RAG ERROR ==========")
        traceback.print_exc()
        print("ERROR:", repr(e))
        print("================================\n")

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
