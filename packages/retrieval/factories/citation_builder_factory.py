from __future__ import annotations

from retrieval.citations.default_citation_builder import (
    DefaultCitationBuilder,
)

from retrieval.contracts.citation_builder import (
    CitationBuilder,
)


class CitationBuilderFactory:
    """
    Factory responsible for creating citation builders.
    """

    @staticmethod
    def create() -> CitationBuilder:

        return DefaultCitationBuilder()
    