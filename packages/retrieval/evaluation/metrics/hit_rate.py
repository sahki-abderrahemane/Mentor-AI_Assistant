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


class HitRate(EvaluationMetricCalculator):
    """
    Computes Hit Rate.
    """

    def name(
        self,
    ) -> str:

        return "HitRate"

    def compute(
        self,
        query: Query,
        retrieved_units: list[RetrievedKnowledgeUnit],
        relevant_ids: list[str],
    ) -> EvaluationMetric:

        hit = any(
            str(unit.knowledge_unit.id) in relevant_ids
            for unit in retrieved_units
        )

        return EvaluationMetric(
            name=self.name(),
            value=1.0 if hit else 0.0,
            description="Hit Rate.",
        )