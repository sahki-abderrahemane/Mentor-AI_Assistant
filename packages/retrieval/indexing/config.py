from __future__ import annotations

from pydantic import Field

from retrieval.domain.base import MentorModel


class IndexingConfig(MentorModel):
    """
    Configuration for the indexing pipeline.
    """

    batch_size: int = Field(
        default=64,
        ge=1,
        description="Number of Knowledge Units embedded per batch.",
    )

    save_after_indexing: bool = Field(
        default=True,
        description="Persist the vector store after indexing.",
    )

    overwrite_existing: bool = Field(
        default=False,
        description="Clear the existing index before indexing.",
    )