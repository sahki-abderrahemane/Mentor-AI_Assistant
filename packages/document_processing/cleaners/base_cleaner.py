from __future__ import annotations

from abc import ABC, abstractmethod


class BaseCleaner(ABC):
    """
    Base interface for all text cleaners.

    Every cleaner performs one isolated transformation on a string
    and returns the cleaned result.
    """

    @abstractmethod
    def clean(self, text: str) -> str:
        """
        Apply a cleaning transformation.

        Parameters
        ----------
        text:
            Input text.

        Returns
        -------
        str
            Cleaned text.
        """
        raise NotImplementedError