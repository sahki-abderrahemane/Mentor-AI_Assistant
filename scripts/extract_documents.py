from pathlib import Path
import fitz
from tqdm import tqdm

PROJECT_ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = PROJECT_ROOT / "datasets" / "raw"
PROCESSED_DIR = PROJECT_ROOT / "datasets" / "processed"


def extract_pdf_text(pdf_path: Path) -> str:
    text = []

    with fitz.open(pdf_path) as doc:
        for page in doc:
            page_text = page.get_text("text")
            text.append(page_text)

    return "\n".join(text)


pdf_files = list(RAW_DIR.rglob("*.pdf"))

print(f"Found {len(pdf_files)} PDFs")

for pdf_path in tqdm(pdf_files):
    relative_path = pdf_path.relative_to(RAW_DIR)
    output_path = PROCESSED_DIR / relative_path.with_suffix(".txt")

    output_path.parent.mkdir(parents=True, exist_ok=True)

    try:
        text = extract_pdf_text(pdf_path)

        with open(output_path, "w", encoding="utf-8") as f:
            f.write(text)

    except Exception as e:
        print(f"Failed: {pdf_path}")
        print(e)

print("Extraction complete.")
