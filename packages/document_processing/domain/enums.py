from enum import Enum

class DocumentFormat(str, Enum):
    PDF = "pdf"
    MARKDOWN = "markdown"
    HTML = "html"
    TEXT = "text"
    DOCX = "docx"


class ProcessingStage(str, Enum):
    INGESTED = "ingested"
    METADATA_EXTRACTED = "metadata_extracted"
    TEXT_EXTRACTED = "text_extracted"
    CLEANED = "cleaned"
    STRUCTURE_DETECTED = "structure_detected"
    CHUNKED = "chunked"
    COMPLETED = "completed"


class ProcessingStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"


class SourceType(str, Enum):
    LOCAL = "local"
    ARXIV = "arxiv"
    URL = "url"
    MANUAL = "manual"

class ExportFormat(str, Enum):
    JSON = "json"
    JSONL = "jsonl"
    CSV = "csv"