# # backend/rag/query_rewriter.py

import re


AMBIGUOUS_STARTS = (
    "what about", "what are", "what is", "how about", "how to", "tell me more",
    "warning signs", "symptoms", "treatment", "prevention", "dose", "causes",
    "यसको", "त्यसको", "के हुन्", "कसरी", "लक्षण", "उपचार", "चेतावनी",
)


def _is_probably_followup(question: str) -> bool:
    lowered = question.strip().lower()
    if len(lowered.split()) <= 6:
        return True
    return lowered.startswith(AMBIGUOUS_STARTS)


def _last_user_topic(history: list[dict]) -> str:
    for message in reversed(history):
        if message.get("role") != "user":
            continue
        content = str(message.get("content", "")).strip()
        if content:
            return re.sub(r"^(tell me about|what is|what are|explain)\s+", "", content, flags=re.IGNORECASE).strip(" ?.।")
    return ""


def rewrite_query(question: str, history: list[dict]) -> str:
    """
    Heuristic history-aware rewriting.

    The project keeps this deterministic to avoid another LLM call before
    retrieval. It preserves the user's language by appending the previous topic
    in its original language when the current question is ambiguous.
    """
    clean_question = question.strip()
    if not clean_question or not history or not _is_probably_followup(clean_question):
        return clean_question

    topic = _last_user_topic(history)
    if not topic:
        return clean_question

    lowered = clean_question.lower()
    if topic.lower() in lowered:
        return clean_question

    if re.search(r"[\u0900-\u097F]", clean_question):
        return f"{clean_question} ({topic})"
    return f"{clean_question} of {topic}"
