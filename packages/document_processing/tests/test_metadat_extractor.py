from pathlib import Path

from document_processing.extractors.pdf.metadata_extractor import (
    PDFMetadataExtractor,
)
from inspect import signature

print(signature(PDFMetadataExtractor.extract))
PROJECT_ROOT = Path(__file__).resolve().parents[3]


def test_pdf_metadata_extractor():

    extractor = PDFMetadataExtractor()

    pdf = PROJECT_ROOT / "datasets/raw/ml/adam.pdf"

    metadata = extractor.extract(
        pdf,
        category="ml",
    )

    assert metadata.statistics.page_count > 0

    assert metadata.file.filename == "adam.pdf"

    assert metadata.file.extension == ".pdf"

    assert len(metadata.file.checksum) == 64

    assert metadata.document.category == "ml"

    assert isinstance(metadata.document.authors, list)