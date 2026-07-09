from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class EvaluationConfig:
    """
    Configuration for retrieval evaluation.
    """

    enabled: bool = True

    include_metadata: bool = True