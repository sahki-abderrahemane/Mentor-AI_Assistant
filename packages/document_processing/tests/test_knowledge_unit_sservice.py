from document_processing.domain.content import (
    DocumentContent,
    Section,
)
from document_processing.services.knowledge_unit_service import (
    KnowledgeUnitService,
)
from document_processing.splitters.chunking_config import (
    ChunkingConfig,
)


def make_text(word_count: int) -> str:
    return " ".join(["word"] * word_count)


def test_process_generates_single_knowledge_unit():

    content = DocumentContent(
        sections=[
            Section(
                title="Introduction",
                level=1,
                line_start=0,
                line_end=10,
                text=make_text(250),
                page_start=1,
                page_end=1,
            )
        ]
    )

    service = KnowledgeUnitService(
        ChunkingConfig(
            min_words=150,
            max_words=500,
        )
    )

    content = service.process(content)

    assert len(content.knowledge_units) == 1

    ku = content.knowledge_units[0]

    assert ku.word_count == 250
    assert ku.page_start == 1
    assert ku.page_end == 1


def test_process_generates_multiple_knowledge_units():

    paragraph = make_text(250)

    content = DocumentContent(
        sections=[
            Section(
                title="Method",
                level=1,
                line_start=0,
                line_end=20,
                text="\n\n".join(
                    [
                        paragraph,
                        paragraph,
                        paragraph,
                    ]
                ),
                page_start=1,
                page_end=2,
            )
        ]
    )

    service = KnowledgeUnitService(
        ChunkingConfig(
            min_words=150,
            max_words=500,
        )
    )

    content = service.process(content)

    assert len(content.knowledge_units) == 3

    for ku in content.knowledge_units:

        assert ku.word_count == 250
        assert ku.page_start == 1
        assert ku.page_end == 2