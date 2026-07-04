from pathlib import Path

from document_processing.domain.document import Document
from document_processing.services.document_processing_service import (
    DocumentProcessingService,
)
from document_processing.splitters.chunking_config import (
    ChunkingConfig,
)

PROJECT_ROOT = Path(__file__).resolve().parents[3]


def test_process_complete_pdf():

    pdf = PROJECT_ROOT / "datasets/raw/ml/adam.pdf"

    service = DocumentProcessingService(
        ChunkingConfig(
            min_words=150,
            max_words=500,
        )
    )

    document = service.process(
        pdf_path=pdf,
        category="Machine Learning",
    )

    assert isinstance(document, Document)

    assert document.metadata.document.title is not None

    assert document.content.raw_text is not None

    assert document.content.cleaned_text is not None

    assert len(document.content.pages) > 0

    assert len(document.content.sections) > 0

    assert len(document.content.knowledge_units) > 0