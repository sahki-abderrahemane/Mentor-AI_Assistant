import pytest

from retrieval.domain.enums import (
    RankingMethod,
)

from retrieval.factories.ranker_factory import (
    RankerFactory,
)

from retrieval.rankers.similarity_ranker import (
    SimilarityRanker,
)


def test_create_similarity_ranker():

    ranker = RankerFactory.create(
        RankingMethod.SIMILARITY,
    )

    assert isinstance(
        ranker,
        SimilarityRanker,
    )


def test_invalid_ranking_method():

    with pytest.raises(
        ValueError,
    ):

        RankerFactory.create(
            RankingMethod.BM25,
        )