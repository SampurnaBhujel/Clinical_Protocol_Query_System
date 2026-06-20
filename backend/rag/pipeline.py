import os
import re
import certifi
import warnings
import logging

from langchain_chroma import Chroma
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_huggingface import HuggingFaceEmbeddings

from config import settings

os.environ["SSL_CERT_FILE"] = certifi.where()
os.environ["REQUESTS_CA_BUNDLE"] = certifi.where()

warnings.filterwarnings("ignore")
logging.getLogger("transformers").setLevel(logging.ERROR)

MAX_EVIDENCE = 6
FETCH_K = 12
MAX_CHROMA_DISTANCE = 1.45

NO_ANSWER_EN = "I could not find this information in the available clinical documents."
NO_ANSWER_NE = "उपलब्ध क्लिनिकल दस्तावेजहरूमा यो जानकारी फेला परेन।"
NO_ANSWER_MIXED = (
    "I could not find this information in the available clinical documents. "
    "उपलब्ध क्लिनिकल दस्तावेजहरूमा यो जानकारी फेला परेन।"
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
        return (
            "The question mixes Nepali and English. Reply in the same mixed style: "
            "use Nepali for Nepali terms/phrases and English for English terms/phrases. "
            "Do not translate the whole answer into only one language."
        )
    if has_nepali:
        return "The question is in Nepali. Reply entirely in Nepali, except citation numbers like [1]."
    return "The question is in English. Reply entirely in English, except citation numbers like [1]."


def _fallback_answer(question: str) -> str:
    if _is_nepali(question) and _has_english(question):
        return NO_ANSWER_MIXED
    return NO_ANSWER_NE if _is_nepali(question) else NO_ANSWER_EN


def _clean_chunk(text: str) -> str:
    text = re.sub(r"^\s*passage:\s*", "", text or "", flags=re.IGNORECASE)
    return re.sub(r"\s+", " ", text).strip()


def _format_page(page) -> str:
    if page is None or page == "":
        return "?"
    try:
        return str(int(page) + 1)
    except (TypeError, ValueError):
        return str(page)


def _source_name(source: str) -> str:
    return os.path.basename(source or "Unknown")


def get_context(query: str) -> tuple[str, list[dict]]:
    embeddings = get_embeddings()
    vectorstore = Chroma(
        persist_directory=settings.CHROMA_STORE_PATH,
        embedding_function=embeddings,
        collection_name="clinical_docs"
    )

    raw_results = vectorstore.similarity_search_with_score(
        query=f"query: {query}",
        k=FETCH_K
    )

    # Chroma returns distance scores: lower means more similar.
    ranked_results = sorted(raw_results, key=lambda item: item[1])
    relevant_results = [
        (doc, score)
        for doc, score in ranked_results
        if score <= MAX_CHROMA_DISTANCE
    ][:MAX_EVIDENCE]

    evidence = []
    context_parts = []

    for evidence_id, (doc, score) in enumerate(relevant_results, 1):
        text = _clean_chunk(doc.page_content)
        if not text:
            continue

        source = _source_name(doc.metadata.get("source"))
        page = _format_page(doc.metadata.get("page"))

        item = {
            "id": evidence_id,
            "source": source,
            "page": page,
            "score": float(score),
            "text": text
        }
        evidence.append(item)
        context_parts.append(
            f"[{evidence_id}] Source: {source}, page {page}\n{text}"
        )

    return "\n\n".join(context_parts), evidence


PROMPT_TEMPLATE = PromptTemplate.from_template(
    """
You are Clinical Protocol Query System, a medical information assistant for Nepali users.

Your answer must be grounded only in the Evidence section below.

Rules:
- Use ONLY the Evidence. Do not use outside medical knowledge.
- Every medical claim must end with one or more citations like [1] or [2].
- Use only citation numbers that appear in the Evidence.
- Do not cite conversation history. History is only for resolving follow-up references.
- If the Evidence does not contain the answer, say exactly:
  English: "I could not find this information in the available clinical documents."
  Nepali: "उपलब्ध क्लिनिकल दस्तावेजहरूमा यो जानकारी फेला परेन।"
  Mixed Nepali and English: "I could not find this information in the available clinical documents. उपलब्ध क्लिनिकल दस्तावेजहरूमा यो जानकारी फेला परेन।"
- Do not add citations to the no-information sentence.
- Follow this response language rule exactly:
  {language_instruction}
- Be concise, factual, and patient-friendly.
- Do not add diagnosis, emergency, or treatment advice unless it is present in Evidence.
- Do not mention "Evidence", "context", or "source files" in the answer.

Conversation History:
{history}

Evidence:
{context}

Question:
{question}

Answer:
"""
)


def _history_text(history: list[dict]) -> str:
    recent_messages = history[-6:]
    lines = []
    for message in recent_messages:
        role = "User" if message.get("role") == "user" else "Assistant"
        content = str(message.get("content", "")).strip()
        if content:
            lines.append(f"{role}: {content}")
    return "\n".join(lines) if lines else "No previous conversation."


def _used_citation_ids(answer: str, max_id: int) -> set[int]:
    citation_ids = {int(match) for match in re.findall(r"\[(\d+)\]", answer)}
    invalid = sorted(citation_id for citation_id in citation_ids if citation_id < 1 or citation_id > max_id)
    if invalid:
        raise ValueError(f"Invalid citations returned by model: {invalid}")
    return citation_ids


def _answer_has_citations(answer: str) -> bool:
    return bool(re.search(r"\[\d+\]", answer))


def run_rag_pipeline(question: str, history: list[dict]) -> dict:
    context, evidence = get_context(question)
    if not evidence:
        return {"answer": _fallback_answer(question), "sources": []}

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=settings.GEMINI_API_KEY,
        temperature=0,
        top_p=0.2
    )

    chain = PROMPT_TEMPLATE | llm | StrOutputParser()
    answer = chain.invoke({
        "context": context,
        "question": question,
        "history": _history_text(history),
        "language_instruction": _language_instruction(question)
    }).strip()

    if answer in {NO_ANSWER_EN, NO_ANSWER_NE, NO_ANSWER_MIXED}:
        return {"answer": answer, "sources": []}

    if not _answer_has_citations(answer):
        return {"answer": _fallback_answer(question), "sources": []}

    try:
        used_ids = _used_citation_ids(answer, len(evidence))
    except ValueError:
        return {"answer": _fallback_answer(question), "sources": []}

    sources = [
        {
            "id": item["id"],
            "source": item["source"],
            "page": item["page"],
            "excerpt": item["text"][:260]
        }
        for item in evidence
        if item["id"] in used_ids
    ]

    return {"answer": answer, "sources": sources}
