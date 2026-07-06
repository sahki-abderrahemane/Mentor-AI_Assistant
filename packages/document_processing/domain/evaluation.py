from __future__ import annotations

from pydantic import Field

from .base import MentorModel


class PerformanceEvaluation(MentorModel):
    """
    Performance metrics of the Document Processing Engine.
    """

    processing_time_ms: float = Field(
        default=0,
        ge=0,
        description="Total processing time in milliseconds.",
    )


class DocumentEvaluation(MentorModel):
    """
    Statistics describing the processed document.
    """

    page_count: int = Field(
        default=0,
        ge=0,
    )

    section_count: int = Field(
        default=0,
        ge=0,
    )

    knowledge_unit_count: int = Field(
        default=0,
        ge=0,
    )

    word_count: int = Field(
        default=0,
        ge=0,
    )


class ChunkEvaluation(MentorModel):
    """
    Quality metrics of generated Knowledge Units.
    """

    smallest_chunk: int = Field(
        default=0,
        ge=0,
    )

    largest_chunk: int = Field(
        default=0,
        ge=0,
    )

    average_chunk_size: float = Field(
        default=0,
        ge=0,
    )

    chunks_below_minimum: int = Field(
        default=0,
        ge=0,
    )

    chunks_above_maximum: int = Field(
        default=0,
        ge=0,
    )


class StructureEvaluation(MentorModel):
    """
    Metrics describing the detected document structure.
    """

    heading_count: int = Field(
        default=0,
        ge=0,
    )

    section_count: int = Field(
        default=0,
        ge=0,
    )

    empty_sections: int = Field(
        default=0,
        ge=0,
    )


class CoverageEvaluation(MentorModel):
    """
    Measures how much text survives the DPE pipeline.
    """

    raw_word_count: int = Field(
        default=0,
        ge=0,
    )

    knowledge_unit_word_count: int = Field(
        default=0,
        ge=0,
    )

    coverage_percentage: float = Field(
        default=0,
        ge=0,
        le=100,
    )


class DPEEvaluation(MentorModel):
    """
    Complete evaluation of a processed document.
    """

    performance: PerformanceEvaluation = Field(
        default_factory=PerformanceEvaluation,
    )

    document: DocumentEvaluation = Field(
        default_factory=DocumentEvaluation,
    )

    chunking: ChunkEvaluation = Field(
        default_factory=ChunkEvaluation,
    )

    structure: StructureEvaluation = Field(
        default_factory=StructureEvaluation,
    )

    coverage: CoverageEvaluation = Field(
        default_factory=CoverageEvaluation,
    )