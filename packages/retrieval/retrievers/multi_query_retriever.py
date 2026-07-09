from __future__ import annotations

from datetime import UTC, datetime

from retrieval.contracts.query_expander import (
    QueryExpander,
)
from retrieval.contracts.ranker import (
    Ranker,
)
from retrieval.contracts.retriever import (
    Retriever,
)

from retrieval.domain.enums import (
    RankingMethod,
    RetrievalStage,
    RetrievalStatus,
    RetrievalStrategy,
    RetrieverType,
    VectorStoreType,
)

from retrieval.domain.query import (
    Query,
)

from retrieval.domain.retrieval_event import (
    RetrievalEvent,
)

from retrieval.domain.retrieval_metadata import (
    RetrievalMetadata,
)

from retrieval.domain.retrieved_knowledge_unit import (
    RetrievedKnowledgeUnit,
)

from retrieval.domain.search_request import (
    SearchRequest,
)

from retrieval.domain.search_result import (
    SearchResult,
)
from retrieval.contracts.citation_builder import (
    CitationBuilder,
)

class MultiQueryRetriever(Retriever):
    """
    Expands the user query into multiple semantically related
    queries and merges the retrieved results.
    """

    def __init__(
        self,
        query_expander: QueryExpander,
        retriever: Retriever,
        ranker: Ranker,
        citation_builder: CitationBuilder,
    ) -> None:

        self.query_expander = query_expander
        self.retriever = retriever
        self.ranker = ranker
        self.citation_builder = citation_builder

    def name(
        self,
    ) -> str:

        return "multi_query"

    def _deduplicate(
        self,
        retrieved_units: list[RetrievedKnowledgeUnit],
    ) -> list[RetrievedKnowledgeUnit]:
        """
        Remove duplicated Knowledge Units while keeping
        the highest similarity score.
        """

        unique_units: dict = {}

        for unit in retrieved_units:

            unit_id = unit.knowledge_unit.id

            existing = unique_units.get(
                unit_id,
            )

            if (
                existing is None
                or unit.similarity_score
                > existing.similarity_score
            ):
                unique_units[
                    unit_id
                ] = unit

        return list(
            unique_units.values(),
        )

    def retrieve(
        self,
        request: SearchRequest,
    ) -> SearchResult:

        started = datetime.now(
            UTC,
        )

        history: list[
            RetrievalEvent
        ] = []

        expanded_queries = (
            self.query_expander.expand(
                request.query,
            )
        )

        retrieved_units: list[
            RetrievedKnowledgeUnit
        ] = []

        for query in expanded_queries:

            result = self.retriever.retrieve(
                SearchRequest(
                    query=query,
                    strategy=request.strategy,
                    created_at=request.created_at,
                )
            )

            retrieved_units.extend(
                result.retrieved_units,
            )

            history.extend(
                result.processing_history,
            )

        candidate_count = len(
            retrieved_units,
        )

        retrieved_units = (
            self._deduplicate(
                retrieved_units,
            )
        )

        ranked_units = self.ranker.rank(
            request.query,
            retrieved_units,
        )

        history.append(
            RetrievalEvent(
                stage=RetrievalStage.RANKED,
                status=RetrievalStatus.SUCCESS,
                message="Multi-query ranking completed.",
            )
        )

        finished = datetime.now(
            UTC,
        )

        latency = int(
            (
                finished
                - started
            ).total_seconds()
            * 1000
        )

        history.append(
            RetrievalEvent(
                stage=RetrievalStage.COMPLETED,
                status=RetrievalStatus.SUCCESS,
                message="Multi-query retrieval completed.",
            )
        )

        metadata = RetrievalMetadata(
            strategy=RetrievalStrategy.MULTI_QUERY,
            retriever=RetrieverType.HYBRID,
            vector_store=VectorStoreType.FAISS,
            embedding_model="multiple",
            ranking_method=RankingMethod.SIMILARITY,
            candidate_count=candidate_count,
            returned_count=len(
                ranked_units,
            ),
            reranked=True,
            latency_ms=latency,
            metadata={
                "query_expander": self.query_expander.name(),
                "expanded_queries": str(
                    len(expanded_queries),
                ),
            },
        )

        return SearchResult(
            query=request.query,
            retrieved_units=ranked_units,
            citations=self.citation_builder.build_citations(request.query, ranked_units),
            metadata=metadata,
            processing_history=history,
        )