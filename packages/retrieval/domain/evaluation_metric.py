from __future__ import annotations

from pydantic import Field

from .base import MentorModel


class EvaluationMetric(MentorModel):
    """
    Represents one retrieval evaluation metric.
    """

    name: str = Field(
        description="Metric name."
    )

    value: float = Field(
        ge=0.0,
        description="Metric value."
    )

    description: str | None = Field(
        default=None,
        description="Optional metric description."
    )