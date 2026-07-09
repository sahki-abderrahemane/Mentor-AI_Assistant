from __future__ import annotations

from retrieval.domain.search_request import (
    SearchRequest,
)

from retrieval.domain.search_result import (
    SearchResult,
)

from retrieval.contracts.retriever import (
    Retriever,
)

from retrieval.evaluation.evaluation_service import (
    EvaluationService,
)


class RetrievalPipeline:
    """
    High-level orchestration of the retrieval pipeline.

    The pipeline delegates retrieval to a Retriever and,
    optionally, evaluates the retrieved results.
    """

    def __init__(
        self,
        retriever: Retriever,
        evaluator: EvaluationService | None = None,
    ) -> None:

        self.retriever = retriever
        self.evaluator = evaluator

    def retrieve(
        self,
        request: SearchRequest,
        relevant_ids: list[str] | None = None,
    ) -> SearchResult:
        """
        Execute the retrieval pipeline.
        """

        result = self.retriever.retrieve(
            request,
        )

        if (
            self.evaluator is not None
            and relevant_ids is not None
        ):

            result.evaluation = self.evaluator.evaluate(
                query=request.query,
                retrieved_units=result.retrieved_units,
                relevant_ids=relevant_ids,
            )

        return result