from __future__ import annotations

from abc import ABC, abstractmethod


class BaseService(ABC):
    """
    Base class for all processing services.
    """

    @abstractmethod
    def process(self, *args, **kwargs):
        raise NotImplementedError