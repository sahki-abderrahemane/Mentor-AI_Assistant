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
from document_processing.services.dataset_generation_service import (
    DatasetGenerationService,
)


def test_dataset_generation_service(tmp_path):

    metadata = DocumentMetadata(
        document=DocumentInfo(
            title="Dataset Test",
        ),
        file=FileInfo(
            filename="document.pdf",
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
        text="Section text.",
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

    output_file = tmp_path / "dataset.json"

    service = DatasetGenerationService()

    returned_path = service.process(
        document=document,
        output_path=output_file,
    )

    assert returned_path == output_file

    assert output_file.exists()

    with output_file.open(
        encoding="utf-8",
    ) as file:

        data = json.load(file)

    assert data["metadata"]["document"]["title"] == "Dataset Test"

    assert len(data["sections"]) == 1

    assert len(data["knowledge_units"]) == 1

    assert (
        data["knowledge_units"][0]["section"]["title"]
        == "Introduction"
    )