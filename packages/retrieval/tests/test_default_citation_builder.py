from document_processing.domain.content import (
    KnowledgeUnit,
    Section,
)

from retrieval.domain.query import (
    Query,
)

from retrieval.domain.retrieved_knowledge_unit import (
    RetrievedKnowledgeUnit,
)

from retrieval.citations.default_citation_builder import (
    DefaultCitationBuilder,
)


def build_unit() -> RetrievedKnowledgeUnit:

    section = Section(
        title="Artificial Intelligence",
        level=1,
        line_start=0,
        line_end=10,
        text="Artificial Intelligence",
        page_start=1,
        page_end=1,
    )

    knowledge_unit = KnowledgeUnit(
        text="Machine learning is a subset of artificial intelligence.",
        section=section,
        page_start=1,
        page_end=1,
        word_count=8,
        metadata={
            "document_title": "AI Handbook",
        },
    )

    return RetrievedKnowledgeUnit(
        knowledge_unit=knowledge_unit,
        similarity_score=0.91,
        distance=0.09,
        rank=1,
        retriever="dense",
    )


def test_default_citation_builder():

    builder = DefaultCitationBuilder()

    citations = builder.build_citations(
        Query(
            text="machine learning",
        ),
        [
            build_unit(),
        ],
    )

    assert len(citations) == 1

    citation = citations[0]

    assert citation.title == "AI Handbook"

    assert (
        citation.section
        == "Artificial Intelligence"
    )

    assert citation.page_start == 1

    assert citation.page_end == 1

    assert (
        citation.confidence
        == 0.91
    )

    assert (
        citation.metadata["builder"]
        == "default"
    )


def test_builder_name():

    builder = DefaultCitationBuilder()

    assert builder.name() == "default"