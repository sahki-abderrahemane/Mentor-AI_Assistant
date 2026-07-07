from __future__ import annotations

from abc import ABC, abstractmethod

from retrieval.domain.query import Query


class QueryExpander(ABC):
    """
    Contract implemented by every query expansion strategy.
    """

    @abstractmethod
    def expand(
        self,
        query: Query,
    ) -> list[Query]:
        """
        Expand a query into one or more semantically
        related queries.
        """
        raise NotImplementedError

    @abstractmethod
    def name(
        self,
    ) -> str:
        """
        Return the query expansion strategy name.
        """
        raise NotImplementedError