from pathlib import Path

from document_processing.domain.content import (
    DocumentContent,
    KnowledgeUnit,
    Section,
)
from document_processing.domain.document import (
    Document,
)

from retrieval.domain.enums import (
    RetrievalStrategy,
)
from retrieval.domain.query import (
    Query,
)
from retrieval.domain.search_request import (
    SearchRequest,
)

from retrieval.embeddings.config import (
    EmbeddingConfig,
)
from retrieval.embeddings.sentence_transformer_embedding import (
    SentenceTransformerEmbedding,
)

from retrieval.indexing.config import (
    IndexingConfig,
)
from retrieval.indexing.indexing_service import (
    IndexingService,
)

from retrieval.query_expanders.simple_query_expander import (
    SimpleQueryExpander,
)

from retrieval.rankers.similarity_ranker import (
    SimilarityRanker,
)

from retrieval.retrievers.dense_retriever import (
    DenseRetriever,
)

from retrieval.retrievers.multi_query_retriever import (
    MultiQueryRetriever,
)

from retrieval.vectorstores.config import (
    VectorStoreConfig,
)

from retrieval.vectorstores.faiss_vector_store import (
    FaissVectorStore,
)
from retrieval.citations.default_citation_builder import (
    DefaultCitationBuilder,
)

def build_document() -> Document:

    section = Section(
        title="Artificial Intelligence",
        level=1,
        line_start=0,
        line_end=5,
        text="Artificial Intelligence",
        page_start=1,
        page_end=1,
    )

    ku1 = KnowledgeUnit(
        text="Machine learning is a subset of artificial intelligence.",
        section=section,
        document_id="doc-ai",
        category="ai",
        tags=["ai", "ml"],
        page_start=1,
        page_end=1,
        word_count=9,
    )

    ku2 = KnowledgeUnit(
        text="Deep learning is based on neural networks.",
        section=section,
        document_id="doc-ai",
        category="ai",
        tags=["deep-learning"],
        page_start=1,
        page_end=1,
        word_count=8,
    )

    document = Document(
        source_path=Path("dummy.pdf"),
    )

    document.content = DocumentContent(
        knowledge_units=[
            ku1,
            ku2,
        ]
    )

    return document


def test_multi_query_retriever(tmp_path):

    embedding_model = SentenceTransformerEmbedding(
        EmbeddingConfig(),
    )

    vector_store = FaissVectorStore(
        VectorStoreConfig(
            index_path=tmp_path / "index.faiss",
            metadata_path=tmp_path / "metadata.json",
        )
    )

    indexing = IndexingService(
        embedding_model=embedding_model,
        vector_store=vector_store,
        config=IndexingConfig(),
    )

    indexing.index_document(
        build_document(),
    )

    dense_retriever = DenseRetriever(
        embedding_model=embedding_model,
        vector_store=vector_store,
        citation_builder=DefaultCitationBuilder(),
    )

    retriever = MultiQueryRetriever(
        query_expander=SimpleQueryExpander(),
        retriever=dense_retriever,
        ranker=SimilarityRanker(),
        citation_builder=DefaultCitationBuilder(),  
    )

    request = SearchRequest(
        query=Query(
            text="machine learning",
            top_k=5,
        ),
        strategy=RetrievalStrategy.MULTI_QUERY,
    )

    result = retriever.retrieve(
        request,
    )

    assert len(result.retrieved_units) >= 1

    assert (
        result.metadata.strategy
        == RetrievalStrategy.MULTI_QUERY
    )

    assert (
        result.metadata.reranked
        is True
    )

    assert (
        result.metadata.metadata["query_expander"]
        == "simple"
    )

    assert (
        int(
            result.metadata.metadata["expanded_queries"]
        )
        == 4
    )

    ids = [
        unit.knowledge_unit.id
        for unit in result.retrieved_units
    ]

    assert len(ids) == len(set(ids))