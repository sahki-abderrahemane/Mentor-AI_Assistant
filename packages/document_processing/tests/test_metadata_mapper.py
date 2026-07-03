from pathlib import Path

from document_processing.mappers.metadata_mapper import MetadataMapper


class FakePDF:
    def __init__(self):
        self.metadata = {
            "title": "Attention Is All You Need",
            "author": "Ashish Vaswani, Noam Shazeer",
            "keywords": "Transformer, NLP",
        }

        self.page_count = 15


PROJECT_ROOT = Path(__file__).resolve().parents[3]


def test_map_pdf_metadata():

    pdf = FakePDF()

    path = PROJECT_ROOT / "datasets/raw/llms/attention_is_all_you_need.pdf"

    metadata = MetadataMapper.from_pdf(
        pdf=pdf,
        file_path=path,
        category="llms",
    )

    assert metadata.document.title == "Attention Is All You Need"

    assert metadata.document.authors == [
        "Ashish Vaswani",
        "Noam Shazeer",
    ]

    assert metadata.document.keywords == [
        "Transformer",
        "NLP",
    ]

    assert metadata.statistics.page_count == 15

    assert metadata.file.extension == ".pdf"

    assert len(metadata.file.checksum) == 64