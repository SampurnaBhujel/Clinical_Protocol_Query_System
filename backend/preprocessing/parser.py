# backend/preprocessing/parser.py

import re
from statistics import median

import fitz


BULLET_RE = re.compile(r"^\s*(?:[-*•·]|\(?[a-zA-Z0-9]{1,3}\)|[0-9]+[.)])\s+")


def _span_is_bold(span: dict) -> bool:
    font_name = str(span.get("font", "")).lower()
    return "bold" in font_name or bool(span.get("flags", 0) & 16)


def _line_from_spans(spans: list[dict]) -> dict | None:
    text = " ".join(span.get("text", "").strip() for span in spans if span.get("text", "").strip())
    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        return None

    sizes = [float(span.get("size", 0)) for span in spans if span.get("size")]
    return {
        "text": text,
        "font_size": max(sizes) if sizes else 0,
        "bold": any(_span_is_bold(span) for span in spans),
        "font": spans[0].get("font", "") if spans else "",
        "is_bullet": bool(BULLET_RE.match(text)),
    }


def extract_pages(pdf_path: str) -> list[dict]:
    """
    Extract page lines with font metadata.

    PyMuPDF's dict output gives spans with font name, flags, and size. This lets the
    chunker infer headings and preserve clinical list/step structure instead of
    splitting arbitrary fixed windows.
    """
    pdf = fitz.open(pdf_path)
    pages = []

    for page_index, page in enumerate(pdf):
        page_dict = page.get_text("dict")
        raw_lines = []

        for block in page_dict.get("blocks", []):
            if block.get("type") != 0:
                continue
            for line in block.get("lines", []):
                parsed = _line_from_spans(line.get("spans", []))
                if not parsed:
                    continue
                parsed["bbox"] = line.get("bbox", [0, 0, 0, 0])
                raw_lines.append(parsed)

        body_sizes = [line["font_size"] for line in raw_lines if line["font_size"] > 0]
        body_size = median(body_sizes) if body_sizes else 0

        pages.append({
            "page": page_index + 1,
            "body_font_size": body_size,
            "lines": raw_lines,
            "text": "\n".join(line["text"] for line in raw_lines),
        })

    pdf.close()
    return pages
