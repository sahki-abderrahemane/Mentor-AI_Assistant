from __future__ import annotations

from retrieval.contracts.citation_builder import (
    CitationBuilder,
)

from retrieval.contracts.embedding_model import (
    EmbeddingModel,
)

from retrieval.contracts.ranker import (
    Ranker,
)

from retrieval.contracts.retriever import (
    Retriever,
)

from retrieval.contracts.vector_store import (
    VectorStore,
)

from retrieval.domain.enums import (
    RetrievalStrategy,
)

from retrieval.retrievers.dense_retriever import (
    DenseRetriever,
)

from retrieval.retrievers.hybrid_retriever import (
    HybridRetriever,
)


class RetrieverFactory:
    """
    Factory responsible for creating retrievers.
    """

    @staticmethod
    def create(
        strategy: RetrievalStrategy,
        embedding_model: EmbeddingModel,
        vector_store: VectorStore,
        citation_builder: CitationBuilder,
        ranker: Ranker | None = None,
        retrievers: list[Retriever] | None = None,
    ) -> Retriever:

        match strategy:

            case RetrievalStrategy.DENSE:

                return DenseRetriever(
                    embedding_model=embedding_model,
                    vector_store=vector_store,
                    citation_builder=citation_builder,
                )

            case RetrievalStrategy.HYBRID:

                if (
                    ranker is None
                    or retrievers is None
                ):
                    raise ValueError(
                        "HybridRetriever requires "
                        "retrievers and ranker."
                    )

                return HybridRetriever(
                    retrievers=retrievers,
                    ranker=ranker,
                    citation_builder=citation_builder,
                )

            case _:

                raise ValueError(
                    f"Unsupported retrieval strategy: "
                    f"{strategy}"
                )