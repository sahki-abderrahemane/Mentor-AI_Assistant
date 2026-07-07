from __future__ import annotations

from pydantic import Field

from .base import MentorModel
from .enums import (
    RankingMethod,
    RetrievalStrategy,
    RetrieverType,
    VectorStoreType,
)


class RetrievalMetadata(MentorModel):
    """
    Metadata describing how a search was performed.
    """

    strategy: RetrievalStrategy = Field(
        description="Retrieval strategy."
    )

    retriever: RetrieverType = Field(
        description="Retriever implementation."
    )

    vector_store: VectorStoreType = Field(
        description="Vector store implementation."
    )

    embedding_model: str = Field(
        description="Embedding model name."
    )

    ranking_method: RankingMethod = Field(
        description="Ranking method."
    )

    candidate_count: int = Field(
        ge=0,
        description="Number of retrieved candidates."
    )

    returned_count: int = Field(
        ge=0,
        description="Number of returned results."
    )

    reranked: bool = Field(
        default=False,
        description="Whether reranking was applied."
    )

    latency_ms: int = Field(
        ge=0,
        description="Search latency in milliseconds."
    )

    metadata: dict[str, str] = Field(
        default_factory=dict,
        description="Additional retrieval metadata."
    )