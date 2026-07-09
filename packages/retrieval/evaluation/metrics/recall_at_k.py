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


class RecallAtK(EvaluationMetricCalculator):
    """
    Computes Recall@K.
    """

    def name(
        self,
    ) -> str:

        return "Recall@K"

    def compute(
        self,
        query: Query,
        retrieved_units: list[RetrievedKnowledgeUnit],
        relevant_ids: list[str],
    ) -> EvaluationMetric:

        if not relevant_ids:

            value = 0.0

        else:

            retrieved_ids = {
                str(
                    unit.knowledge_unit.id,
                )
                for unit in retrieved_units
            }

            hits = sum(
                relevant_id in retrieved_ids
                for relevant_id in relevant_ids
            )

            value = hits / len(
                relevant_ids,
            )

        return EvaluationMetric(
            name=self.name(),
            value=value,
            description="Recall at K.",
        )