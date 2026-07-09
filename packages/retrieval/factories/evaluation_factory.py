from __future__ import annotations

from retrieval.contracts.evaluation_metric import (
    EvaluationMetricCalculator,
)

from retrieval.evaluation.config import (
    EvaluationConfig,
)

from retrieval.evaluation.evaluation_service import (
    EvaluationService,
)

from retrieval.evaluation.metrics.hit_rate import (
    HitRate,
)

from retrieval.evaluation.metrics.mean_reciprocal_rank import (
    MeanReciprocalRank,
)

from retrieval.evaluation.metrics.precision_at_k import (
    PrecisionAtK,
)

from retrieval.evaluation.metrics.recall_at_k import (
    RecallAtK,
)


class EvaluationFactory:
    """
    Factory responsible for creating retrieval evaluators.
    """

    @staticmethod
    def create(
        config: EvaluationConfig | None = None,
        metrics: list[EvaluationMetricCalculator] | None = None,
    ) -> EvaluationService:

        if config is None:

            config = EvaluationConfig()

        if metrics is None:

            metrics = [
                RecallAtK(),
                PrecisionAtK(),
                HitRate(),
                MeanReciprocalRank(),
            ]

        return EvaluationService(
            metrics=metrics,
            config=config,
        )