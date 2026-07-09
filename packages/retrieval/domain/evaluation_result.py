from __future__ import annotations

from datetime import UTC, datetime

from pydantic import Field

from .base import MentorModel
from .evaluation_metric import EvaluationMetric
from .query import Query


class EvaluationResult(MentorModel):
    """
    Result produced by a retrieval evaluation.
    """

    query: Query = Field(
        description="Evaluated query."
    )

    metrics: list[EvaluationMetric] = Field(
        default_factory=list,
        description="Computed evaluation metrics."
    )

    relevant_count: int = Field(
        ge=0,
        description="Number of relevant Knowledge Units."
    )

    retrieved_count: int = Field(
        ge=0,
        description="Number of retrieved Knowledge Units."
    )

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        description="Evaluation timestamp."
    )

    metadata: dict[str, str] = Field(
        default_factory=dict,
        description="Additional evaluation metadata."
    )