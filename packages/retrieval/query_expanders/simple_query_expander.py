from __future__ import annotations

from retrieval.contracts.query_expander import (
    QueryExpander,
)

from retrieval.domain.query import (
    Query,
)


class SimpleQueryExpander(QueryExpander):
    """
    Basic query expansion strategy.

    The original query is preserved and a small number of
    semantically related variations are generated.
    """

    def name(
        self,
    ) -> str:

        return "simple"

    def expand(
        self,
        query: Query,
    ) -> list[Query]:

        expanded_queries = [
            query,
        ]

        suffixes = [
            "overview",
            "definition",
            "explanation",
        ]

        for suffix in suffixes:

            expanded_queries.append(
                Query(
                    text=f"{query.text} {suffix}",
                    language=query.language,
                    top_k=query.top_k,
                    filters=query.filters,
                    metadata=query.metadata.copy(),
                )
            )

        return expanded_queries