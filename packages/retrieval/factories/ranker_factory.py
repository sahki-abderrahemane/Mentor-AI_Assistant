from __future__ import annotations

from retrieval.contracts.ranker import (
    Ranker,
)

from retrieval.domain.enums import (
    RankingMethod,
)

from retrieval.rankers.similarity_ranker import (
    SimilarityRanker,
)


class RankerFactory:
    """
    Factory responsible for creating rankers.
    """

    @staticmethod
    def create(
        method: RankingMethod,
    ) -> Ranker:

        match method:

            case RankingMethod.SIMILARITY:

                return SimilarityRanker()

            case _:

                raise ValueError(
                    f"Unsupported ranking method: {method}"
                )