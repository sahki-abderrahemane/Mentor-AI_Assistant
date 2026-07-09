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

from retrieval.retrievers.parent_retriever import (
    ParentRetriever,
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
        text="Artificial Intelligence is a branch of computer science.",
        page_start=1,
        page_end=1,
    )

    knowledge_unit = KnowledgeUnit(
        text="Machine learning is a subset of artificial intelligence.",
        section=section,
        document_id="doc-ai",
        category="ai",
        tags=["ai", "ml"],
        page_start=1,
        page_end=1,
        word_count=9,
    )

    document = Document(
        source_path=Path("dummy.pdf"),
    )

    document.content = DocumentContent(
        knowledge_units=[
            knowledge_unit,
        ]
    )

    return document


def test_parent_retriever(tmp_path):

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

    retriever = ParentRetriever(
        dense_retriever=dense_retriever,
    )

    request = SearchRequest(
        query=Query(
            text="What is machine learning?",
            top_k=1,
        ),
        strategy=RetrievalStrategy.PARENT,
    )

    result = retriever.retrieve(
        request,
    )

    assert len(result.retrieved_units) == 1

    unit = result.retrieved_units[0]

    assert (
        unit.metadata["parent_section_title"]
        == "Artificial Intelligence"
    )

    assert (
        unit.metadata["parent_section_text"]
        == "Artificial Intelligence is a branch of computer science."
    )

    assert (
        result.metadata.metadata["parent_retrieval"]
        == "enabled"
    )