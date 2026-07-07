"""
packages/retrieval/indexing/indexing_service.py
"""

from __future__ import annotations

from document_processing.domain.document import Document
from document_processing.domain.content import KnowledgeUnit

from retrieval.contracts.embedding_model import EmbeddingModel
from retrieval.contracts.vector_store import VectorStore

from .config import IndexingConfig


class IndexingService:
    """
    Orchestrates the indexing pipeline.

    Responsibilities
    ----------------
    - Extract Knowledge Units from a processed document.
    - Generate embeddings in batches.
    - Insert embeddings into the vector store.
    - Persist the vector store if configured.
    """

    def __init__(
        self,
        embedding_model: EmbeddingModel,
        vector_store: VectorStore,
        config: IndexingConfig,
    ) -> None:

        self.embedding_model = embedding_model

        self.vector_store = vector_store

        self.config = config

    def index_document(
        self,
        document: Document,
    ) -> None:
        """
        Index every Knowledge Unit contained in a document.
        """

        if self.config.overwrite_existing:

            self.vector_store.clear()

        knowledge_units = (
            document.content.knowledge_units
        )

        if not knowledge_units:

            return

        batch_size = self.config.batch_size

        for start in range(
            0,
            len(knowledge_units),
            batch_size,
        ):

            batch = knowledge_units[
                start : start + batch_size
            ]

            self._index_batch(
                batch,
            )

        if self.config.save_after_indexing:

            self.vector_store.save()

    def _index_batch(
    self,
    knowledge_units: list[KnowledgeUnit],
) -> None:
        """
        Index one batch of Knowledge Units.
        """

        texts = [
        knowledge_unit.text
        for knowledge_unit in knowledge_units
        ]

        embeddings = self.embedding_model.embed_documents(
            texts,
        )

        self.vector_store.add_many(
            knowledge_units,
            embeddings,
            )