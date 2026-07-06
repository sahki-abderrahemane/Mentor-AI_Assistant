from __future__ import annotations

from document_processing.domain.evaluation import (
    PerformanceEvaluation,
)
from document_processing.domain.processing import (
    ProcessingEvent,
)


class PerformanceEvaluator:
    """
    Computes execution performance metrics.
    """

    def evaluate(
        self,
        history: list[ProcessingEvent],
    ) -> PerformanceEvaluation:

        total = sum(
            event.duration_ms or 0
            for event in history
        )

        return PerformanceEvaluation(
            processing_time_ms=total,
        )