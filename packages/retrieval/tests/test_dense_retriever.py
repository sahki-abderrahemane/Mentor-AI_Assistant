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

from retrieval.retrievers.dense_retriever import (
    DenseRetriever,
)

from retrieval.vectorstores.config import (
    VectorStoreConfig,
)

from retrieval.vectorstores.faiss_vector_store import (
    FaissVectorStore,
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
        text="Artificial Intelligence is the simulation of human intelligence.",
        section=section,
        page_start=1,
        page_end=1,
        word_count=8,
    )

    ku2 = KnowledgeUnit(
        text="Machine Learning is a subset of Artificial Intelligence.",
        section=section,
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


def test_dense_retriever(tmp_path):

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

    retriever = DenseRetriever(
        embedding_model=embedding_model,
        vector_store=vector_store,
    )

    request = SearchRequest(
        query=Query(
            text="What is artificial intelligence?",
            top_k=2,
        ),
        strategy=RetrievalStrategy.DENSE,
    )

    result = retriever.retrieve(
        request,
    )

    assert result.query.text == request.query.text

    assert len(result.retrieved_units) == 2

    assert (
        result.metadata.returned_count == 2
    )

    assert (
        result.metadata.strategy
        == RetrievalStrategy.DENSE
    )

    assert (
        len(result.processing_history)
        == 5
    )