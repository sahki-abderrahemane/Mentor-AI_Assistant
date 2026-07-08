from __future__ import annotations

from datetime import UTC, datetime

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
    ) -> None:

        self.embedding_model = embedding_model
        self.vector_store = vector_store

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
    
    def retrieve(
        self,
        request: SearchRequest,
    ) -> SearchResult:

        started = datetime.now(UTC)

        retrieved_units, history = self._retrieve_units(
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
            candidate_count=len(retrieved_units),
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
            citations=[],
            metadata=metadata,
            processing_history=history,
        )