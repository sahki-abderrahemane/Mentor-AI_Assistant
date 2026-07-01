# Architecture Design Document — Document Processing Engine (DPE)

| | |
|---|---|
| **Subsystem** | Document Processing Engine (DPE) |
| **Project** | MentorAI |
| **Status** | Draft — Sprint 1, Milestone 1 |
| **Version** | 0.1.0 |
| **Owner** | Abderrahemane Sahki |
| **Last updated** | 2026-07-01 |

---

## 1. Purpose

The Document Processing Engine transforms unstructured research documents (starting with PDFs) into structured **Knowledge Objects** — self-contained, machine-readable units of meaning that preserve document hierarchy, source metadata, and semantic boundaries.

These Knowledge Objects are the foundation every downstream MentorAI subsystem builds on:

- **Instruction dataset generation** — turning chunks into Q&A / instruction-response pairs for fine-tuning (e.g. the QLoRA work on Mistral-7B / Llama-3.1-8B).
- **Retrieval-Augmented Generation (RAG)** — embedding and indexing chunks for retrieval.
- **Evaluation** — grounding generated answers against known source chunks.
- **Future NotebookLM-style features** — summarization, cross-document Q&A, citation tracing.

The DPE does not decide *how* the knowledge will be used. It only guarantees that whatever comes out of it is clean, structured, traceable back to its source, and consistent regardless of which downstream module consumes it. This separation of concerns is the whole point: every future subsystem can trust the DPE's output contract instead of re-parsing documents itself.

---

## 2. Functional Requirements

### Version 1 (this sprint)

| # | Requirement | Notes |
|---|---|---|
| FR1 | Read PDF files | Entry point for the pipeline |
| FR2 | Extract metadata | Title, authors, creation date, page count, file size |
| FR3 | Extract raw text | Preserve reading order as much as possible |
| FR4 | Normalize / clean text | Remove artifacts introduced by PDF extraction |
| FR5 | Preserve document hierarchy | Sections, subsections, and their nesting |
| FR6 | Produce structured chunks | Hierarchical chunking, not flat text splitting |
| FR7 | Attach metadata to every chunk | Page range, word count, source section |
| FR8 | Emit Knowledge Objects | Final JSON output consumed by later subsystems |

### Explicitly out of scope for V1

- OCR for scanned documents
- Table/figure extraction
- Formula parsing
- Citation/reference graph construction
- Multi-document linking

(These are captured formally in §6 so they're designed *for*, not forgotten.)

---

## 3. Non-Functional Requirements

| Requirement | Why it matters |
|---|---|
| **Modular** | Each stage (metadata, text extraction, cleaning, structure detection, chunking, object building) must be swappable independently. Swapping the cleaning engine shouldn't touch the chunker. |
| **Extensible** | New input formats (TXT, Markdown, HTML, DOCX) should plug into the pipeline without redesigning it. |
| **Deterministic outputs** | Same input PDF → same Knowledge Objects, every run. Critical for reproducible datasets and debugging. |
| **Reproducible** | Given a document + pipeline version, the output should be regenerable from scratch — no hidden state, no manual intervention. |
| **Fast enough for hundreds of papers** | The pipeline will run in batch over a corpus, not just single documents. Needs to be efficient enough not to become the bottleneck of the whole project. |
| **Graceful degradation on malformed PDFs** | A single corrupt/encrypted/oddly-encoded PDF should not crash a batch run. Log the failure, skip, continue. |
| **Traceability** | Every Knowledge Object must be traceable back to its exact source location (paper, page range, section) — non-negotiable for later citation and evaluation work. |

---

## 4. Inputs

### V1
- **PDF** — the only supported format for this sprint.

### Planned (not implemented yet, but the pipeline should not block them)
- TXT
- Markdown
- HTML
- DOCX

Design implication: the pipeline should have a clear **ingestion boundary** — whatever format comes in, it's converted into a common internal representation (e.g. raw text + page/position metadata) before hitting the cleaning stage. This means adding a new format later is "write a new adapter," not "redesign the pipeline."

---

## 5. Outputs — Knowledge Objects

The DPE does not produce text. It produces **Knowledge Objects**: structured, self-describing units that carry both content and context.

```json
{
  "id": "chunk_0012",
  "paper": "Attention Is All You Need",
  "category": "llms",
  "section": "Scaled Dot-Product Attention",
  "subsection": "3.2",
  "text": "...",
  "metadata": {
    "page_start": 6,
    "page_end": 7,
    "word_count": 512
  }
}
```

### Field contract (draft — to refine as modules are built)

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique, stable chunk identifier |
| `paper` | string | Source document title |
| `category` | string | Topic/domain tag (manual or inferred later) |
| `section` | string | Top-level structural section |
| `subsection` | string | Nested structural label, if any |
| `text` | string | Cleaned chunk text |
| `metadata.page_start` | int | First page the chunk spans |
| `metadata.page_end` | int | Last page the chunk spans |
| `metadata.word_count` | int | Word count of the chunk |

Why this matters: storing knowledge instead of raw text means every downstream consumer (fine-tuning dataset builder, RAG indexer, evaluator) gets structure and provenance for free, instead of re-deriving it from scratch.

---

## 6. Future Extensions

Not implemented now, but the architecture should not make these hard to add later:

- **OCR** — for scanned/image-based PDFs
- **Table extraction** — structured table data as its own object type
- **Image extraction** — figures as linked assets
- **Figure caption extraction** — associate captions with their figures
- **Formula extraction** — LaTeX/MathML representation of equations
- **Citation extraction** — in-text citation markers
- **Reference list parsing** — structured bibliography
- **Cross-document linking** — connecting citations to other papers already in the corpus

Design implication: the Knowledge Object schema should be treated as **extensible, not fixed** — new object types (e.g. `table_object`, `figure_object`) can be introduced later without breaking existing chunk objects.

---

## 7. Pipeline Overview

```
Raw PDFs
    │
    ▼
Metadata Extraction        (Module 1)
    │
    ▼
Text Extraction             (Module 2 — done, will be improved)
    │
    ▼
Cleaning                    (Module 3)
    │
    ▼
Structure Detection         (Module 4 — no library, built from scratch)
    │
    ▼
Hierarchical Chunking       (Module 5)
    │
    ▼
Chunk Metadata Attachment
    │
    ▼
Knowledge Object Builder    (Module 6)
    │
    ▼
JSON Knowledge Objects
```

Each stage takes a well-defined input and produces a well-defined output, so any stage can be tested, replaced, or improved in isolation.

---

## 8. Module Breakdown (implementation roadmap)

| Module | Responsibility | Status |
|---|---|---|
| 1. PDF Metadata Extractor | title, authors, creation date, page count, file size, (language later) | Not started |
| 2. Text Extractor | Extract raw text from PDF, preserving reading order | Done — to be improved |
| 3. Cleaning Engine | Remove extraction artifacts, normalize whitespace/encoding | Not started |
| 4. Structure Detection Engine | Detect Abstract → Introduction → Method → Experiments → Conclusion, custom-built | Not started |
| 5. Hierarchical Chunker | Reusable chunker for both fine-tuning and RAG | Not started |
| 6. Knowledge Object Builder | Assemble chunks + metadata into final JSON objects | Not started |

---

## 9. Open Questions (to resolve as we build)

- What happens when structure detection fails to find expected sections (e.g. non-standard paper layout)? Fallback to flat chunking?
- How is `category` assigned in V1 — manual tagging per paper, or inferred later?
- What's the chunking strategy: fixed token windows, sentence-boundary aware, or section-aware with size caps?
- Should chunk `id`s be content-hashed (for dedup) or sequential per paper?

---

## 10. Revision Log

| Version | Date | Change |
|---|---|---|
| 0.1.0 | 2026-07-01 | Initial draft — structure, requirements, I/O contract defined |