from __future__ import annotations

from document_processing.domain.content import (
    KnowledgeUnit,
    Section,
)


class KnowledgeUnitFactory:
    """
    Builds Knowledge Units from text chunks.
    """

    def create(
        self,
        section: Section,
        chunks: list[str],
    ) -> list[KnowledgeUnit]:

        knowledge_units: list[KnowledgeUnit] = []

        for chunk in chunks:

            knowledge_units.append(
                KnowledgeUnit(
                    text=chunk,
                    section=section,
                    subsection=None,
                    page_start=section.page_start,
                    page_end=section.page_end,
                    word_count=len(chunk.split()),
                    token_count=None,
                    metadata={},
                )
            )

        return knowledge_units