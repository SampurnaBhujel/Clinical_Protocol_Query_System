# backend/preprocessing/parser.py
import fitz


def extract_pages(pdf_path: str):

    pdf = fitz.open(pdf_path)

    pages = []

    for page_num in range(len(pdf)):

        page = pdf[page_num]

        text = page.get_text("text")

        if not text:
            continue

        pages.append(
            {
                "page": page_num + 1,
                "text": text.strip()
            }
        )

    pdf.close()

    return pages