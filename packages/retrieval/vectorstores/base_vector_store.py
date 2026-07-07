from __future__ import annotations

import json
from abc import ABC
from pathlib import Path

from document_processing.domain.content import (
    KnowledgeUnit,
)

from retrieval.contracts.vector_store import (
    VectorStore,
)
from retrieval.domain.embedding import (
    Embedding,
)

from .config import VectorStoreConfig


class BaseVectorStore(
    VectorStore,
    ABC,
):
    """
    Base class shared by every vector store implementation.

    Provides common functionality such as:
    - configuration management
    - metadata persistence
    - metadata loading
    - single-item insertion wrapper
    - indexed document counting
    """

    def __init__(
        self,
        config: VectorStoreConfig,
    ) -> None:

        self.config = config

        self.metadata: list[KnowledgeUnit] = []

    def add(
        self,
        knowledge_unit: KnowledgeUnit,
        embedding: Embedding,
    ) -> None:
        """
        Convenience wrapper around add_many().
        """

        self.add_many(
            [knowledge_unit],
            [embedding],
        )

    def _save_metadata(
        self,
    ) -> None:
        """
        Persist indexed Knowledge Units as JSON.
        """

        path: Path = self.config.metadata_path

        path.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        with open(
            path,
            "w",
            encoding="utf-8",
        ) as file:

            json.dump(
                [
                    knowledge_unit.model_dump(
                        mode="json",
                    )
                    for knowledge_unit in self.metadata
                ],
                file,
                indent=2,
                ensure_ascii=False,
            )

    def _load_metadata(
        self,
    ) -> None:
        """
        Load indexed Knowledge Units from JSON.
        """

        path = self.config.metadata_path

        if not path.exists():

            self.metadata = []

            return

        with open(
            path,
            "r",
            encoding="utf-8",
        ) as file:

            data = json.load(file)

        self.metadata = [
            KnowledgeUnit.model_validate(
                item,
            )
            for item in data
        ]

    def count(
        self,
    ) -> int:
        """
        Return the number of indexed Knowledge Units.
        """

        return len(
            self.metadata,
        )