# backend/preprocessing/chunker.py

import re

from langchain_text_splitters import RecursiveCharacterTextSplitter


def looks_like_heading(line: str):

    line = line.strip()

    if len(line) < 3:
        return False

    if len(line) > 120:
        return False

    if re.match(r"^\d+(\.\d+)*\s+", line):
        return True

    uppercase_ratio = sum(
        c.isupper()
        for c in line
        if c.isalpha()
    ) / max(
        1,
        sum(c.isalpha() for c in line)
    )

    if uppercase_ratio > 0.8:
        return True

    return False


def build_sections(pages):

    sections = []

    current_heading = "INTRODUCTION"
    current_text = []
    current_page = 1

    for page in pages:

        page_no = page["page"]

        for line in page["text"].splitlines():

            line = line.strip()

            if not line:
                continue

            if looks_like_heading(line):

                if current_text:

                    sections.append(
                        {
                            "heading": current_heading,
                            "page": current_page,
                            "text": "\n".join(current_text)
                        }
                    )

                current_heading = line
                current_page = page_no
                current_text = []

            else:

                current_text.append(line)

    if current_text:

        sections.append(
            {
                "heading": current_heading,
                "page": current_page,
                "text": "\n".join(current_text)
            }
        )

    return sections


def split_section(section_text: str):

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        separators=[
            "\n\n",
            "\n",
            ". ",
            "? ",
            "! ",
            "; ",
            ", ",
            " ",
            ""
        ]
    )

    return splitter.split_text(section_text)