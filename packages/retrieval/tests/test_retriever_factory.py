from pathlib import Path

import pytest

from retrieval.citations.default_citation_builder import (
    DefaultCitationBuilder,
)
from retrieval.domain.enums import (
    RetrievalStrategy,
)
from retrieval.embeddings.config import (
    EmbeddingConfig,
)
from retrieval.embeddings.sentence_transformer_embedding import (
    SentenceTransformerEmbedding,
)
from retrieval.factories.retriever_factory import (
    RetrieverFactory,
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
from retrieval.vectorstores.config import (
    VectorStoreConfig,
)
from retrieval.vectorstores.faiss_vector_store import (
    FaissVectorStore,
)


def build_embedding():

    return SentenceTransformerEmbedding(
        EmbeddingConfig(),
    )


def build_vector_store(
    tmp_path,
):

    return FaissVectorStore(
        VectorStoreConfig(
            index_path=tmp_path / "index.faiss",
            metadata_path=tmp_path / "metadata.json",
        )
    )


def test_create_dense_retriever(
    tmp_path,
):

    retriever = RetrieverFactory.create(
        strategy=RetrievalStrategy.DENSE,
        embedding_model=build_embedding(),
        vector_store=build_vector_store(
            tmp_path,
        ),
        citation_builder=DefaultCitationBuilder(),
    )

    assert isinstance(
        retriever,
        DenseRetriever,
    )


def test_create_hybrid_retriever(
    tmp_path,
):

    dense = RetrieverFactory.create(
        strategy=RetrievalStrategy.DENSE,
        embedding_model=build_embedding(),
        vector_store=build_vector_store(
            tmp_path,
        ),
        citation_builder=DefaultCitationBuilder(),
    )

    retriever = RetrieverFactory.create(
        strategy=RetrievalStrategy.HYBRID,
        embedding_model=build_embedding(),
        vector_store=build_vector_store(
            tmp_path,
        ),
        citation_builder=DefaultCitationBuilder(),
        ranker=SimilarityRanker(),
        retrievers=[
            dense,
        ],
    )

    assert isinstance(
        retriever,
        HybridRetriever,
    )


def test_invalid_strategy(
    tmp_path,
):

    with pytest.raises(
        ValueError,
    ):

        RetrieverFactory.create(
            strategy=RetrievalStrategy.MULTI_QUERY,
            embedding_model=build_embedding(),
            vector_store=build_vector_store(
                tmp_path,
            ),
            citation_builder=DefaultCitationBuilder(),
        )