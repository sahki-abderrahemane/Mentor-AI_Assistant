from __future__ import annotations

from datetime import UTC, datetime

from retrieval.contracts.ranker import Ranker
from retrieval.contracts.retriever import Retriever

from retrieval.domain.enums import (
    RankingMethod,
    RetrievalStage,
    RetrievalStatus,
    RetrievalStrategy,
    RetrieverType,
    VectorStoreType,
)

from retrieval.domain.retrieval_event import (
    RetrievalEvent,
)

from retrieval.domain.retrieval_metadata import (
    RetrievalMetadata,
)

from retrieval.domain.search_request import (
    SearchRequest,
)

from retrieval.domain.search_result import (
    SearchResult,
)


class HybridRetriever(Retriever):
    """
    Orchestrates multiple retrievers and produces a single ranked result.
    """

    def __init__(
        self,
        retrievers: list[Retriever],
        ranker: Ranker,
    ) -> None:

        self.retrievers = retrievers
        self.ranker = ranker

    def name(
        self,
    ) -> str:

        return "hybrid"

    def retrieve(
        self,
        request: SearchRequest,
    ) -> SearchResult:

        started = datetime.now(UTC)

        retrieved_units = []
        history: list[RetrievalEvent] = []

        for retriever in self.retrievers:

            result = retriever.retrieve(
                request,
            )

            retrieved_units.extend(
                result.retrieved_units,
            )

            history.extend(
                result.processing_history,
            )

        ranked_units = self.ranker.rank(
            request.query,
            retrieved_units,
        )

        finished = datetime.now(UTC)

        latency = int(
            (
                finished - started
            ).total_seconds()
            * 1000
        )

        history.append(
            RetrievalEvent(
                stage=RetrievalStage.RANKED,
                status=RetrievalStatus.SUCCESS,
                message="Hybrid ranking completed.",
            )
        )

        history.append(
            RetrievalEvent(
                stage=RetrievalStage.COMPLETED,
                status=RetrievalStatus.SUCCESS,
                message="Hybrid retrieval completed.",
            )
        )

        metadata = RetrievalMetadata(
            strategy=RetrievalStrategy.HYBRID,
            retriever=RetrieverType.HYBRID,
            vector_store=VectorStoreType.FAISS,
            embedding_model="multiple",
            ranking_method=RankingMethod.SIMILARITY,
            candidate_count=len(retrieved_units),
            returned_count=len(ranked_units),
            reranked=True,
            latency_ms=latency,
        )

        return SearchResult(
            query=request.query,
            retrieved_units=ranked_units,
            citations=[],
            metadata=metadata,
            processing_history=history,
        )