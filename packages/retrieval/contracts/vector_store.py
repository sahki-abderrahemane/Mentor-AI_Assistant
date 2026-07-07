from __future__ import annotations

from abc import ABC, abstractmethod

from document_processing.domain.content import KnowledgeUnit

from retrieval.domain.embedding import Embedding
from retrieval.domain.retrieved_knowledge_unit import (
    RetrievedKnowledgeUnit,
)


class VectorStore(ABC):
    """
    Contract implemented by every vector database.
    """

    @abstractmethod
    def add(
        self,
        knowledge_unit: KnowledgeUnit,
        embedding: Embedding,
    ) -> None:
        """
        Index a single Knowledge Unit.
        """
        raise NotImplementedError

    @abstractmethod
    def add_many(
        self,
        knowledge_units: list[KnowledgeUnit],
        embeddings: list[Embedding],
    ) -> None:
        """
        Index multiple Knowledge Units.
        """
        raise NotImplementedError

    @abstractmethod
    def search(
        self,
        embedding: Embedding,
        top_k: int,
    ) -> list[RetrievedKnowledgeUnit]:
        """
        Perform a similarity search.
        """
        raise NotImplementedError

    @abstractmethod
    def clear(
        self,
    ) -> None:
        """
        Remove every indexed Knowledge Unit.
        """
        raise NotImplementedError

    @abstractmethod
    def count(
        self,
    ) -> int:
        """
        Return the number of indexed Knowledge Units.
        """
        raise NotImplementedError

    @abstractmethod
    def save(
        self,
        path: str,
    ) -> None:
        """
        Persist the vector index.
        """
        raise NotImplementedError

    @abstractmethod
    def load(
        self,
        path: str,
    ) -> None:
        """
        Load a persisted vector index.
        """
        raise NotImplementedError