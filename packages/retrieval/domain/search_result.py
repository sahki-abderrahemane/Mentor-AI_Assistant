from __future__ import annotations

from pydantic import Field

from .base import BaseEntity
from .citation import Citation
from .query import Query
from .retrieval_event import RetrievalEvent
from .retrieval_metadata import RetrievalMetadata
from .retrieved_knowledge_unit import RetrievedKnowledgeUnit


class SearchResult(BaseEntity):
    """
    Final result returned by the Retrieval Engine.
    """

    query: Query = Field(
        description="Original user query."
    )

    retrieved_units: list[RetrievedKnowledgeUnit] = Field(
        default_factory=list,
        description="Retrieved Knowledge Units."
    )

    citations: list[Citation] = Field(
        default_factory=list,
        description="Generated citations."
    )

    metadata: RetrievalMetadata = Field(
        description="Retrieval metadata."
    )

    processing_history: list[RetrievalEvent] = Field(
        default_factory=list,
        description="History of retrieval events."
    )