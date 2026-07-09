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


class MeanReciprocalRank(EvaluationMetricCalculator):
    """
    Computes Mean Reciprocal Rank (MRR).
    """

    def name(
        self,
    ) -> str:

        return "MRR"

    def compute(
        self,
        query: Query,
        retrieved_units: list[RetrievedKnowledgeUnit],
        relevant_ids: list[str],
    ) -> EvaluationMetric:

        value = 0.0

        for index, unit in enumerate(
            retrieved_units,
            start=1,
        ):

            if str(unit.knowledge_unit.id) in relevant_ids:

                value = 1.0 / index
                break

        return EvaluationMetric(
            name=self.name(),
            value=value,
            description="Mean Reciprocal Rank.",
        )