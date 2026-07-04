from document_processing.domain.content import DocumentContent
from document_processing.services.structure_service import (
    StructureService,
)


def test_structure_service_populates_sections():

    content = DocumentContent(
        cleaned_text="""
1 Introduction

This is the introduction.

2 Method

This is the method.
""".strip()
    )

    service = StructureService()

    content = service.process(content)

    assert len(content.sections) == 2

    assert content.sections[0].title == "1 Introduction"
    assert content.sections[1].title == "2 Method"