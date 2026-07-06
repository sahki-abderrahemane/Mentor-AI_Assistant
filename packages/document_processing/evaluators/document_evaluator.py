from __future__ import annotations

from document_processing.domain.content import DocumentContent
from document_processing.domain.evaluation import (
    DocumentEvaluation,
)


class DocumentEvaluator:
    """
    Computes general statistics about a processed document.
    """

    def evaluate(
        self,
        content: DocumentContent,
    ) -> DocumentEvaluation:

        page_count = len(content.pages)

        word_count = len(
            (content.cleaned_text or "").split()
        )

        return DocumentEvaluation(
            page_count=page_count,
            section_count=len(content.sections),
            knowledge_unit_count=len(
                content.knowledge_units
            ),
            word_count=word_count,
        )