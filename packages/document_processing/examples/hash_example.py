from pathlib import Path

from document_processing.utils.hash import compute_sha256


def main():
    pdf = Path("../datasets/raw/ml/adam.pdf")

    checksum = compute_sha256(pdf)

    print(f"SHA256: {checksum}")
    print(f"Length: {len(checksum)}")


if __name__ == "__main__":
    main()