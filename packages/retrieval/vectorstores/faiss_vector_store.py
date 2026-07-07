from __future__ import annotations

from pathlib import Path

import faiss
import numpy as np

from document_processing.domain.content import (
    KnowledgeUnit,
)

from retrieval.domain.embedding import Embedding
from retrieval.domain.retrieved_knowledge_unit import (
    RetrievedKnowledgeUnit,
)

from .base_vector_store import BaseVectorStore
from .config import VectorStoreConfig


class FaissVectorStore(BaseVectorStore):
    """
    FAISS implementation of the VectorStore contract.
    """

    def __init__(
        self,
        config: VectorStoreConfig,
    ) -> None:

        super().__init__(config)

        self.index: faiss.Index | None = None

        self._load_metadata()

    def _create_index(
        self,
        dimension: int,
    ) -> None:
        """
        Create the FAISS index.
        """

        metric = self.config.metric.lower()

        if metric == "cosine":

            self.index = faiss.IndexFlatIP(
                dimension,
            )

        elif metric == "l2":

            self.index = faiss.IndexFlatL2(
                dimension,
            )

        else:

            raise ValueError(
                f"Unsupported metric: {metric}"
            )

    def add_many(
        self,
        knowledge_units: list[KnowledgeUnit],
        embeddings: list[Embedding],
    ) -> None:
        """
        Index multiple Knowledge Units.
        """

        if not knowledge_units:
            return

        if len(knowledge_units) != len(embeddings):

            raise ValueError(
                "Knowledge Units and embeddings must have identical lengths."
            )

        dimension = embeddings[0].dimensions

        if self.index is None:

            self._create_index(
                dimension,
            )

        vectors = np.asarray(
            [
                embedding.vector
                for embedding in embeddings
            ],
            dtype=np.float32,
        )

        if self.config.normalize_embeddings:

            faiss.normalize_L2(
                vectors,
            )

        self.index.add(
            vectors,
        )

        self.metadata.extend(
            knowledge_units,
        )

    def search(
        self,
        embedding: Embedding,
        top_k: int,
    ) -> list[RetrievedKnowledgeUnit]:
        """
        Search the vector index.
        """

        if self.index is None:

            return []

        query = np.asarray(
            [embedding.vector],
            dtype=np.float32,
        )

        if self.config.normalize_embeddings:

            faiss.normalize_L2(
                query,
            )

        scores, indices = self.index.search(
            query,
            top_k,
        )

        results: list[
            RetrievedKnowledgeUnit
        ] = []

        for rank, (
            score,
            index,
        ) in enumerate(
            zip(
                scores[0],
                indices[0],
            ),
            start=1,
        ):

            if index < 0:
                continue

            knowledge_unit = self.metadata[
                index
            ]

            results.append(
                RetrievedKnowledgeUnit(
                    knowledge_unit=knowledge_unit,
                    similarity_score=float(score),
                    distance=None,
                    rank=rank,
                    retriever="faiss",
                    embedding_model=embedding.model_name,
                )
            )

        return results

    def save(
        self,
        path: str | None = None,
    ) -> None:
        """
        Persist the FAISS index and metadata.
        """

        if self.index is None:
            return

        index_path = (
            Path(path)
            if path is not None
            else self.config.index_path
        )

        index_path.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        faiss.write_index(
            self.index,
            str(index_path),
        )

        self._save_metadata()

    def load(
        self,
        path: str | None = None,
    ) -> None:
        """
        Load a persisted FAISS index.
        """

        index_path = (
            Path(path)
            if path is not None
            else self.config.index_path
        )

        if not index_path.exists():
            return

        self.index = faiss.read_index(
            str(index_path),
        )

        self._load_metadata()

    def clear(
        self,
    ) -> None:
        """
        Remove every indexed Knowledge Unit.
        """

        self.index = None

        self.metadata.clear()