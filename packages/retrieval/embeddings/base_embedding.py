from __future__ import annotations

from abc import ABC

import numpy as np

from retrieval.contracts.embedding_model import (
    EmbeddingModel,
)
from retrieval.domain.embedding import Embedding

from .config import EmbeddingConfig


class BaseEmbeddingModel(
    EmbeddingModel,
    ABC,
):
    """
    Base class shared by all embedding models.
    """

    def __init__(
        self,
        config: EmbeddingConfig,
    ) -> None:

        self.config = config

    def _normalize(
        self,
        vector: list[float],
    ) -> list[float]:
        """
        Normalize an embedding vector.
        """

        array = np.asarray(
            vector,
            dtype=np.float32,
        )

        norm = np.linalg.norm(array)

        if norm == 0:
            return array.tolist()

        return (array / norm).tolist()

    def _build_embedding(
        self,
        vector: list[float],
    ) -> Embedding:
        """
        Create an Embedding domain object.
        """

        if self.config.normalize_embeddings:
            vector = self._normalize(vector)

        return Embedding(
            vector=vector,
            model_name=self.model_name(),
            dimensions=len(vector),
            normalized=self.config.normalize_embeddings,
        )