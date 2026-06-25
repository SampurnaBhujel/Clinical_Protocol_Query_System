# backend/preprocessing/embeddings.py
from langchain_huggingface import HuggingFaceEmbeddings

from config import settings


def get_embeddings():

    return HuggingFaceEmbeddings(
        model_name=settings.EMBEDDING_MODEL,
        model_kwargs={
            "device": "cpu"
        },
        encode_kwargs={
            "normalize_embeddings": True
        }
    )