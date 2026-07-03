from pathlib import Path

from document_processing.utils.hash import compute_sha256


PROJECT_ROOT = Path(__file__).resolve().parents[3]

pdf = PROJECT_ROOT / "datasets/raw/ml/adam.pdf"

def test_sha256():
    path = pdf
    checksum = compute_sha256(path)

    assert len(checksum) == 64
