from pydantic import BaseModel, Field


class ChunkingConfig(BaseModel):
    """
    Configuration for hierarchical chunking.
    """

    max_words: int = Field(
        default=500,
        ge=100,
        description="Maximum words allowed in a Knowledge Unit.",
    )

    min_words: int = Field(
        default=150,
        ge=20,
        description="Minimum preferred chunk size.",
    )

    paragraph_overlap: int = Field(
        default=0,
        ge=0,
        description="Paragraph overlap between chunks.",
    )

    sentence_overlap: int = Field(
        default=1,
        ge=0,
        description="Sentence overlap when sentence splitting is used.",
    )