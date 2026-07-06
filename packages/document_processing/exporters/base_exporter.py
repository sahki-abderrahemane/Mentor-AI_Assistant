from __future__ import annotations

from abc import ABC, abstractmethod
from pathlib import Path

from document_processing.domain.document import Document


class BaseExporter(ABC):
    """
    Base class for exporting processed documents into
    external dataset formats.
    """

    @abstractmethod
    def export(
        self,
        document: Document,
        output_path: Path,
    ) -> None:
        """
        Export the processed document.
        """
        raise NotImplementedError