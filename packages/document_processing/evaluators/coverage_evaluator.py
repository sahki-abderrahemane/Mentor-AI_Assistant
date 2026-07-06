from __future__ import annotations

from document_processing.domain.content import DocumentContent
from document_processing.domain.evaluation import CoverageEvaluation


class CoverageEvaluator:
    """
    Measures how much text survives the processing pipeline.
    """

    def evaluate(
        self,
        content: DocumentContent,
    ) -> CoverageEvaluation:

        raw_words = len(
            (content.cleaned_text or "").split()
        )

        ku_words = sum(
            ku.word_count
            for ku in content.knowledge_units
        )

        coverage = (
            (ku_words / raw_words) * 100
            if raw_words
            else 0
        )

        return CoverageEvaluation(
            raw_word_count=raw_words,
            knowledge_unit_word_count=ku_words,
            coverage_percentage=coverage,
        )