from __future__ import annotations

import hashlib
from pathlib import Path

CHUNK_SIZE = 8192  # 8KB

def compute_sha256(path: Path) -> str:
    """
    Compute SHA-256 checksum for a file.
    """

    if not path.exists():
        raise FileNotFoundError(f"The file {path} does not exist.")

    sha256 = hashlib.sha256()
    with path.open("rb") as file:
        while chunk := file.read(CHUNK_SIZE):
            sha256.update(chunk)

    return sha256.hexdigest()