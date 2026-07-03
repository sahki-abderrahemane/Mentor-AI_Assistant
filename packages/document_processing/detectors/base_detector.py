from __future__ import annotations

from abc import ABC, abstractmethod


class BaseDetector(ABC):
    """
    Base class for all document detectors.
    """

    @abstractmethod
    def detect(self, text: str):
        """
        Detect structures from text.
        """
        raise NotImplementedError