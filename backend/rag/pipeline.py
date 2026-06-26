# backend/rag/pipeline.py

import json
import os
import re
import certifi
import warnings
import logging
from datetime import datetime, timezone

from langchain_chroma import Chroma
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings

from config import settings
from rag.confidence import compute_confidence
from rag.medical_synonyms import expand_query
from rag.query_rewriter import rewrite_query
from rag.reranker import rerank_chunks

from resources import get_vectorstore

os.environ["SSL_CERT_FILE"] = certifi.where()
os.environ["REQUESTS_CA_BUNDLE"] = certifi.where()

warnings.filterwarnings("ignore")
logging.getLogger("transformers").setLevel(logging.ERROR)

VECTOR_FETCH_K = 20
MAX_EVIDENCE = 5
MAX_CHROMA_DISTANCE = 1.45
RAG_LOG_PATH = os.path.join("logs", "rag_evaluation.jsonl")

NO_ANSWER_EN = "I could not find this information in the available clinical documents."
NO_ANSWER_NE = "उपलब्ध क्लिनिकल दस्तावेजहरूमा यो जानकारी फेला परेन।"
NO_ANSWER_MIXED = (
    "I could not find this information in the available clinical documents. "
    "उपलब्ध क्लिनिकल दस्तावेजहरूमा यो जानकारी फेला परेन।"
)


def get_gemini_llm():
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=settings.GEMINI_API_KEY,
        temperature=0.2,
        top_p=0.2
    )


def get_groq_llm():
    return ChatGroq(
        groq_api_key=settings.GROQ_API_KEY,
        model_name="llama-3.1-8b-instant",
        temperature=0.2,
    )


def get_embeddings() -> HuggingFaceEmbeddings:
    return HuggingFaceEmbeddings(
        model_name=settings.EMBEDDING_MODEL,
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True}
    )


def _is_nepali(text: str) -> bool:
    return bool(re.search(r"[\u0900-\u097F]", text))


def _has_english(text: str) -> bool:
    return bool(re.search(r"[A-Za-z]", text))


def _language_instruction(question: str) -> str:
    has_nepali = _is_nepali(question)
    has_english = _has_english(question)
    if has_nepali and has_english:
        return "Reply in the same mixed Nepali-English style as the user. Do not translate everything into one language."
    if has_nepali:
        return "Reply entirely in Nepali."
    return "Reply entirely in English."


def _fallback_answer(question: str) -> str:
    if _is_nepali(question) and _has_english(question):
        return NO_ANSWER_MIXED
    return NO_ANSWER_NE if _is_nepali(question) else NO_ANSWER_EN


def _clean_chunk(text: str) -> str:
    text = re.sub(r"^\s*passage:\s*", "", text or "", flags=re.IGNORECASE)
    return re.sub(r"\s+", " ", text).strip()


def _source_name(source: str) -> str:
    return os.path.basename(source or "Unknown")


def _format_page(page) -> str:
    if page is None or page == "":
        return "?"
    try:
        return str(int(page))
    except (TypeError, ValueError):
        return str(page)


def _document_name(metadata: dict) -> str:
    if metadata.get("document"):
        return metadata["document"]
    source = _source_name(metadata.get("source"))
    lowered = source.lower()
    if "imci" in lowered:
        return "IMCI"
    if "childhood" in lowered or "hospital care" in lowered:
        return "Hospital Care for Children"
    if "ewars" in lowered or "early warning" in lowered:
        return "EWARS"
    if "smnh" in lowered or "motherhood" in lowered or "newborn" in lowered:
        return "Safe Motherhood and Newborn Health Road Map"
    if "infectious" in lowered:
        return "Infectious Disease Control Guideline"
    if "stp" in lowered or "basic health" in lowered:
        return "STP"
    return source.rsplit(".", 1)[0]


def _search_vectorstore(vectorstore: Chroma, query: str):
    return vectorstore.similarity_search_with_score(
        query=f"query: {query}",
        k=VECTOR_FETCH_K
    )


def _evidence_from_ranked(ranked_results: list[tuple]) -> list[dict]:
    evidence = []
    for evidence_id, (doc, distance, reranker_score) in enumerate(ranked_results, 1):
        text = _clean_chunk(doc.page_content)
        if not text:
            continue
        metadata = doc.metadata or {}
        source = _source_name(metadata.get("source"))
        chapter = metadata.get("chapter", "")
        section = metadata.get("section", "")
        subsection = metadata.get("subsection", "")
        heading_path = metadata.get("heading_path") or " > ".join(
            part for part in (chapter, section, subsection) if part
        )
        evidence.append({
            "id": evidence_id,
            "source": source,
            "document": _document_name(metadata),
            "chapter": chapter,
            "section": section,
            "subsection": subsection,
            "heading_path": heading_path,
            "page": _format_page(metadata.get("page")),
            "chunk_id": metadata.get("chunk_id", f"{source}:{metadata.get('page', '?')}:{evidence_id}"),
            "score": float(distance),
            "reranker_score": reranker_score,
            "text": text,
        })
    return evidence


def _context_from_evidence(evidence: list[dict]) -> str:
    parts = []
    for item in evidence:
        parts.append(
            f"Evidence {item['id']}\n"
            f"Document: {item['document']}\n"
            f"Page: {item['page']}\n"
            f"Section: {item['heading_path'] or item['section'] or 'Unspecified'}\n"
            f"{item['text']}"
        )
    return "\n\n".join(parts)


def retrieve_evidence(search_query: str) -> tuple[str, list[dict], str]:
    # vectorstore = Chroma(
    #     persist_directory=settings.CHROMA_STORE_PATH,
    #     embedding_function=get_embeddings(),
    #     collection_name="clinical_docs"
    # )
    vectorstore = get_vectorstore()
    selected_route = "ALL"
    raw_results = _search_vectorstore(vectorstore, search_query)

    candidates = [
        (doc, distance)
        for doc, distance in sorted(raw_results, key=lambda item: item[1])
        if distance <= MAX_CHROMA_DISTANCE
    ]
    ranked = rerank_chunks(search_query, candidates, top_k=MAX_EVIDENCE)
    evidence = _evidence_from_ranked(ranked)
    return _context_from_evidence(evidence), evidence, selected_route


def _history_text(history: list[dict]) -> str:
    lines = []
    for message in history[-8:]:
        role = "User" if message.get("role") == "user" else "Assistant"
        content = str(message.get("content", "")).strip()
        if content:
            lines.append(f"{role}: {content}")
    return "\n".join(lines) if lines else "No previous conversation."


def _source_payload(evidence: list[dict]) -> list[dict]:
    return [{
        "id": item["id"],
        "source": item["source"],
        "document": item["document"],
        "section": item["section"],
        "subsection": item["subsection"],
        "heading_path": item["heading_path"],
        "page": item["page"],
        "chunk_id": item["chunk_id"],
        "excerpt": item["text"][:260],
    } for item in evidence]


def _log_rag_event(
    conversation_id: int | None,
    original_question: str,
    rewritten_question: str,
    route,
    evidence: list[dict],
    confidence: str,
    answer: str,
) -> None:
    os.makedirs(os.path.dirname(RAG_LOG_PATH), exist_ok=True)
    event = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "conversation_id": conversation_id,
        "original_question": original_question,
        "rewritten_question": rewritten_question,
        "selected_route": route,
        "retrieved_documents": sorted({item["document"] for item in evidence}),
        "retrieved_chunk_ids": [item["chunk_id"] for item in evidence],
        "confidence": confidence,
        "answer": answer,
    }
    with open(RAG_LOG_PATH, "a", encoding="utf-8") as log_file:
        log_file.write(json.dumps(event, ensure_ascii=False) + "\n")


PROMPT_TEMPLATE = PromptTemplate.from_template(
    """
You are Clinical Protocol Query System, a medical information assistant for Nepali users.

Rules:
- Answer using ONLY the retrieved evidence.
- Do NOT use outside medical knowledge.
- Do NOT write inline citation markers such as [1], [2], or [3].
- Sources are displayed separately by the application.
- Follow this language rule exactly: {language_instruction}
- Be concise, factual, and patient-friendly.
- Avoid unsupported diagnosis, emergency, or treatment advice.
- If the answer is not found in the evidence, say exactly:
  English: "I could not find this information in the available clinical documents."
  Nepali: "उपलब्ध क्लिनिकल दस्तावेजहरूमा यो जानकारी फेला परेन।"
  Mixed: "I could not find this information in the available clinical documents. उपलब्ध क्लिनिकल दस्तावेजहरूमा यो जानकारी फेला परेन।"

Conversation History:
{history}

Retrieved Evidence:
{context}

Question:
{question}

Answer:
"""
)


def _generate_answer(payload: dict) -> str:
    try:
        return (PROMPT_TEMPLATE | get_gemini_llm() | StrOutputParser()).invoke(payload).strip()
    except Exception as gemini_error:
        print("\nGemini failed. Falling back to Groq...")
        print("Gemini error:", repr(gemini_error))
        return (PROMPT_TEMPLATE | get_groq_llm() | StrOutputParser()).invoke(payload).strip()


def _strip_inline_citations(answer: str) -> str:
    return re.sub(r"\s*\[\d+\]", "", answer).strip()


def run_rag_pipeline(question: str, history: list[dict], conversation_id: int | None = None) -> dict:
    rewritten_question = rewrite_query(question, history)
    expanded_query = expand_query(rewritten_question)
    context, evidence, selected_route = retrieve_evidence(expanded_query)
    confidence = compute_confidence(evidence)

    if not evidence:
        answer = _fallback_answer(question)
        _log_rag_event(conversation_id, question, rewritten_question, selected_route, [], confidence, answer)
        return {
            "answer": answer,
            "sources": [],
            "confidence": confidence,
            "rewritten_question": rewritten_question,
            "selected_route": selected_route,
        }

    payload = {
        "context": context,
        "question": rewritten_question,
        "history": _history_text(history),
        "language_instruction": _language_instruction(question),
    }
    answer = _strip_inline_citations(_generate_answer(payload))
    if answer in {NO_ANSWER_EN, NO_ANSWER_NE, NO_ANSWER_MIXED}:
        sources = []
    else:
        sources = _source_payload(evidence)

    _log_rag_event(conversation_id, question, rewritten_question, selected_route, evidence, confidence, answer)
    return {
        "answer": answer,
        "sources": sources,
        "confidence": confidence,
        "rewritten_question": rewritten_question,
        "selected_route": selected_route,
    }
