from datetime import datetime

from document_processing.utils.date import parse_pdf_date


def test_none():
    assert parse_pdf_date(None) is None


def test_empty():
    assert parse_pdf_date("") is None


def test_valid():
    expected = datetime(2021, 6, 4, 15, 30, 0)

    assert parse_pdf_date("D:20210604153000") == expected


def test_valid_with_timezone():
    expected = datetime(2021, 6, 4, 15, 30, 0)

    assert parse_pdf_date("D:20210604153000Z") == expected


def test_invalid():
    assert parse_pdf_date("Hello") is None


def test_invalid_date():
    assert parse_pdf_date("D:20211304153000") is None