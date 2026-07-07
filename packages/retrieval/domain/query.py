from __future__ import annotations

from datetime import UTC, datetime

from pydantic import Field

from .base import MentorModel


class SearchFilter(MentorModel):
    """
    Optional filters applied during retrieval.
    """

    document_ids: list[str] = Field(
        default_factory=list,
        description="Restrict search to specific document IDs.",
    )

    categories: list[str] = Field(
        default_factory=list,
        description="Restrict search to document categories.",
    )

    tags: list[str] = Field(
        default_factory=list,
        description="Restrict search to tagged knowledge units.",
    )

    metadata: dict[str, str] = Field(
        default_factory=dict,
        description="Additional metadata filters.",
    )


class Query(MentorModel):
    """
    Represents a user query submitted to the retrieval engine.
    """

    text: str = Field(
        min_length=1,
        description="Raw user query.",
    )

    language: str | None = Field(
        default=None,
        description="Detected or user-specified language.",
    )

    top_k: int = Field(
        default=5,
        ge=1,
        description="Maximum number of results requested.",
    )

    filters: SearchFilter = Field(
        default_factory=SearchFilter,
        description="Optional retrieval filters.",
    )

    metadata: dict[str, str] = Field(
        default_factory=dict,
        description="Additional query metadata.",
    )

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        description="Query creation timestamp.",
    )