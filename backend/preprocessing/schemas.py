# backend/preprocessing/schemas.py

from dataclasses import dataclass, asdict
from typing import Dict


@dataclass
class ChunkMetadata:
    source: str
    doc_id: str
    page: int
    section: str
    chunk_id: int
    chunk_length: int

    def to_dict(self) -> Dict:
        return asdict(self)