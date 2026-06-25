# # backend/rag/evaluation.py

from dataclasses import dataclass


@dataclass
class RetrievalExample:
    query: str
    relevant_chunk_ids: list[str]


def precision_at_k(retrieved_ids: list[str], relevant_ids: list[str], k: int) -> float:
    if k <= 0:
        return 0.0
    retrieved_k = retrieved_ids[:k]
    return len(set(retrieved_k) & set(relevant_ids)) / k


def recall_at_k(retrieved_ids: list[str], relevant_ids: list[str], k: int) -> float:
    if not relevant_ids:
        return 0.0
    retrieved_k = retrieved_ids[:k]
    return len(set(retrieved_k) & set(relevant_ids)) / len(set(relevant_ids))


def reciprocal_rank(retrieved_ids: list[str], relevant_ids: list[str]) -> float:
    relevant = set(relevant_ids)
    for index, chunk_id in enumerate(retrieved_ids, start=1):
        if chunk_id in relevant:
            return 1 / index
    return 0.0
