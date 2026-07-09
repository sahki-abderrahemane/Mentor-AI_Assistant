from __future__ import annotations

from datetime import UTC, datetime

from retrieval.contracts.citation_builder import CitationBuilder
from retrieval.contracts.embedding_model import (
    EmbeddingModel,
)
from retrieval.contracts.retriever import (
    Retriever,
)
from retrieval.contracts.vector_store import (
    VectorStore,
)

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

from retrieval.domain.retrieved_knowledge_unit import (
    RetrievedKnowledgeUnit,
)

from retrieval.domain.search_request import (
    SearchRequest,
)

from retrieval.domain.search_result import (
    SearchResult,
)


class DenseRetriever(Retriever):
    """
    Dense semantic retriever based on vector similarity search.
    """

    def __init__(
        self,
        embedding_model: EmbeddingModel,
        vector_store: VectorStore,
        citation_builder: CitationBuilder,
    ) -> None:

        self.embedding_model = embedding_model
        self.vector_store = vector_store
        self.citation_builder = citation_builder

    def name(
        self,
    ) -> str:

        return "dense"
    
    def _retrieve_units(
        self,
        request: SearchRequest,
    ) -> tuple[list[RetrievedKnowledgeUnit], list[RetrievalEvent]]:
        """
        Execute dense retrieval and return the retrieved Knowledge Units
        together with the retrieval history generated during the process.
        """

        history: list[RetrievalEvent] = []

        history.append(
            RetrievalEvent(
                stage=RetrievalStage.QUERY_RECEIVED,
                status=RetrievalStatus.SUCCESS,
                message="Query received.",
            )
        )

        query_embedding = self.embedding_model.embed_query(
            request.query.text,
        )

        history.append(
            RetrievalEvent(
                stage=RetrievalStage.QUERY_EMBEDDED,
                status=RetrievalStatus.SUCCESS,
                message="Query embedded.",
            )
        )

        candidates = self.vector_store.search(
            embedding=query_embedding,
            top_k=request.query.top_k,
        )

        history.append(
            RetrievalEvent(
                stage=RetrievalStage.SEARCHED,
                status=RetrievalStatus.SUCCESS,
                message="Vector search completed.",
            )
        )

        retrieved_units = [
            RetrievedKnowledgeUnit(
                knowledge_unit=result.knowledge_unit,
                similarity_score=result.similarity_score,
                distance=result.distance,
                rank=index + 1,
                retriever=self.name(),
                embedding_model=self.embedding_model.model_name(),
            )
            for index, result in enumerate(candidates)
        ]

        history.append(
            RetrievalEvent(
                stage=RetrievalStage.RANKED,
                status=RetrievalStatus.SUCCESS,
                message="Results ranked.",
            )
        )

        return retrieved_units, history
    
    def _apply_filters(
        self,
        retrieved_units: list[RetrievedKnowledgeUnit],
        request: SearchRequest,
    ) -> list[RetrievedKnowledgeUnit]:
        """
        Apply query filters to retrieved Knowledge Units.
        """

        filters = request.query.filters

        filtered = retrieved_units

        if filters.document_ids:
            filtered = [
                unit
                for unit in filtered
                if (
                    unit.knowledge_unit.document_id is not None
                    and unit.knowledge_unit.document_id
                    in filters.document_ids
                )
            ]

        if filters.categories:
            filtered = [
                unit
                for unit in filtered
                if (
                    unit.knowledge_unit.category is not None
                    and unit.knowledge_unit.category
                    in filters.categories
                )
            ]

        if filters.tags:
            filtered = [
                unit
                for unit in filtered
                if any(
                    tag in filters.tags
                    for tag in unit.knowledge_unit.tags
                )
            ]

        if filters.metadata:
            filtered = [
                unit
                for unit in filtered
                if all(
                    unit.knowledge_unit.metadata.get(key) == value
                    for key, value in filters.metadata.items()
                )
            ]

        for index, unit in enumerate(
            filtered,
            start=1,
        ):
            unit.rank = index

        return filtered
    
    def retrieve(
        self,
        request: SearchRequest,
    ) -> SearchResult:

        started = datetime.now(UTC)

        retrieved_units, history = self._retrieve_units(
            request,
            )
        candidate_count = len(retrieved_units)
        retrieved_units = self._apply_filters(
            retrieved_units,
            request,
            )

        finished = datetime.now(UTC)

        latency = int(
            (finished - started).total_seconds() * 1000
        )

        metadata = RetrievalMetadata(
            strategy=RetrievalStrategy.DENSE,
            retriever=RetrieverType.VECTOR,
            vector_store=VectorStoreType.FAISS,
            embedding_model=self.embedding_model.model_name(),
            ranking_method=RankingMethod.SIMILARITY,
            candidate_count=candidate_count,
            returned_count=len(retrieved_units),
            latency_ms=latency,
        )

        history.append(
            RetrievalEvent(
                stage=RetrievalStage.COMPLETED,
                status=RetrievalStatus.SUCCESS,
                message="Dense retrieval completed.",
            )
        )

        return SearchResult(
            query=request.query,
            retrieved_units=retrieved_units,
            citations=self.citation_builder.build_citations(
                request.query,
                retrieved_units,
            ),
            metadata=metadata,
            processing_history=history,
        )