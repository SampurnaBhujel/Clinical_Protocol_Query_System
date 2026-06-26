# backend/admin/router.py

import os
import json
import shutil
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from langchain_chroma import Chroma
from database import get_db
from auth.dependencies import require_admin
from auth.models import User
from admin.models import Document
from admin.schemas import DocumentOut, UserOut
from preprocessing.pipeline import get_embeddings, index_pdf
from config import settings

from resources import get_vectorstore

router = APIRouter()


def delete_document_vectors(filename: str) -> None:
    # vectorstore = Chroma(
    #     persist_directory=settings.CHROMA_STORE_PATH,
    #     embedding_function=get_embeddings(),
    #     collection_name="clinical_docs"
    # )
    vectorstore = get_vectorstore()
    vectorstore._collection.delete(where={"doc_id": filename})

@router.post("/documents/upload", response_model=DocumentOut)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    # Only accept PDF files
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # Prevent duplicate document names in the knowledge base
    if db.query(Document).filter(Document.filename == file.filename).first():
        raise HTTPException(status_code=400, detail="A document with this name already exists")

    # Ensure the local documents directory exists
    os.makedirs(settings.DOCUMENTS_PATH, exist_ok=True)
    filepath = os.path.join(settings.DOCUMENTS_PATH, file.filename)

    # Save the raw PDF locally before indexing
    with open(filepath, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Index the PDF into ChromaDB; remove the file if indexing fails
    try:
        index_pdf(filepath, file.filename)
    except Exception as e:
        os.remove(filepath)
        raise HTTPException(status_code=500, detail=f"Indexing failed: {str(e)}")

    # Record the document in SQLite
    doc = Document(filename=file.filename, filepath=filepath)
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc

# @router.post("/documents/upload", response_model=DocumentOut)
# async def upload_document(
#     file: UploadFile = File(...),
#     db: Session = Depends(get_db),
#     admin: User = Depends(require_admin)
# ):
#     if not file.filename.endswith(".pdf"):
#         raise HTTPException(status_code=400, detail="Only PDF files are allowed")

#     if db.query(Document).filter(Document.filename == file.filename).first():
#         raise HTTPException(status_code=400, detail="A document with this name already exists")

#     os.makedirs(settings.DOCUMENTS_PATH, exist_ok=True)
#     filepath = os.path.join(settings.DOCUMENTS_PATH, file.filename)

#     # Save file locally ONLY
#     with open(filepath, "wb") as f:
#         shutil.copyfileobj(file.file, f)

#     # Save metadata in DB ONLY
#     doc = Document(filename=file.filename, filepath=filepath)
#     db.add(doc)
#     db.commit()
#     db.refresh(doc)

#     return doc


@router.get("/documents", response_model=list[DocumentOut])
async def list_documents(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    return db.query(Document).all()


@router.delete("/documents/{document_id}")
async def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    try:
        delete_document_vectors(doc.filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vector cleanup failed: {str(e)}")

    # Remove the physical PDF file if it still exists
    if os.path.exists(doc.filepath):
        os.remove(doc.filepath)

    # Remove from SQLite
    db.delete(doc)
    db.commit()
    return {"message": f"{doc.filename} deleted successfully"}


@router.get("/users", response_model=list[UserOut])
async def list_users(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    return db.query(User).all()


@router.get("/evaluation")
async def list_evaluation_logs(
    admin: User = Depends(require_admin)
):
    log_path = os.path.join("logs", "rag_evaluation.jsonl")
    if not os.path.exists(log_path):
        return []

    records = []
    with open(log_path, "r", encoding="utf-8") as log_file:
        for line in log_file:
            line = line.strip()
            if not line:
                continue
            try:
                records.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    return list(reversed(records[-500:]))
