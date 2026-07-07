from __future__ import annotations

from pydantic import Field

from document_processing.domain.content import KnowledgeUnit

from .base import BaseEntity


class RetrievedKnowledgeUnit(BaseEntity):
    """
    Represents a Knowledge Unit returned by the retrieval engine
    together with retrieval-specific information.
    """

    knowledge_unit: KnowledgeUnit = Field(
        description="Retrieved Knowledge Unit."
    )

    similarity_score: float = Field(
        ge=0.0,
        le=1.0,
        description="Similarity score assigned by the retriever."
    )

    distance: float | None = Field(
        default=None,
        ge=0.0,
        description="Raw vector distance when available."
    )

    rank: int = Field(
        ge=1,
        description="Ranking position in the search results."
    )

    retriever: str = Field(
        description="Retriever that produced this result."
    )

    embedding_model: str | None = Field(
        default=None,
        description="Embedding model used for retrieval."
    )

    reranked: bool = Field(
        default=False,
        description="Whether this result has been reranked."
    )

    metadata: dict[str, str] = Field(
        default_factory=dict,
        description="Additional retrieval metadata."
    )