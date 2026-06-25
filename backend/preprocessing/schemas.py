# backend/preprocessing/schemas.py

from dataclasses import asdict, dataclass


@dataclass
class ChunkMetadata:
    source: str
    doc_id: str
    document: str
    title: str
    chapter: str
    section: str
    subsection: str
    page: int
    chunk_id: str
    chunk_length: int
    heading_path: str
    content_type: str

    def to_dict(self) -> dict:
        # Chroma metadata must stay flat and scalar.
        return {
            key: "" if value is None else value
            for key, value in asdict(self).items()
        }
