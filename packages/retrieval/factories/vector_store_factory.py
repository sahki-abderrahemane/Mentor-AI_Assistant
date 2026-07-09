from __future__ import annotations

from retrieval.contracts.vector_store import (
    VectorStore,
)

from retrieval.domain.enums import (
    VectorStoreType,
)

from retrieval.vectorstores.config import (
    VectorStoreConfig,
)

from retrieval.vectorstores.faiss_vector_store import (
    FaissVectorStore,
)


class VectorStoreFactory:
    """
    Factory responsible for creating vector stores.
    """

    @staticmethod
    def create(
        store_type: VectorStoreType,
        config: VectorStoreConfig,
    ) -> VectorStore:

        match store_type:

            case VectorStoreType.FAISS:

                return FaissVectorStore(
                    config=config,
                )

            case _:

                raise ValueError(
                    f"Unsupported vector store: {store_type}"
                )