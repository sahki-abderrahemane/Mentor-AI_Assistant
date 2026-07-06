"""
packages/document_processing/tests/test_json_exporter.py
"""

from __future__ import annotations

import json

from document_processing.domain.content import (
    DocumentContent,
    KnowledgeUnit,
    Section,
)
from document_processing.domain.document import Document
from document_processing.domain.enums import SourceType
from document_processing.domain.metadata import (
    DocumentInfo,
    DocumentMetadata,
    DocumentStatistics,
    FileInfo,
    SourceInfo,
)
from document_processing.exporters.json_exporter import JSONExporter


def test_json_exporter(tmp_path):

    metadata = DocumentMetadata(
        document=DocumentInfo(
            title="Test Document",
        ),
        file=FileInfo(
            filename="test.pdf",
            extension="pdf",
            file_size=100,
            checksum="a" * 64,
        ),
        source=SourceInfo(
            source_type=SourceType.LOCAL,
        ),
        statistics=DocumentStatistics(
            page_count=1,
        ),
    )

    section = Section(
        title="Introduction",
        level=1,
        line_start=0,
        line_end=5,
        text="This is a section.",
        page_start=1,
        page_end=1,
    )

    knowledge_unit = KnowledgeUnit(
        text="Knowledge unit text.",
        section=section,
        subsection=None,
        page_start=1,
        page_end=1,
        word_count=3,
        token_count=None,
        metadata={},
    )

    content = DocumentContent(
        sections=[section],
        knowledge_units=[knowledge_unit],
    )

    document = Document(
        metadata=metadata,
        content=content,
    )

    output_file = tmp_path / "document.json"

    exporter = JSONExporter()

    exporter.export(
        document=document,
        output_path=output_file,
    )

    assert output_file.exists()

    with output_file.open(
        encoding="utf-8",
    ) as file:
        data = json.load(file)

    assert data["metadata"]["document"]["title"] == "Test Document"

    assert len(data["sections"]) == 1

    assert len(data["knowledge_units"]) == 1

    assert (
        data["knowledge_units"][0]["text"]
        == "Knowledge unit text."
    )

    assert (
        data["knowledge_units"][0]["section"]["title"]
        == "Introduction"
    )