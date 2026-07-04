from document_processing.domain.content import Section
from document_processing.factories.knowledge_unit_factory import (
    KnowledgeUnitFactory,
)


def test_create_knowledge_units():

    section = Section(
        title="Introduction",
        level=1,
        line_start=0,
        line_end=10,
        text="Dummy section",
        page_start=1,
        page_end=2,
    )

    chunks = [
        "This is the first chunk.",
        "This is the second chunk.",
    ]

    factory = KnowledgeUnitFactory()

    units = factory.create(
        section=section,
        chunks=chunks,
    )

    assert len(units) == 2

    assert units[0].text == chunks[0]
    assert units[1].text == chunks[1]

    assert units[0].section == section
    assert units[1].section == section

    assert units[0].page_start == 1
    assert units[0].page_end == 2

    assert units[1].page_start == 1
    assert units[1].page_end == 2

    assert units[0].word_count == 5
    assert units[1].word_count == 5

    assert units[0].token_count is None
    assert units[1].token_count is None

    assert units[0].metadata == {}
    assert units[1].metadata == {}