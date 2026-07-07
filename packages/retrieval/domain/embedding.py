
from __future__ import annotations

from pydantic import Field

from .base import MentorModel


class Embedding(MentorModel):
    """
    Represents a vector embedding.
    """

    vector: list[float] = Field(
        min_length=1,
        description="Embedding vector.",
    )

    model_name: str = Field(
        description="Embedding model name.",
    )

    dimensions: int = Field(
        ge=1,
        description="Embedding dimensionality.",
    )

    normalized: bool = Field(
        default=False,
        description="Whether the vector has been normalized.",
    )