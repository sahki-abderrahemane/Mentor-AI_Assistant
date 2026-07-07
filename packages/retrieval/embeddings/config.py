from __future__ import annotations

from pydantic import Field

from retrieval.domain.base import MentorModel


class EmbeddingConfig(MentorModel):
    """
    Configuration for embedding models.
    """

    model_name: str = Field(
        default="BAAI/bge-small-en-v1.5",
        description="SentenceTransformer model name.",
    )

    device: str = Field(
        default="cpu",
        description="Execution device.",
    )

    normalize_embeddings: bool = Field(
        default=True,
        description="Normalize output vectors.",
    )

    batch_size: int = Field(
        default=32,
        ge=1,
        description="Embedding batch size.",
    )

    trust_remote_code: bool = Field(
        default=False,
        description="Whether to trust remote model code.",
    )