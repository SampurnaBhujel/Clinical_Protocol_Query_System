# backend/preprocessing/chunker.py

import re
from collections import Counter


MAX_CHUNK_CHARS = 1800
MIN_CHUNK_CHARS = 300 #120

NUMBERED_HEADING_RE = re.compile(r"^(\d+(?:\.\d+){0,4})\s+(.+)")
CHAPTER_RE = re.compile(r"^(chapter|unit|part)\s+([0-9ivx]+)\b", re.IGNORECASE)
CLINICAL_BOUNDARY_RE = re.compile(
    r"\b(symptoms?|signs?|classification|treatment|management|dose|dosage|prevention|"
    r"diagnosis|investigation|follow[- ]?up|referral|danger signs?|steps?|procedure)\b",
    re.IGNORECASE
)
BULLET_RE = re.compile(r"^\s*(?:[-*•·]|\(?[a-zA-Z0-9]{1,3}\)|[0-9]+[.)])\s+")


def _clean_line(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def _is_noise(text: str) -> bool:
    text = text.strip()
    if not text:
        return True
    if text.lower() in {"page no.", "page no", "page", "contents", "table of contents"}:
        return True
    if re.fullmatch(r"\d{1,4}", text):
        return True
    if len(text) <= 2:
        return True
    return False


def _uppercase_ratio(text: str) -> float:
    letters = [char for char in text if char.isalpha()]
    if not letters:
        return 0
    return sum(char.isupper() for char in letters) / len(letters)


def infer_document_name(filename: str) -> str:
    normalized = filename.lower()
    if "imci" in normalized:
        return "IMCI"
    if "childhood" in normalized or "hospital care" in normalized:
        return "Hospital Care for Children"
    if "ewars" in normalized or "early warning" in normalized:
        return "EWARS"
    if "smnh" in normalized or "motherhood" in normalized or "newborn" in normalized:
        return "Safe Motherhood and Newborn Health Road Map"
    if "infectious" in normalized:
        return "Infectious Disease Control Guideline"
    if "stp" in normalized or "basic health" in normalized or "standard treatment" in normalized:
        return "STP"
    return filename.rsplit(".", 1)[0]


def infer_title(pages: list[dict], filename: str) -> str:
    first_lines = []
    for page in pages[:3]:
        first_lines.extend(page["lines"][:30])

    if not first_lines:
        return infer_document_name(filename)

    largest = sorted(
        first_lines,
        key=lambda line: (line.get("font_size", 0), len(line.get("text", ""))),
        reverse=True
    )
    for line in largest:
        text = _clean_line(line["text"])
        if len(text) >= 6 and not _is_noise(text):
            return text[:180]
    return infer_document_name(filename)


def _heading_level(line: dict, common_body_size: float) -> int | None:
    text = _clean_line(line["text"])
    if _is_noise(text) or len(text) > 150:
        return None

    numbered = NUMBERED_HEADING_RE.match(text)
    if numbered:
        depth = numbered.group(1).count(".") + 1
        return min(depth, 3)

    if CHAPTER_RE.match(text):
        return 1

    size_delta = line.get("font_size", 0) - common_body_size
    uppercase = _uppercase_ratio(text)
    bold = bool(line.get("bold"))

    if size_delta >= 4 and len(text) <= 120:
        return 1
    if size_delta >= 2 and (bold or uppercase > 0.65):
        return 2
    if bold and len(text) <= 95 and (uppercase > 0.55 or CLINICAL_BOUNDARY_RE.search(text)):
        return 3
    if uppercase > 0.82 and 4 <= len(text) <= 90:
        return 2
    return None


def _content_type(lines: list[str]) -> str:
    bullet_count = sum(bool(BULLET_RE.match(line)) for line in lines)
    if bullet_count >= 2:
        return "steps" if any(re.match(r"^\s*[0-9]+[.)]\s+", line) for line in lines) else "bullets"
    joined = " ".join(lines)
    if CLINICAL_BOUNDARY_RE.search(joined):
        return "clinical_guidance"
    return "paragraph"


def build_sections(pages: list[dict], filename: str = "") -> list[dict]:
    all_sizes = [
        line["font_size"]
        for page in pages
        for line in page["lines"]
        if line.get("font_size", 0) > 0
    ]
    common_body_size = Counter(round(size, 1) for size in all_sizes).most_common(1)[0][0] if all_sizes else 0
    title = infer_title(pages, filename)

    sections = []
    active = {
        "chapter": "",
        "section": "Introduction",
        "subsection": "",
    }
    current = {
        "title": title,
        "chapter": "",
        "section": "Introduction",
        "subsection": "",
        "page": pages[0]["page"] if pages else 1,
        "lines": [],
    }

    def flush_current():
        if current["lines"]:
            sections.append({
                **{key: current[key] for key in ("title", "chapter", "section", "subsection", "page")},
                "text": "\n".join(current["lines"]),
                "content_type": _content_type(current["lines"]),
            })
            current["lines"] = []

    for page in pages:
        for line in page["lines"]:
            text = _clean_line(line["text"])
            if _is_noise(text):
                continue

            level = _heading_level(line, common_body_size)
            if level:
                flush_current()
                if level == 1:
                    active["chapter"] = text
                    active["section"] = text
                    active["subsection"] = ""
                elif level == 2:
                    active["section"] = text
                    active["subsection"] = ""
                else:
                    active["subsection"] = text

                current.update({
                    "chapter": active["chapter"],
                    "section": active["section"],
                    "subsection": active["subsection"],
                    "page": page["page"],
                })
                continue

            current.update({
                "chapter": active["chapter"],
                "section": active["section"],
                "subsection": active["subsection"],
            })
            if not current["lines"]:
                current["page"] = page["page"]
            current["lines"].append(text)

    flush_current()
    return sections


def _split_long_unit(unit: str) -> list[str]:
    sentences = re.split(r"(?<=[.!?])\s+", unit)
    chunks = []
    current = []
    for sentence in sentences:
        if not sentence:
            continue
        candidate = " ".join(current + [sentence]).strip()
        if len(candidate) > MAX_CHUNK_CHARS and current:
            chunks.append(" ".join(current).strip())
            current = [sentence]
        else:
            current.append(sentence)
    if current:
        chunks.append(" ".join(current).strip())
    return chunks


def split_section(section_text: str) -> list[str]:
    """
    Split by clinical concept boundaries instead of arbitrary token windows.

    Paragraphs and bullet groups are kept intact. Very long paragraphs are split
    only at sentence boundaries as a fallback.
    """
    lines = [_clean_line(line) for line in section_text.splitlines() if _clean_line(line)]
    if not lines:
        return []

    units = []
    current = []

    for line in lines:
        starts_new_clinical_unit = bool(CLINICAL_BOUNDARY_RE.search(line)) and current and len(" ".join(current)) >= MIN_CHUNK_CHARS
        starts_new_bullet_group = bool(BULLET_RE.match(line)) and current and not BULLET_RE.match(current[-1])

        if starts_new_clinical_unit or starts_new_bullet_group:
            units.append("\n".join(current))
            current = [line]
        else:
            current.append(line)

    if current:
        units.append("\n".join(current))

    chunks = []
    for unit in units:
        if len(unit) <= MAX_CHUNK_CHARS:
            chunks.append(unit)
        else:
            chunks.extend(_split_long_unit(unit))

    merged = []
    buffer = ""
    for chunk in chunks:
        if len(chunk) < MIN_CHUNK_CHARS and buffer:
            buffer = f"{buffer}\n{chunk}".strip()
        elif len(chunk) < MIN_CHUNK_CHARS:
            buffer = chunk
        else:
            if buffer:
                candidate = f"{buffer}\n{chunk}".strip()
                if len(candidate) <= MAX_CHUNK_CHARS:
                    merged.append(candidate)
                    buffer = ""
                else:
                    merged.append(buffer)
                    merged.append(chunk)
                    buffer = ""
            else:
                merged.append(chunk)
    if buffer:
        merged.append(buffer)

    return [chunk for chunk in merged if len(chunk.strip()) >= MIN_CHUNK_CHARS]
