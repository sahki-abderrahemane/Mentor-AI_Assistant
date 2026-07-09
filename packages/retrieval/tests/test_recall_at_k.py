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

from retrieval.evaluation.metrics.recall_at_k import (
    RecallAtK,
)


def build_unit() -> RetrievedKnowledgeUnit:

    section = Section(
        title="AI",
        level=1,
        line_start=0,
        line_end=1,
        text="AI",
        page_start=1,
        page_end=1,
    )

    ku = KnowledgeUnit(
        text="Artificial Intelligence",
        section=section,
        page_start=1,
        page_end=1,
        word_count=2,
    )

    return RetrievedKnowledgeUnit(
        knowledge_unit=ku,
        similarity_score=0.9,
        rank=1,
        retriever="dense",
    )


def test_recall_at_k():

    unit = build_unit()

    metric = RecallAtK().compute(
        query=Query(
            text="AI",
        ),
        retrieved_units=[
            unit,
        ],
        relevant_ids=[
            str(unit.knowledge_unit.id),
        ],
    )

    assert metric.name == "Recall@K"

    assert metric.value == 1.0