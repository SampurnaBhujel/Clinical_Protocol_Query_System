# # backend/preprocessing/pipeline.py

# import warnings
# import logging

# warnings.filterwarnings("ignore")
# logging.getLogger("transformers").setLevel(logging.ERROR)

# from langchain_community.document_loaders import PyPDFLoader
# from langchain_text_splitters import RecursiveCharacterTextSplitter
# from langchain_huggingface import HuggingFaceEmbeddings
# from langchain_chroma import Chroma

# from config import settings


# def get_embeddings() -> HuggingFaceEmbeddings:
#     """Load the bilingual Nepali/English embedding model."""
#     return HuggingFaceEmbeddings(
#         model_name=settings.EMBEDDING_MODEL,
#         model_kwargs={"device": "cpu"},
#         encode_kwargs={
#         "normalize_embeddings": True
#         }
#     )


# def index_pdf(filepath: str, filename: str) -> None:
#     """
#     Load PDF, split into chunks, enrich metadata,
#     generate embeddings, and store in ChromaDB.

#     Args:
#         filepath: Absolute or relative path to the saved PDF file.
#         filename: Original filename used as the 'source' metadata field.
#     """
#     # Load all pages from the PDF
#     loader = PyPDFLoader(filepath)
#     docs = loader.load()

#     # Split into chunks of 800 tokens with 150-token overlap
#     # to preserve context across chunk boundaries
#     splitter = RecursiveCharacterTextSplitter(
#         chunk_size= 1000, #800,
#         chunk_overlap=200, #150
#         separators=[
#             "\n\n",
#             "\n",
#             ". ",
#             "? ",
#             "! ",
#             "; ",
#             ", ",
#             " ",
#             ""
#         ]
#     )
#     chunks = splitter.split_documents(docs)

#     # Tag each chunk with the filename so it appears as the citation source
#     for chunk in chunks:
#         # E5 models were trained with passage prefixes.
#         chunk.page_content = (f"passage: {chunk.page_content.strip()}")


#         chunk.metadata["source"] = filename

#         # added doc id in embedding to assist deletion
#         chunk.metadata["doc_id"] = filename
#         # chunk.metadata["source"] = filename
#         # page number is already set by PyPDFLoader; default to "?" if missing
#         #chunk.metadata["page"] = chunk.metadata.get("page", "?")
#         chunk.metadata["page"] = str(chunk.metadata.get("page", "?"))

#     embeddings = get_embeddings()

#     # Add new chunks to the existing ChromaDB collection
#     # (does not wipe existing documents already indexed)
#     Chroma.from_documents(
#         documents=chunks,
#         embedding=embeddings,
#         persist_directory=settings.CHROMA_STORE_PATH,
#         collection_name="clinical_docs"
#     )

import json
import os
import warnings
import logging

warnings.filterwarnings("ignore")
logging.getLogger("transformers").setLevel(logging.ERROR)

from langchain_core.documents import Document
from langchain_chroma import Chroma

from config import settings

from preprocessing.embeddings import get_embeddings
from preprocessing.parser import extract_pages
from preprocessing.chunker import (
    build_sections,
    split_section
)
from preprocessing.schemas import ChunkMetadata


def save_chunk_json(
    filename: str,
    chunk_json: dict
):

    metadata_dir = os.path.join(
        settings.DOCUMENTS_PATH,
        "metadata_store"
    )

    os.makedirs(metadata_dir, exist_ok=True)

    output_file = os.path.join(
        metadata_dir,
        f"{filename}.jsonl"
    )

    with open(
        output_file,
        "a",
        encoding="utf-8"
    ) as f:

        f.write(
            json.dumps(
                chunk_json,
                ensure_ascii=False
            )
            + "\n"
        )


def index_pdf(
    filepath: str,
    filename: str
):

    pages = extract_pages(filepath)

    sections = build_sections(pages)

    documents = []

    chunk_counter = 0

    for section in sections:

        chunks = split_section(
            section["text"]
        )

        for chunk in chunks:

            chunk = chunk.strip()

            if len(chunk) < 100:
                continue

            metadata = ChunkMetadata(
                source=filename,
                doc_id=filename,
                page=section["page"],
                section=section["heading"],
                chunk_id=chunk_counter,
                chunk_length=len(chunk)
            )

            chunk_json = {
                "content": chunk,
                "metadata": metadata.to_dict()
            }

            save_chunk_json(
                filename,
                chunk_json
            )

            documents.append(
                Document(
                    page_content=f"passage: {chunk}",
                    metadata=metadata.to_dict()
                )
            )

            chunk_counter += 1

    vectorstore = Chroma(
        persist_directory=settings.CHROMA_STORE_PATH,
        embedding_function=get_embeddings(),
        collection_name="clinical_docs"
    )

    vectorstore.add_documents(
        documents
    )