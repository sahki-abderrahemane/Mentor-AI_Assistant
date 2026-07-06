from __future__ import annotations

from document_processing.domain.content import DocumentContent
from document_processing.domain.evaluation import StructureEvaluation


class StructureEvaluator:
    """
    Evaluates the detected document structure.
    """

    def evaluate(
        self,
        content: DocumentContent,
    ) -> StructureEvaluation:

        sections = content.sections

        return StructureEvaluation(
            heading_count=len(sections),
            section_count=len(sections),
            empty_sections=sum(
                not section.text.strip()
                for section in sections
            ),
        )