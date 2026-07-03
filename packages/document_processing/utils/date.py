from __future__ import annotations

import re
from datetime import datetime


_DATE_PATTERN = re.compile(r"^D:(\d{14})")


def parse_pdf_date(pdf_date: str | None) -> datetime | None:
    """
    Parse a PDF CreationDate string into a datetime.

    Supported examples:
        D:20210604153000
        D:20210604153000Z
        D:20210604153000+01'00'

    Returns
    -------
    datetime | None
    """

    if not pdf_date:
        return None

    pdf_date = pdf_date.strip()

    match = _DATE_PATTERN.match(pdf_date)

    if not match:
        return None

    try:
        return datetime.strptime(match.group(1), "%Y%m%d%H%M%S")
    except ValueError:
        return None