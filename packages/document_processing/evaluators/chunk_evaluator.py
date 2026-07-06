from __future__ import annotations

from statistics import mean

from document_processing.domain.content import DocumentContent
from document_processing.domain.evaluation import ChunkEvaluation
from document_processing.splitters.chunking_config import ChunkingConfig


class ChunkEvaluator:
    """
    Evaluates the quality of generated Knowledge Units.
    """

    def __init__(
        self,
        config: ChunkingConfig,
    ) -> None:

        self.config = config

    def evaluate(
        self,
        content: DocumentContent,
    ) -> ChunkEvaluation:

        knowledge_units = content.knowledge_units

        if not knowledge_units:
            return ChunkEvaluation()

        sizes = [
            ku.word_count
            for ku in knowledge_units
        ]

        return ChunkEvaluation(
            smallest_chunk=min(sizes),
            largest_chunk=max(sizes),
            average_chunk_size=mean(sizes),
            chunks_below_minimum=sum(
                size < self.config.min_words
                for size in sizes
            ),
            chunks_above_maximum=sum(
                size > self.config.max_words
                for size in sizes
            ),
        )