from __future__ import annotations

from abc import ABC, abstractmethod

from retrieval.domain.query import Query
from retrieval.domain.retrieved_knowledge_unit import (
    RetrievedKnowledgeUnit,
)


class Ranker(ABC):
    """
    Contract implemented by every ranking algorithm.
    """

    @abstractmethod
    def rank(
        self,
        query: Query,
        retrieved_units: list[RetrievedKnowledgeUnit],
    ) -> list[RetrievedKnowledgeUnit]:
        """
        Rank retrieved Knowledge Units.
        """
        raise NotImplementedError

    @abstractmethod
    def name(
        self,
    ) -> str:
        """
        Return the ranking algorithm name.
        """
        raise NotImplementedError