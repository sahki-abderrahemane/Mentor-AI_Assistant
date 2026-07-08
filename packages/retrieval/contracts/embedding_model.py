from __future__ import annotations

from abc import ABC, abstractmethod

from retrieval.domain.embedding import Embedding


class EmbeddingModel(ABC):
    """
    Contract implemented by every embedding model.
    """

    @abstractmethod
    def embed_query(
        self,
        text: str,
    ) -> Embedding:
        """
        Generate an embedding for a search query.
        """
        raise NotImplementedError

    @abstractmethod
    def embed_document(
        self,
        text: str,
    ) -> Embedding:
        """
        Generate an embedding for a Knowledge Unit.
        """
        raise NotImplementedError

    @abstractmethod
    def embed_documents(
        self,
        texts: list[str],
    ) -> list[Embedding]:
        """
        Generate embeddings for a list of texts.
        """
        raise NotImplementedError

    @abstractmethod
    def embedding_dimension(
        self,
    ) -> int:
        """
        Return embedding dimensionality.
        """
        raise NotImplementedError

    @abstractmethod
    def model_name(
        self,
    ) -> str:
        """
        Return model identifier.
        """
        raise NotImplementedError