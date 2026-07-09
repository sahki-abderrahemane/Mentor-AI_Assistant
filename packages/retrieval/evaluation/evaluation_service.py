from __future__ import annotations

from retrieval.contracts.evaluation_metric import (
    EvaluationMetricCalculator,
)

from retrieval.contracts.retrieval_evaluator import (
    RetrievalEvaluator,
)

from retrieval.domain.evaluation_result import (
    EvaluationResult,
)

from retrieval.domain.query import (
    Query,
)

from retrieval.domain.retrieved_knowledge_unit import (
    RetrievedKnowledgeUnit,
)

from retrieval.evaluation.config import (
    EvaluationConfig,
)


class EvaluationService(RetrievalEvaluator):
    """
    Default retrieval evaluator.
    """

    def __init__(
        self,
        metrics: list[EvaluationMetricCalculator],
        config: EvaluationConfig,
    ) -> None:

        self.metrics = metrics
        self.config = config

    def name(
        self,
    ) -> str:

        return "default"

    def evaluate(
        self,
        query: Query,
        retrieved_units: list[RetrievedKnowledgeUnit],
        relevant_ids: list[str],
    ) -> EvaluationResult:

        computed_metrics = [
            metric.compute(
                query=query,
                retrieved_units=retrieved_units,
                relevant_ids=relevant_ids,
            )
            for metric in self.metrics
        ]

        metadata: dict[str, str] = {}

        if self.config.include_metadata:

            metadata["evaluator"] = self.name()

            metadata["metric_count"] = str(
                len(computed_metrics),
            )

        return EvaluationResult(
            query=query,
            metrics=computed_metrics,
            relevant_count=len(
                relevant_ids,
            ),
            retrieved_count=len(
                retrieved_units,
            ),
            metadata=metadata,
        )