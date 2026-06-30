from pathlib import Path
import csv

from pathlib import Path

print("Current working directory:", Path.cwd())

RAW_DIR = Path("datasets/raw")
OUTPUT_FILE = RAW_DIR / "papers_metadata.csv"

rows = []

for category_dir in RAW_DIR.iterdir():
    if not category_dir.is_dir():
        continue

    category = category_dir.name

    for file in category_dir.rglob("*"):
        if not file.is_file():
            continue

        if file.suffix.lower() not in [".pdf", ".md", ".txt", ".html"]:
            continue

        rows.append(
            {
                "filename": file.name,
                "relative_path": str(file.relative_to(RAW_DIR)),
                "category": category,
                "title": "",
                "authors": "",
                "year": "",
                "source": "",
                "difficulty": "",
                "tags": "",
                "processed": False,
            }
        )

rows = sorted(rows, key=lambda x: (x["category"], x["filename"]))

with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(
        f,
        fieldnames=[
            "filename",
            "relative_path",
            "category",
            "title",
            "authors",
            "year",
            "source",
            "difficulty",
            "tags",
            "processed",
        ],
    )

    writer.writeheader()
    writer.writerows(rows)

print(f"Created {OUTPUT_FILE}")
print(f"Found {len(rows)} files.")
