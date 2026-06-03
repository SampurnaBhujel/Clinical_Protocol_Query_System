# backend/rag/pipeline.py
from config import settings
#print("GEMINI KEY LOADED:", bool(settings.GEMINI_API_KEY))

import os
import certifi

os.environ["SSL_CERT_FILE"] = certifi.where()
os.environ["REQUESTS_CA_BUNDLE"] = certifi.where()

import warnings
import logging

warnings.filterwarnings("ignore")
logging.getLogger("transformers").setLevel(logging.ERROR)

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_chroma import Chroma
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from config import settings


def get_embeddings() -> HuggingFaceEmbeddings:
    """Load the bilingual embedding model (shared with preprocessing)."""
    return HuggingFaceEmbeddings(
        model_name=settings.EMBEDDING_MODEL,
        model_kwargs={"device": "cpu"}
    )


def get_context(query: str) -> tuple[str, list[str]]:
    """
    Perform semantic similarity search against ChromaDB.

    Returns:
        context: Concatenated text of the top-4 most relevant chunks.
        sources: Deduplicated list of source citations (filename — page).
    """
    embeddings = get_embeddings()
    vectorstore = Chroma(
        persist_directory=settings.CHROMA_STORE_PATH,
        embedding_function=embeddings,
        collection_name="clinical_docs"
    )

    results = vectorstore.similarity_search(query=query, k=4)

    context = ""
    sources = []

    for doc in results:
        context += doc.page_content + "\n"
        # Build a readable citation string from metadata
        source_name = os.path.basename(doc.metadata.get("source", "Unknown"))
        page = doc.metadata.get("page", "?")
        entry = f"{source_name} — p.{page}"
        if entry not in sources:
            sources.append(entry)

    return context, sources


# System prompt follows the same design as the reference Streamlit app
PROMPT_TEMPLATE = PromptTemplate.from_template(
    """You are Clinical Protocol Query System, a bilingual medical information assistant for Nepal.

LANGUAGE RULE — this is the most important rule:
- If the question is in English only → reply entirely in English
- If the question is in Nepali only → reply entirely in Nepali
- If the question mixes both languages → reply in the same mix
- Never switch language. Match exactly what the user used.

Other rules:
- Answer using ONLY the given context. Do not make up information.
- If the answer is not found in the context, say so clearly in the user's language.
- Be concise and friendly.
- Do NOT add any disclaimer at the end — that is handled separately by the UI.
- Use conversation history to understand follow-up words like "their", "it", "those".

Conversation History:
{history}

Context from knowledge base:
{context}

Current Question: {question}

Answer:"""
)


def run_rag_pipeline(question: str, history: list[dict]) -> dict:
    """
    Full RAG pipeline:
      1. Retrieve relevant chunks from ChromaDB
      2. Build conversation history string (last 6 messages = 3 turns)
      3. Construct augmented prompt
      4. Generate response via Gemini
      5. Return answer + source citations

    Args:
        question: The user's current query.
        history: List of previous messages [{"role": ..., "content": ...}]

    Returns:
        dict with keys "answer" and "sources"
    """
    context, sources = get_context(question)

    # Only pass the last 6 messages (3 turns) to keep the prompt concise
    recent = history[-6:]
    history_text = ""
    for msg in recent:
        role = "User" if msg["role"] == "user" else "Assistant"
        history_text += f"{role}: {msg['content']}\n"
    if not history_text:
        history_text = "No previous conversation."

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=settings.GEMINI_API_KEY,
        temperature=0.2  # low temperature for factual medical responses
    )

    chain = PROMPT_TEMPLATE | llm | StrOutputParser()

    answer = chain.invoke({
        "context": context,
        "question": question,
        "history": history_text
    })

    return {"answer": answer, "sources": sources}