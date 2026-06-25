# backend/rag/reranker.py

from functools import lru_cache

from sentence_transformers import CrossEncoder


RERANKER_MODEL = "BAAI/bge-reranker-base"


@lru_cache(maxsize=1)
def _get_cross_encoder() -> CrossEncoder | None:
    try:
        return CrossEncoder(RERANKER_MODEL, max_length=512)
    except Exception as exc:
        print(f"Reranker unavailable, using vector order. Error: {exc!r}")
        return None


def rerank_chunks(query: str, candidates: list[tuple], top_k: int = 5) -> list[tuple]:
    """
    candidates are tuples of (Document, vector_distance).
    Returns (Document, vector_distance, reranker_score).
    """
    if not candidates:
        return []

    reranker = _get_cross_encoder()
    if reranker is None:
        return [(doc, distance, None) for doc, distance in candidates[:top_k]]

    pairs = [(query, doc.page_content) for doc, _ in candidates]
    scores = reranker.predict(pairs)
    ranked = sorted(
        ((doc, distance, float(score)) for (doc, distance), score in zip(candidates, scores)),
        key=lambda item: item[2],
        reverse=True
    )
    return ranked[:top_k]
