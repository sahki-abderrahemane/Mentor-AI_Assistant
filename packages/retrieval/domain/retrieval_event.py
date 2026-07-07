from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from pydantic import Field

from .base import MentorModel
from .enums import (
    RetrievalStage,
    RetrievalStatus,
)


class RetrievalEvent(MentorModel):
    """
    Represents one stage executed by the Retrieval Engine.
    """

    stage: RetrievalStage = Field(
        description="Retrieval pipeline stage."
    )

    status: RetrievalStatus = Field(
        default=RetrievalStatus.PENDING,
        description="Execution status."
    )

    started_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        description="Execution start time."
    )

    finished_at: datetime | None = Field(
        default=None,
        description="Execution finish time."
    )

    duration_ms: int | None = Field(
        default=None,
        ge=0,
        description="Execution duration in milliseconds."
    )

    version: str = Field(
        default="0.1.0",
        description="Retrieval module version."
    )

    message: str | None = Field(
        default=None,
        description="Human-readable execution message."
    )

    warnings: list[str] = Field(
        default_factory=list,
        description="Non-fatal warnings."
    )

    extra: dict[str, Any] = Field(
        default_factory=dict,
        description="Additional stage metadata."
    )