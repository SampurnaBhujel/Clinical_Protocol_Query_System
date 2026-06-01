# backend/preprocessing/pipeline.py

import warnings
import logging

warnings.filterwarnings("ignore")
logging.getLogger("transformers").setLevel(logging.ERROR)

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from config import settings


def get_embeddings() -> HuggingFaceEmbeddings:
    """Load the bilingual Nepali/English embedding model."""
    return HuggingFaceEmbeddings(
        model_name=settings.EMBEDDING_MODEL,
        model_kwargs={"device": "cpu"}
    )


def index_pdf(filepath: str, filename: str) -> None:
    """
    Load a PDF, split it into overlapping chunks,
    attach metadata, and store embeddings in ChromaDB.

    Args:
        filepath: Absolute or relative path to the saved PDF file.
        filename: Original filename used as the 'source' metadata field.
    """
    # Load all pages from the PDF
    loader = PyPDFLoader(filepath)
    docs = loader.load()

    # Split into chunks of 800 tokens with 150-token overlap
    # to preserve context across chunk boundaries
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=150
    )
    chunks = splitter.split_documents(docs)

    # Tag each chunk with the filename so it appears as the citation source
    for chunk in chunks:
        chunk.metadata["source"] = filename

        # added doc id in embedding to assist deletion
        # chunk.metadata["doc_id"] = filename
        # chunk.metadata["source"] = filename
        # page number is already set by PyPDFLoader; default to "?" if missing
        chunk.metadata["page"] = chunk.metadata.get("page", "?")

    embeddings = get_embeddings()

    # Add new chunks to the existing ChromaDB collection
    # (does not wipe existing documents already indexed)
    Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=settings.CHROMA_STORE_PATH,
        collection_name="clinical_docs"
    )