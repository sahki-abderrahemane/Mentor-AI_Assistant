from datetime import UTC, datetime
from uuid import UUID, uuid4

from pydantic import BaseModel, ConfigDict, Field


class MentorModel(BaseModel):
    """
    Base model used throughout MentorAI.
    """

    model_config = ConfigDict(
        extra="forbid",
        validate_assignment=True,
        arbitrary_types_allowed=True,
    )


class BaseEntity(MentorModel):
    """
    Base class for persistent domain entities.
    """

    id: UUID = Field(default_factory=uuid4)

    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    version: str = Field(default="0.1.0")