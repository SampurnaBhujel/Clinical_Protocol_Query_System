# backend/admin/router.py

import os
import shutil
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from auth.dependencies import require_admin
from auth.models import User
from admin.models import Document
from admin.schemas import DocumentOut, UserOut
from preprocessing.pipeline import index_pdf
from config import settings

router = APIRouter()

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

    # Remove the physical PDF file if it still exists
    if os.path.exists(doc.filepath):
        os.remove(doc.filepath)

    # Remove from SQLite
    # Note: ChromaDB chunks from this document remain in the vector store.
    # To fully remove them, a ChromaDB delete by metadata filter would be needed.
    db.delete(doc)
    db.commit()
    return {"message": f"{doc.filename} deleted successfully"}


@router.get("/users", response_model=list[UserOut])
async def list_users(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    return db.query(User).all()