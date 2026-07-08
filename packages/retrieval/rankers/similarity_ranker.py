from __future__ import annotations

from retrieval.contracts.ranker import Ranker
from retrieval.domain.query import Query
from retrieval.domain.retrieved_knowledge_unit import (
    RetrievedKnowledgeUnit,
)


class SimilarityRanker(Ranker):
    """
    Default ranking algorithm based on semantic similarity.

    Retrieved Knowledge Units are sorted in descending order of
    similarity score and their rank field is updated to reflect
    the final ordering.
    """

    def name(
        self,
    ) -> str:
        return "similarity"

    def rank(
        self,
        query: Query,
        retrieved_units: list[RetrievedKnowledgeUnit],
    ) -> list[RetrievedKnowledgeUnit]:

        ranked_units = sorted(
            retrieved_units,
            key=lambda unit: unit.similarity_score,
            reverse=True,
        )

        for index, unit in enumerate(
            ranked_units,
            start=1,
        ):
            unit.rank = index

        return ranked_units