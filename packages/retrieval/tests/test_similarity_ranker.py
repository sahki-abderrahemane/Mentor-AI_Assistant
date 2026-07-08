"""
packages/retrieval/tests/test_similarity_ranker.py
"""

from document_processing.domain.content import (
    KnowledgeUnit,
)

from retrieval.domain.query import Query
from retrieval.domain.retrieved_knowledge_unit import (
    RetrievedKnowledgeUnit,
)
from retrieval.rankers.similarity_ranker import (
    SimilarityRanker,
)

from document_processing.domain.content import (
    KnowledgeUnit,
    Section,
)


def build_unit(
    score: float,
    rank: int,
) -> RetrievedKnowledgeUnit:

    section = Section(
        title="Test",
        level=1,
        text="Test Section",
        line_start=0,
        line_end=0,
        page_start=1,
        page_end=1,
    )

    knowledge_unit = KnowledgeUnit(
        text=f"Knowledge Unit {score}",
        section=section,
        page_start=1,
        page_end=1,
        word_count=3,
    )

    return RetrievedKnowledgeUnit(
        knowledge_unit=knowledge_unit,
        similarity_score=score,
        distance=1.0 - score,
        rank=rank,
        retriever="dense",
    )
def test_similarity_ranker_orders_results():

    ranker = SimilarityRanker()

    query = Query(
        text="machine learning",
    )

    retrieved_units = [
        build_unit(0.42, 1),
        build_unit(0.91, 2),
        build_unit(0.75, 3),
        build_unit(0.33, 4),
    ]

    ranked = ranker.rank(
        query,
        retrieved_units,
    )

    assert len(ranked) == 4

    assert ranked[0].similarity_score == 0.91
    assert ranked[1].similarity_score == 0.75
    assert ranked[2].similarity_score == 0.42
    assert ranked[3].similarity_score == 0.33

    assert ranked[0].rank == 1
    assert ranked[1].rank == 2
    assert ranked[2].rank == 3
    assert ranked[3].rank == 4


def test_ranker_name():

    ranker = SimilarityRanker()

    assert ranker.name() == "similarity"
