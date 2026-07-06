from datetime import UTC, datetime

from document_processing.domain.content import (
    DocumentContent,
    KnowledgeUnit,
    PageContent,
    Section,
)
from document_processing.domain.document import Document
from document_processing.domain.enums import (
    ProcessingStage,
    ProcessingStatus,
    SourceType,
)
from document_processing.domain.evaluation import (
    DPEEvaluation,
)
from document_processing.domain.metadata import (
    DocumentInfo,
    DocumentMetadata,
    DocumentStatistics,
    FileInfo,
    SourceInfo,
)
from document_processing.domain.processing import (
    ProcessingEvent,
)
from document_processing.evaluators.chunk_evaluator import (
    ChunkEvaluator,
)
from document_processing.evaluators.coverage_evaluator import (
    CoverageEvaluator,
)
from document_processing.evaluators.document_evaluator import (
    DocumentEvaluator,
)
from document_processing.evaluators.performance_evaluator import (
    PerformanceEvaluator,
)
from document_processing.evaluators.structure_evaluator import (
    StructureEvaluator,
)
from document_processing.services.evaluation_service import (
    EvaluationService,
)
from document_processing.splitters.chunking_config import (
    ChunkingConfig,
)


def make_metadata() -> DocumentMetadata:

    return DocumentMetadata(
        document=DocumentInfo(
            title="Test Document",
        ),
        file=FileInfo(
            filename="test.pdf",
            extension="pdf",
            file_size=100,
            checksum="a" * 64,
        ),
        source=SourceInfo(
            source_type=SourceType.LOCAL,
        ),
        statistics=DocumentStatistics(
            page_count=2,
        ),
    )


def make_section() -> Section:

    return Section(
        title="Introduction",
        level=1,
        line_start=0,
        line_end=10,
        text="word " * 100,
        page_start=1,
        page_end=1,
    )


def make_ku(words: int) -> KnowledgeUnit:

    section = make_section()

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


def make_document() -> Document:

    content = DocumentContent(
        cleaned_text=" ".join(["word"] * 450),
        pages=[
            PageContent(
                page_number=1,
                text="Page one",
                layout={},
                word_count=200,
            ),
            PageContent(
                page_number=2,
                text="Page two",
                layout={},
                word_count=250,
            ),
        ],
        sections=[
            make_section(),
            Section(
                title="Conclusion",
                level=1,
                line_start=20,
                line_end=25,
                text="",
                page_start=2,
                page_end=2,
            ),
        ],
        knowledge_units=[
            make_ku(100),
            make_ku(150),
            make_ku(200),
        ],
    )

    history = [
        ProcessingEvent(
            step=ProcessingStage.TEXT_EXTRACTED,
            status=ProcessingStatus.SUCCESS,
            started_at=datetime.now(UTC),
            finished_at=datetime.now(UTC),
            duration_ms=120,
        ),
        ProcessingEvent(
            step=ProcessingStage.CLEANED,
            status=ProcessingStatus.SUCCESS,
            started_at=datetime.now(UTC),
            finished_at=datetime.now(UTC),
            duration_ms=80,
        ),
    ]

    return Document(
        metadata=make_metadata(),
        content=content,
        processing_stage=ProcessingStage.COMPLETED,
        processing_history=history,
    )


def test_chunk_evaluator():

    evaluator = ChunkEvaluator(
        ChunkingConfig(
            min_words=120,
            max_words=180,
        )
    )

    result = evaluator.evaluate(
        make_document().content,
    )

    assert result.smallest_chunk == 100
    assert result.largest_chunk == 200
    assert result.average_chunk_size == 150
    assert result.chunks_below_minimum == 1
    assert result.chunks_above_maximum == 1


def test_structure_evaluator():

    result = StructureEvaluator().evaluate(
        make_document().content,
    )

    assert result.heading_count == 2
    assert result.section_count == 2
    assert result.empty_sections == 1


def test_document_evaluator():

    result = DocumentEvaluator().evaluate(
        make_document().content,
    )

    assert result.page_count == 2
    assert result.section_count == 2
    assert result.knowledge_unit_count == 3
    assert result.word_count == 450


def test_coverage_evaluator():

    result = CoverageEvaluator().evaluate(
        make_document().content,
    )

    assert result.raw_word_count == 450
    assert result.knowledge_unit_word_count == 450
    assert result.coverage_percentage == 100


def test_performance_evaluator():

    result = PerformanceEvaluator().evaluate(
        make_document().processing_history,
    )

    assert result.processing_time_ms == 200


def test_evaluation_service():

    service = EvaluationService(
        ChunkingConfig(
            min_words=120,
            max_words=180,
        )
    )

    result = service.process(
        make_document(),
    )

    assert isinstance(
        result,
        DPEEvaluation,
    )

    assert result.document.page_count == 2

    assert result.chunking.average_chunk_size == 150

    assert result.coverage.coverage_percentage == 100

    assert result.performance.processing_time_ms == 200