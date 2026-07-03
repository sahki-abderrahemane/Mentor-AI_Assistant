from document_processing.services.structure_service import StructureService


def test_structure_service():

    text = """
Abstract

This is the abstract.

1 Introduction

This is the introduction.

2 Method

This is the method.
""".strip()

    service = StructureService()

    sections = service.process(text)

    assert len(sections) == 3

    assert sections[0].title == "Abstract"
    assert "abstract" in sections[0].text.lower()

    assert sections[1].title == "1 Introduction"
    assert "introduction" in sections[1].text.lower()

    assert sections[2].title == "2 Method"
    assert "method" in sections[2].text.lower()