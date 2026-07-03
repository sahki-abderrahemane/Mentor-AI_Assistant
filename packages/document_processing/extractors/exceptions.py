from __future__ import annotations


class ExtractionError(Exception):
    """
    Base exception for all extraction-related errors.
    """

    def __init__(self, message: str):
        super().__init__(message)


class InvalidDocumentError(ExtractionError):
    """
    Raised when the input document is invalid or missing.
    """


class UnsupportedFormatError(ExtractionError):
    """
    Raised when no extractor exists for a document format.
    """


class MetadataExtractionError(ExtractionError):
    """
    Raised when metadata extraction fails.
    """


class TextExtractionError(ExtractionError):
    """
    Raised when text extraction fails.
    """