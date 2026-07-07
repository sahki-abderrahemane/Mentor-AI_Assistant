from __future__ import annotations

from abc import ABC, abstractmethod

from retrieval.domain.search_request import (
    SearchRequest,
)
from retrieval.domain.search_result import (
    SearchResult,
)


class Retriever(ABC):
    """
    Contract implemented by every retrieval strategy.
    """

    @abstractmethod
    def retrieve(
        self,
        request: SearchRequest,
    ) -> SearchResult:
        """
        Execute a retrieval request.
        """
        raise NotImplementedError

    @abstractmethod
    def name(
        self,
    ) -> str:
        """
        Return the retriever name.
        """
        raise NotImplementedError