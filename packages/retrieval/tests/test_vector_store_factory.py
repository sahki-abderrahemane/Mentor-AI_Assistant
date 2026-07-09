import pytest

from retrieval.domain.enums import (
    VectorStoreType,
)

from retrieval.vectorstores.config import (
    VectorStoreConfig,
)

from retrieval.vectorstores.faiss_vector_store import (
    FaissVectorStore,
)

from retrieval.factories.vector_store_factory import (
    VectorStoreFactory,
)


def test_create_faiss_vector_store(
    tmp_path,
):

    store = VectorStoreFactory.create(
        store_type=VectorStoreType.FAISS,
        config=VectorStoreConfig(
            index_path=tmp_path / "index.faiss",
            metadata_path=tmp_path / "metadata.json",
        ),
    )

    assert isinstance(
        store,
        FaissVectorStore,
    )


def test_invalid_vector_store(
    tmp_path,
):

    with pytest.raises(
        ValueError,
    ):

        VectorStoreFactory.create(
            store_type=VectorStoreType.CHROMA,
            config=VectorStoreConfig(
                index_path=tmp_path / "index.faiss",
                metadata_path=tmp_path / "metadata.json",
            ),
        )