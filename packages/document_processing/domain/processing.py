"""
packages/document_processing/domain/processing.py
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from pydantic import Field

from .base import MentorModel
from .enums import ProcessingStage, ProcessingStatus


class ProcessingEvent(MentorModel):
    """
    Represents a single processing step executed by the
    Document Processing Engine (DPE).

    Every module in the pipeline appends one ProcessingEvent
    to the document's processing history.
    """

    step: ProcessingStage = Field(
        description="Pipeline stage that generated this event."
    )

    status: ProcessingStatus = Field(
        default=ProcessingStatus.PENDING,
        description="Current status of the processing step."
    )

    started_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        description="Timestamp when processing started."
    )

    finished_at: datetime | None = Field(
        default=None,
        description="Timestamp when processing finished."
    )

    duration_ms: int | None = Field(
        default=None,
        ge=0,
        description="Execution time in milliseconds."
    )

    version: str = Field(
        default="0.1.0",
        description="Version of the processing module."
    )

    message: str | None = Field(
        default=None,
        description="Human-readable description of the event."
    )

    warnings: list[str] = Field(
        default_factory=list,
        description="Non-fatal warnings generated during processing."
    )

    extra: dict[str, Any] = Field(
        default_factory=dict,
        description="Additional stage-specific metadata."
    )