"""
packages/document_processing/tests/test_pipeline.py
"""

from pathlib import Path

from document_processing.domain.document import Document
from document_processing.pipeline import (
    DocumentProcessingPipeline,
)

PROJECT_ROOT = Path(__file__).resolve().parents[3]


def test_pipeline_process():

    pdf = PROJECT_ROOT / "datasets/raw/ml/adam.pdf"

    pipeline = DocumentProcessingPipeline()

    document = pipeline.process(
        pdf_path=pdf,
        category="Machine Learning",
    )

    assert isinstance(document, Document)

    assert document.metadata.document.title is not None

    assert document.content.cleaned_text is not None

    assert len(document.content.sections) > 0

    assert len(document.content.knowledge_units) > 0