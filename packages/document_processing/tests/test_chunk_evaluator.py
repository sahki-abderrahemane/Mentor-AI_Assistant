from document_processing.domain.content import (
    DocumentContent,
    KnowledgeUnit,
    Section,
)
from document_processing.domain.evaluation import ChunkEvaluation
from document_processing.evaluators.chunk_evaluator import (
    ChunkEvaluator,
)
from document_processing.splitters.chunking_config import (
    ChunkingConfig,
)


def make_ku(words: int) -> KnowledgeUnit:

    section = Section(
        title="Test",
        level=1,
        line_start=0,
        line_end=0,
        text="",
        page_start=1,
        page_end=1,
    )

    return KnowledgeUnit(
        text=" ".join(["word"] * words),
        section=section,
        subsection=None,
        page_start=1,
        page_end=1,
        word_count=words,
        token_count=None,
        metadata={},
    )


def test_chunk_evaluator():

    content = DocumentContent(
        knowledge_units=[
            make_ku(100),
            make_ku(150),
            make_ku(200),
        ]
    )

    evaluator = ChunkEvaluator(
        ChunkingConfig(
            min_words=120,
            max_words=180,
        )
    )

    result = evaluator.evaluate(content)

    assert isinstance(
        result,
        ChunkEvaluation,
    )

    assert result.smallest_chunk == 100

    assert result.largest_chunk == 200

    assert result.average_chunk_size == 150

    assert result.chunks_below_minimum == 1

    assert result.chunks_above_maximum == 1