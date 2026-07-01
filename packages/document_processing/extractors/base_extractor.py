from __future__ import annotations

from abc import ABC, abstractmethod

from document_processing.domain.document import Document


class BaseExtractor(ABC):
    """
    Base class for all extractors.

    Extractors receive a Document, enrich it,
    and return the same Document instance.
    """

    @abstractmethod
    def extract(self, document: Document) -> Document:
        """
        Extract information and enrich the document.

        Parameters
        ----------
        document:
            Document being processed.

        Returns
        -------
        Document
            Updated document.
        """
        raise NotImplementedError