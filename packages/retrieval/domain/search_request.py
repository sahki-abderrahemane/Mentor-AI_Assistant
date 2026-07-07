from __future__ import annotations

from datetime import UTC, datetime

from pydantic import Field

from .base import MentorModel
from .enums import RetrievalStrategy
from .query import Query


class SearchRequest(MentorModel):
    """
    Represents a retrieval request before any embedding
    or search has been executed.
    """

    query: Query = Field(
        description="User query."
    )

    strategy: RetrievalStrategy = Field(
        default=RetrievalStrategy.DENSE,
        description="Retrieval strategy."
    )

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        description="Request creation time."
    )