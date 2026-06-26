# backend/preprocessing/pipeline.py

import hashlib
import json
import os
import warnings
import logging

from langchain_chroma import Chroma
from langchain_core.documents import Document

from config import settings
from preprocessing.chunker import build_sections, infer_document_name, split_section
from preprocessing.embeddings import get_embeddings
from preprocessing.parser import extract_pages
from preprocessing.schemas import ChunkMetadata

from resources import get_vectorstore

warnings.filterwarnings("ignore")
logging.getLogger("transformers").setLevel(logging.ERROR)


def _safe_filename(name: str) -> str:
    return "".join(char if char.isalnum() or char in ("-", "_", ".") else "_" for char in name)


def _chunk_id(filename: str, index: int, text: str) -> str:
    digest = hashlib.sha1(f"{filename}:{index}:{text[:250]}".encode("utf-8")).hexdigest()[:12]
    return f"{_safe_filename(filename)}::{index:05d}::{digest}"


def _heading_path(chapter: str, section: str, subsection: str) -> str:
    return " > ".join(part for part in (chapter, section, subsection) if part)


def save_chunk_json(filename: str, chunk_json: dict) -> None:
    metadata_dir = os.path.join(settings.DOCUMENTS_PATH, "metadata_store")
    os.makedirs(metadata_dir, exist_ok=True)
    output_file = os.path.join(metadata_dir, f"{_safe_filename(filename)}.jsonl")

    with open(output_file, "a", encoding="utf-8") as f:
        f.write(json.dumps(chunk_json, ensure_ascii=False) + "\n")


def index_pdf(filepath: str, filename: str) -> None:
    """
    Structure-aware ingestion for clinical PDFs.

    Pipeline:
    1. Extract PyMuPDF lines with font metadata.
    2. Infer title/chapter/section/subsection hierarchy.
    3. Split each section into coherent clinical concept chunks.
    4. Store dense embeddings with full traceability metadata.
    """
    pages = extract_pages(filepath)
    sections = build_sections(pages, filename=filename)
    document_name = infer_document_name(filename)

    documents = []
    chunk_counter = 0

    for section in sections:
        chunks = split_section(section["text"])

        for chunk in chunks:
            chunk = chunk.strip()
            if len(chunk) < 120:
                continue

            chunk_id = _chunk_id(filename, chunk_counter, chunk)
            metadata = ChunkMetadata(
                source=filename,
                doc_id=filename,
                document=document_name,
                title=section["title"],
                chapter=section["chapter"],
                section=section["section"],
                subsection=section["subsection"],
                page=int(section["page"]),
                chunk_id=chunk_id,
                chunk_length=len(chunk),
                heading_path=_heading_path(section["chapter"], section["section"], section["subsection"]),
                content_type=section["content_type"],
            )
            metadata_dict = metadata.to_dict()

            save_chunk_json(filename, {
                "text": chunk,
                "metadata": metadata_dict,
            })

            # E5 embeddings expect a passage prefix, but retrieval strips it before prompting.
            documents.append(Document(
                page_content=f"passage: {chunk}",
                metadata=metadata_dict,
            ))
            chunk_counter += 1

    if not documents:
        raise ValueError(f"No structure-aware chunks were produced for {filename}")

    # vectorstore = Chroma(
    #     persist_directory=settings.CHROMA_STORE_PATH,
    #     embedding_function=get_embeddings(),
    #     collection_name="clinical_docs"
    # )
    vectorstore = get_vectorstore()
    vectorstore.add_documents(documents)
