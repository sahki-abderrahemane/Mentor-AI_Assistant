from retrieval.citations.default_citation_builder import (
    DefaultCitationBuilder,
)

from retrieval.factories.citation_builder_factory import (
    CitationBuilderFactory,
)


def test_create_default_citation_builder():

    builder = CitationBuilderFactory.create()

    assert isinstance(
        builder,
        DefaultCitationBuilder,
    )