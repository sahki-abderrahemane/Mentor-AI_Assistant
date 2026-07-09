from __future__ import annotations

from retrieval.contracts.evaluation_metric import (
    EvaluationMetricCalculator,
)

from retrieval.domain.evaluation_metric import (
    EvaluationMetric,
)

from retrieval.domain.query import (
    Query,
)

from retrieval.domain.retrieved_knowledge_unit import (
    RetrievedKnowledgeUnit,
)


class PrecisionAtK(EvaluationMetricCalculator):
    """
    Computes Precision@K.
    """

    def name(
        self,
    ) -> str:

        return "Precision@K"

    def compute(
        self,
        query: Query,
        retrieved_units: list[RetrievedKnowledgeUnit],
        relevant_ids: list[str],
    ) -> EvaluationMetric:

        if not retrieved_units:

            value = 0.0

        else:

            hits = sum(
                str(unit.knowledge_unit.id) in relevant_ids
                for unit in retrieved_units
            )

            value = hits / len(
                retrieved_units,
            )

        return EvaluationMetric(
            name=self.name(),
            value=value,
            description="Precision at K.",
        )