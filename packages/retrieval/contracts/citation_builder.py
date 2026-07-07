from __future__ import annotations

from abc import ABC, abstractmethod

from retrieval.domain.citation import Citation
from retrieval.domain.query import Query
from retrieval.domain.retrieved_knowledge_unit import (
    RetrievedKnowledgeUnit,
)


class CitationBuilder(ABC):
    """
    Contract implemented by every citation builder.
    """

    @abstractmethod
    def build_citations(
        self,
        query: Query,
        retrieved_units: list[RetrievedKnowledgeUnit],
    ) -> list[Citation]:
        """
        Generate citations for retrieved Knowledge Units.
        """
        raise NotImplementedError

    @abstractmethod
    def name(
        self,
    ) -> str:
        """
        Return the citation builder name.
        """
        raise NotImplementedError