from __future__ import annotations

from document_processing.domain.document import Document
from document_processing.domain.evaluation import (
    DPEEvaluation,
)
from document_processing.evaluators.chunk_evaluator import (
    ChunkEvaluator,
)
from document_processing.evaluators.coverage_evaluator import (
    CoverageEvaluator,
)
from document_processing.evaluators.document_evaluator import (
    DocumentEvaluator,
)
from document_processing.evaluators.performance_evaluator import (
    PerformanceEvaluator,
)
from document_processing.evaluators.structure_evaluator import (
    StructureEvaluator,
)
from document_processing.services.base_service import (
    BaseService,
)
from document_processing.splitters.chunking_config import (
    ChunkingConfig,
)


class EvaluationService(BaseService):
    """
    Produces a complete evaluation of the DPE output.
    """

    def __init__(
        self,
        config: ChunkingConfig,
    ) -> None:

        self.chunk = ChunkEvaluator(config)

        self.structure = StructureEvaluator()

        self.coverage = CoverageEvaluator()

        self.document = DocumentEvaluator()

        self.performance = PerformanceEvaluator()

    def process(
        self,
        document: Document,
    ) -> DPEEvaluation:

        return DPEEvaluation(
            performance=self.performance.evaluate(
                document.processing_history,
            ),
            document=self.document.evaluate(
                document.content,
            ),
            chunking=self.chunk.evaluate(
                document.content,
            ),
            structure=self.structure.evaluate(
                document.content,
            ),
            coverage=self.coverage.evaluate(
                document.content,
            ),
        )