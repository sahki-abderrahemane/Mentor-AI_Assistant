
from __future__ import annotations

from retrieval.contracts.embedding_model import (
    EmbeddingModel,
)

from .config import EmbeddingConfig
from .sentence_transformer_embedding import (
    SentenceTransformerEmbedding,
)


class EmbeddingFactory:
    """
    Factory responsible for creating embedding models.
    """

    @staticmethod
    def create(
        config: EmbeddingConfig,
    ) -> EmbeddingModel:
        """
        Create an embedding model from the provided configuration.
        """

        return SentenceTransformerEmbedding(config)