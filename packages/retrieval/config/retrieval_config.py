from __future__ import annotations

from dataclasses import dataclass

from retrieval.domain.enums import (
    RankingMethod,
    RetrievalStrategy,
)


@dataclass(slots=True)
class RetrievalConfig:
    """
    Configuration for the retrieval pipeline.
    """

    strategy: RetrievalStrategy = RetrievalStrategy.DENSE

    ranking_method: RankingMethod = (
        RankingMethod.SIMILARITY
    )

    enable_citations: bool = True

    enable_metadata_filtering: bool = True

    top_k: int = 5