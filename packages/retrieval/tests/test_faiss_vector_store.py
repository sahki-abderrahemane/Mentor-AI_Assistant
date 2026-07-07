"""
packages/retrieval/tests/test_faiss_vector_store.py
"""

from pathlib import Path

from document_processing.domain.content import (
    KnowledgeUnit,
    Section,
)

from retrieval.domain.embedding import (
    Embedding,
)

from retrieval.embeddings.config import (
    EmbeddingConfig,
)

from retrieval.vectorstores.config import (
    VectorStoreConfig,
)

from retrieval.vectorstores.faiss_vector_store import (
    FaissVectorStore,
)


def build_knowledge_unit():

    return KnowledgeUnit(
        text="Artificial Intelligence",
        section=Section(
            title="Introduction",
            level=1,
            line_start=0,
            line_end=1,
            text="Intro",
            page_start=1,
            page_end=1,
        ),
        page_start=1,
        page_end=1,
        word_count=2,
    )


def build_embedding():

    config = EmbeddingConfig()

    dimension = 384

    return Embedding(
        vector=[0.1] * dimension,
        dimensions=dimension,
        model_name=config.model_name,
        normalized=True,
    )


def test_add_and_search(tmp_path):

    config = VectorStoreConfig(
        index_path=tmp_path / "index.faiss",
        metadata_path=tmp_path / "metadata.json",
    )

    store = FaissVectorStore(
        config,
    )

    ku = build_knowledge_unit()

    embedding = build_embedding()

    store.add(
        ku,
        embedding,
    )

    results = store.search(
        embedding,
        top_k=5,
    )

    assert len(results) == 1

    assert (
        results[0]
        .knowledge_unit
        .text
        == ku.text
    )


def test_save_and_load(tmp_path):

    config = VectorStoreConfig(
        index_path=tmp_path / "index.faiss",
        metadata_path=tmp_path / "metadata.json",
    )

    store = FaissVectorStore(
        config,
    )

    ku = build_knowledge_unit()

    embedding = build_embedding()

    store.add(
        ku,
        embedding,
    )

    store.save()

    new_store = FaissVectorStore(
        config,
    )

    new_store.load()

    assert (
        new_store.count()
        == 1
    )


def test_clear(tmp_path):

    config = VectorStoreConfig(
        index_path=tmp_path / "index.faiss",
        metadata_path=tmp_path / "metadata.json",
    )

    store = FaissVectorStore(
        config,
    )

    store.add(
        build_knowledge_unit(),
        build_embedding(),
    )

    assert store.count() == 1

    store.clear()

    assert store.count() == 0