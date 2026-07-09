from unittest import result

from retrieval.embeddings.config import EmbeddingConfig
from retrieval.embeddings.sentence_transformer_embedding import (
    SentenceTransformerEmbedding,
)

from retrieval.retrievers.parent_retriever import ParentRetriever
from retrieval.vectorstores.config import VectorStoreConfig
from retrieval.vectorstores.faiss_vector_store import (
    FaissVectorStore,
)

from retrieval.indexing.config import IndexingConfig
from retrieval.indexing.indexing_service import (
    IndexingService,
)

from retrieval.rankers.similarity_ranker import (
    SimilarityRanker,
)

from retrieval.retrievers.dense_retriever import (
    DenseRetriever,
)

from retrieval.retrievers.hybrid_retriever import (
    HybridRetriever,
)

from retrieval.domain.query import Query
from retrieval.domain.search_request import SearchRequest
from retrieval.domain.enums import RetrievalStrategy

from pathlib import Path

from document_processing.domain.document import Document
from document_processing.domain.content import (
    DocumentContent,
    KnowledgeUnit,
    Section,
)
from retrieval.citations.default_citation_builder import (
    DefaultCitationBuilder,
)

def build_document():

    section = Section(
        title="AI",
        level=1,
        text="Artificial Intelligence",
        line_start=0,
        line_end=0,
        page_start=1,
        page_end=1,
    )

    ku = KnowledgeUnit(
        text="Artificial Intelligence enables machines to reason.",
        section=section,
        page_start=1,
        page_end=1,
        word_count=7,
    )

    document = Document(
        source_path=Path("dummy.pdf"),
    )

    document.content = DocumentContent(
        knowledge_units=[
            ku,
        ],
    )

    return document


def test_hybrid_retriever(tmp_path):

    embedding_model = SentenceTransformerEmbedding(
        EmbeddingConfig(),
    )

    vector_store = FaissVectorStore(
        VectorStoreConfig(
            index_path=tmp_path / "index.faiss",
            metadata_path=tmp_path / "metadata.json",
        ),
    )

    indexing = IndexingService(
        embedding_model=embedding_model,
        vector_store=vector_store,
        config=IndexingConfig(),
    )

    indexing.index_document(
        build_document(),
    )

    dense = DenseRetriever(
        embedding_model,
        vector_store,
        citation_builder=DefaultCitationBuilder(),
    )
    parent_retriever = ParentRetriever(dense)
    hybrid = HybridRetriever(
        retrievers=[dense,parent_retriever],
        ranker=SimilarityRanker(),
        citation_builder=DefaultCitationBuilder(),
    )

    result = hybrid.retrieve(
        SearchRequest(
            query=Query(
                text="Artificial Intelligence",
            ),
            strategy=RetrievalStrategy.HYBRID,
        ),
    )

    assert result.metadata.strategy == RetrievalStrategy.HYBRID
    assert len(result.retrieved_units) > 0
    assert result.metadata.returned_count == len(result.retrieved_units)
    assert len(result.citations) == len(
    result.retrieved_units,
)

    assert (
    result.citations[0].retrieved_unit
    == result.retrieved_units[0]
)