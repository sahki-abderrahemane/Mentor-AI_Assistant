from retrieval.embeddings.config import (
    EmbeddingConfig,
)
from retrieval.embeddings.sentence_transformer_embedding import (
    SentenceTransformerEmbedding,
)


def test_embed_query():

    config = EmbeddingConfig()

    model = SentenceTransformerEmbedding(
        config,
    )

    embedding = model.embed_query(
        "What is artificial intelligence?"
    )

    assert embedding.model_name == config.model_name

    assert embedding.dimensions > 0

    assert len(embedding.vector) == embedding.dimensions


def test_embed_document():

    config = EmbeddingConfig()

    model = SentenceTransformerEmbedding(
        config,
    )

    embedding = model.embed_document(
        "Artificial Intelligence is the simulation of human intelligence."
    )

    assert embedding.model_name == config.model_name

    assert embedding.dimensions > 0

    assert len(embedding.vector) == embedding.dimensions


def test_embedding_dimension():

    config = EmbeddingConfig()

    model = SentenceTransformerEmbedding(
        config,
    )

    assert (
        model.embedding_dimension()
        > 0
    )


def test_model_name():

    config = EmbeddingConfig()

    model = SentenceTransformerEmbedding(
        config,
    )

    assert (
        model.model_name()
        == config.model_name
    )
def test_embed_documents():

    config = EmbeddingConfig()

    model = SentenceTransformerEmbedding(
        config,
    )

    embeddings = model.embed_documents(
        [
            "Artificial Intelligence",
            "Machine Learning",
            "Deep Learning",
        ]
    )

    assert len(embeddings) == 3

    for embedding in embeddings:

        assert (
            embedding.dimensions
            > 0
        )

        assert (
            len(embedding.vector)
            == embedding.dimensions
        )