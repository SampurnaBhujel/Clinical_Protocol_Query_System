# backend/rag/confidence.py

def compute_confidence(evidence: list[dict]) -> str:
    """
    Centralized confidence policy.

    High: enough supporting chunks and strong vector/reranker scores.
    Medium: some support but weaker or fewer chunks.
    Low: sparse or weak retrieval support.
    """
    if not evidence:
        return "Low"

    count = len(evidence)
    avg_distance = sum(float(item.get("score", 2.0)) for item in evidence) / count
    reranker_scores = [item.get("reranker_score") for item in evidence if item.get("reranker_score") is not None]
    avg_reranker = sum(reranker_scores) / len(reranker_scores) if reranker_scores else None

    if count >= 3 and avg_distance <= 0.75 and (avg_reranker is None or avg_reranker >= 0):
        return "High"
    if count >= 2 and avg_distance <= 1.15:
        return "Medium"
    return "Low"
