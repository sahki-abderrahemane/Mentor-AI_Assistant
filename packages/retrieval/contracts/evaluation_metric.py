from __future__ import annotations

from abc import ABC, abstractmethod

from retrieval.domain.evaluation_metric import (
    EvaluationMetric,
)

from retrieval.domain.query import (
    Query,
)

from retrieval.domain.retrieved_knowledge_unit import (
    RetrievedKnowledgeUnit,
)


class EvaluationMetricCalculator(ABC):
    """
    Contract implemented by every retrieval evaluation metric.
    """

    @abstractmethod
    def compute(
        self,
        query: Query,
        retrieved_units: list[RetrievedKnowledgeUnit],
        relevant_ids: list[str],
    ) -> EvaluationMetric:
        """
        Compute one evaluation metric.
        """
        raise NotImplementedError

    @abstractmethod
    def name(
        self,
    ) -> str:
        """
        Return the metric name.
        """
        raise NotImplementedError