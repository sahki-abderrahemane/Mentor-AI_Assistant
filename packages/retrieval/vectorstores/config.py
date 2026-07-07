from __future__ import annotations
from pathlib import Path

from pydantic import Field

from retrieval.domain.base import MentorModel


class VectorStoreConfig(MentorModel):
    """
    Configuration for vector stores.
    """

    index_path: Path = Field(
        default=Path("./storage/vector_index.faiss"),
        description="Path where the FAISS index is stored.",
    )

    metadata_path: Path = Field(
        default=Path("./storage/vector_metadata.pkl"),
        description="Path where Knowledge Units metadata is stored.",
    )

    metric: str = Field(
        default="cosine",
        description="Similarity metric.",
    )

    normalize_embeddings: bool = Field(
        default=True,
        description="Normalize vectors before indexing.",
    )