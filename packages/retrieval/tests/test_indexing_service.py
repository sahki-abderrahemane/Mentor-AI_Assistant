from pathlib import Path

from document_processing.domain.content import (
    DocumentContent,
    KnowledgeUnit,
    Section,
)
from document_processing.domain.document import Document

from retrieval.embeddings.config import EmbeddingConfig
from retrieval.embeddings.sentence_transformer_embedding import (
    SentenceTransformerEmbedding,
)

from retrieval.indexing.config import IndexingConfig
from retrieval.indexing.indexing_service import (
    IndexingService,
)

from retrieval.vectorstores.config import (
    VectorStoreConfig,
)
from retrieval.vectorstores.faiss_vector_store import (
    FaissVectorStore,
)


def build_document() -> Document:

    section = Section(
        title="Introduction",
        level=1,
        line_start=0,
        line_end=5,
        text="Artificial Intelligence introduction.",
        page_start=1,
        page_end=1,
    )

    ku1 = KnowledgeUnit(
        text="Artificial Intelligence is a branch of Computer Science.",
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


def test_index_document(tmp_path):

    embedding_model = SentenceTransformerEmbedding(
        EmbeddingConfig(),
    )

    vector_store = FaissVectorStore(
        VectorStoreConfig(
            index_path=tmp_path / "index.faiss",
            metadata_path=tmp_path / "metadata.json",
        )
    )

    indexing_service = IndexingService(
        embedding_model=embedding_model,
        vector_store=vector_store,
        config=IndexingConfig(),
    )

    document = build_document()

    indexing_service.index_document(
        document,
    )

    assert vector_store.count() == 2