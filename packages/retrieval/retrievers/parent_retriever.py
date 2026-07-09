from __future__ import annotations

from retrieval.contracts.retriever import (
    Retriever,
)

from retrieval.domain.search_request import (
    SearchRequest,
)

from retrieval.domain.search_result import (
    SearchResult,
)

from retrieval.retrievers.dense_retriever import (
    DenseRetriever,
)


class ParentRetriever(Retriever):
    """
    Retrieves the most relevant Knowledge Units and enriches them
    with their parent section context.
    """

    def __init__(
        self,
        dense_retriever: DenseRetriever,
    ) -> None:

        self.dense_retriever = dense_retriever

    def name(
        self,
    ) -> str:

        return "parent"

    def retrieve(
        self,
        request: SearchRequest,
    ) -> SearchResult:
        """
        Execute parent retrieval.

        Parent retrieval first performs dense retrieval, then
        expands every retrieved Knowledge Unit with its parent
        section context.
        """

        result = self.dense_retriever.retrieve(
            request,
        )

        for retrieved_unit in result.retrieved_units:

            retrieved_unit.metadata[
                "parent_section_title"
            ] = (
                retrieved_unit
                .knowledge_unit
                .section
                .title
            )

            retrieved_unit.metadata[
                "parent_section_text"
            ] = (
                retrieved_unit
                .knowledge_unit
                .section
                .text
            )

        result.metadata.metadata[
            "parent_retrieval"
        ] = "enabled"

        return result