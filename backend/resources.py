# backend/resources.py

from functools import lru_cache

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

from config import settings


@lru_cache(maxsize=1)
def get_embeddings():
    return HuggingFaceEmbeddings(
        model_name=settings.EMBEDDING_MODEL,
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True},
    )


@lru_cache(maxsize=1)
def get_vectorstore():
    return Chroma(
        persist_directory=settings.CHROMA_STORE_PATH,
        embedding_function=get_embeddings(),
        collection_name="clinical_docs",
    )