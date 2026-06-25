# backend/chat/router.py

import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from auth.models import User
from chat.models import Conversation, ChatMessage
from chat.schemas import ConversationDetail, ConversationSummary
from database import get_db

router = APIRouter()


@router.get("/history", response_model=list[ConversationSummary])
async def list_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return (
        db.query(Conversation)
        .filter(Conversation.user_id == current_user.id)
        .order_by(Conversation.created_at.desc(), Conversation.id.desc())
        .all()
    )


@router.get("/history/{conversation_id}", response_model=ConversationDetail)
async def get_history(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id
        )
        .first()
    )
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return {
        "id": conversation.id,
        "title": conversation.title,
        "messages": [
            {
                "role": message.role,
                "content": message.content,
                "sources": json.loads(message.sources_json or "[]"),
                "confidence": message.confidence,
            }
            for message in conversation.messages
        ]
    }


@router.delete("/history/{conversation_id}")
async def delete_history(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id
        )
        .first()
    )
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    db.query(ChatMessage).filter(ChatMessage.conversation_id == conversation.id).delete()
    db.delete(conversation)
    db.commit()
    return {"message": "Conversation deleted"}
