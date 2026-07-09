from __future__ import annotations

from abc import ABC, abstractmethod

from retrieval.domain.evaluation_result import (
    EvaluationResult,
)

from retrieval.domain.query import (
    Query,
)

from retrieval.domain.retrieved_knowledge_unit import (
    RetrievedKnowledgeUnit,
)


class RetrievalEvaluator(ABC):
    """
    Contract implemented by every retrieval evaluation strategy.
    """

    @abstractmethod
    def evaluate(
        self,
        query: Query,
        retrieved_units: list[RetrievedKnowledgeUnit],
        relevant_ids: list[str],
    ) -> EvaluationResult:
        """
        Evaluate the quality of retrieval.
        """
        raise NotImplementedError

    @abstractmethod
    def name(
        self,
    ) -> str:
        """
        Return the evaluator name.
        """
        raise NotImplementedError