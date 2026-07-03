from pathlib import Path

from document_processing.extractors.pdf.text_extractor import (
    PDFTextExtractor,
)

PROJECT_ROOT = Path(__file__).resolve().parents[3]


def test_pdf_text_extractor():

    extractor = PDFTextExtractor()

    pdf = PROJECT_ROOT / "datasets/raw/ml/adam.pdf"

    content = extractor.extract(pdf)

    assert content.raw_text is not None

    assert len(content.raw_text) > 0

    assert len(content.pages) > 0

    first_page = content.pages[0]

    assert first_page.page_number == 1

    assert len(first_page.text) > 0

    assert first_page.word_count > 0

    assert isinstance(first_page.layout, dict)


from document_processing.domain.content import DocumentContent
from document_processing.services.cleaning_service import CleaningService


def test_cleaning_service():

    service = CleaningService()

    content = DocumentContent(
        raw_text="Cafe\u0301\x00\n\n\nHello     World"
    )

    cleaned = service.clean(content)

    assert cleaned.raw_text == "Cafe\u0301\x00\n\n\nHello     World"

    assert cleaned.cleaned_text == "Café\n\nHello World"