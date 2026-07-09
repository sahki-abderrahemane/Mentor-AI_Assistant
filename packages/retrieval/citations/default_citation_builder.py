from __future__ import annotations

from retrieval.contracts.citation_builder import (
    CitationBuilder,
)

from retrieval.domain.citation import (
    Citation,
)

from retrieval.domain.query import (
    Query,
)

from retrieval.domain.retrieved_knowledge_unit import (
    RetrievedKnowledgeUnit,
)


class DefaultCitationBuilder(CitationBuilder):
    """
    Default citation builder used by MentorAI.
    """

    def name(
        self,
    ) -> str:

        return "default"

    def build_citations(
        self,
        query: Query,
        retrieved_units: list[RetrievedKnowledgeUnit],
    ) -> list[Citation]:

        citations: list[Citation] = []

        for unit in retrieved_units:

            knowledge_unit = unit.knowledge_unit

            snippet = knowledge_unit.text

            if len(snippet) > 250:
                snippet = snippet[:247] + "..."

            citations.append(
                Citation(
                    retrieved_unit=unit,
                    title=knowledge_unit.metadata.get(
                        "document_title",
                    ),
                    section=knowledge_unit.section.title,
                    subsection=knowledge_unit.subsection,
                    page_start=knowledge_unit.page_start,
                    page_end=knowledge_unit.page_end,
                    snippet=snippet,
                    confidence=unit.similarity_score,
                    metadata={
                        "builder": self.name(),
                    },
                )
            )

        return citations