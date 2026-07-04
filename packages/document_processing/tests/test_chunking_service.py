"""
packages/document_processing/tests/test_chunking_service.py
"""

from document_processing.domain.content import Section
from document_processing.services.chunking_service import ChunkingService
from document_processing.splitters.chunking_config import ChunkingConfig


def make_text(word_count: int) -> str:
    return " ".join(["word"] * word_count)


def test_valid_section_returns_single_chunk():

    section = Section(
        title="Introduction",
        level=1,
        line_start=0,
        line_end=10,
        text=make_text(300),
        page_start=1,
        page_end=1,
    )

    service = ChunkingService(
        ChunkingConfig(
            min_words=150,
            max_words=500,
        )
    )

    chunks = service.chunk(section)

    assert chunks == [section.text]


def test_large_section_is_split_into_paragraphs():

    paragraph = make_text(250)

    section = Section(
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

    service = ChunkingService(
        ChunkingConfig(
            min_words=150,
            max_words=500,
        )
    )

    chunks = service.chunk(section)

    assert len(chunks) == 3

    assert chunks == [
        paragraph,
        paragraph,
        paragraph,
    ]


def test_large_paragraph_is_split_into_sentences():

    sentence = make_text(120)

    paragraph = (
        sentence + ". "
        + sentence + ". "
        + sentence + "."
    )

    section = Section(
        title="Method",
        level=1,
        line_start=0,
        line_end=20,
        text=paragraph,
        page_start=1,
        page_end=1,
    )

    service = ChunkingService(
        ChunkingConfig(
            min_words=100,
            max_words=250,
        )
    )

    chunks = service.chunk(section)

    assert len(chunks) == 3

    assert chunks == [
        sentence + ".",
        sentence + ".",
        sentence + ".",
    ]