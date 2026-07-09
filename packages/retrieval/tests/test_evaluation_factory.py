from retrieval.evaluation.config import (
    EvaluationConfig,
)

from retrieval.evaluation.evaluation_service import (
    EvaluationService,
)

from retrieval.factories.evaluation_factory import (
    EvaluationFactory,
)


def test_create_default_evaluator():

    evaluator = EvaluationFactory.create()

    assert isinstance(
        evaluator,
        EvaluationService,
    )

    assert len(
        evaluator.metrics,
    ) == 4


def test_create_custom_evaluator():

    config = EvaluationConfig(
        include_metadata=False,
    )

    evaluator = EvaluationFactory.create(
        config=config,
    )

    assert (
        evaluator.config.include_metadata
        is False
    )