"""
MentorAI AI Processing Service
Wraps document_processing + retrieval packages for the NestJS backend.
"""
import sys
from pathlib import Path

# Add packages to path. The mounted /packages/document_processing and
# /packages/retrieval directories ARE the packages, so their parent
# (/packages) must be importable.
PACKAGES_PATH = Path("/packages")
sys.path.insert(0, str(PACKAGES_PATH))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import uvicorn

from document_processing.pipeline import DocumentProcessingPipeline
from document_processing.splitters.chunking_config import ChunkingConfig

from retrieval.embeddings.embedding_factory import EmbeddingFactory
from retrieval.embeddings.config import EmbeddingConfig
from retrieval.indexing.indexing_service import IndexingService
from retrieval.indexing.config import IndexingConfig
from retrieval.vectorstores.faiss_vector_store import FaissVectorStore
from retrieval.vectorstores.config import VectorStoreConfig
from retrieval.vectorstores.base_vector_store import BaseVectorStore
from retrieval.domain.enums import VectorStoreType
from retrieval.services.retrieval_pipeline import RetrievalPipeline
from retrieval.domain.search_request import SearchRequest, Query
from retrieval.domain.query import SearchFilter
from retrieval.factories.retriever_factory import RetrieverFactory
from retrieval.factories.citation_builder_factory import CitationBuilderFactory
from retrieval.domain.enums import RetrievalStrategy
from retrieval.factories.vector_store_factory import VectorStoreFactory
app = FastAPI(title="MentorAI AI Processing Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Service Lifetime ─────────────────────────────────────────────────────────

embedding_model = None
vector_store: BaseVectorStore | None = None
indexing_service = None

@app.on_event("startup")
def startup():
    global embedding_model, vector_store, indexing_service

    # Initialize embedding model (singleton)
    embedding_model = EmbeddingFactory.create(EmbeddingConfig(
        model_name="BAAI/bge-small-en-v1.5",
        device="cpu",
        normalize_embeddings=True,
    ))

    # Initialize FAISS vector store
    store_path = Path("/data")
    store_path.mkdir(parents=True, exist_ok=True)
    vector_store = VectorStoreFactory.create(
        VectorStoreType.FAISS,
        VectorStoreConfig(
            index_path=store_path / "vector_index.faiss",
            metadata_path=store_path / "vector_metadata.pkl",
            metric="cosine",
            normalize_embeddings=True,
        )
    )
    vector_store.load()

    # Initialize indexing service
    indexing_service = IndexingService(
        embedding_model=embedding_model,
        vector_store=vector_store,
        config=IndexingConfig(batch_size=64, save_after_indexing=True),
    )

# ── Request/Response Models ───────────────────────────────────────────────────

class ProcessPdfRequest(BaseModel):
    pdf_path: str = Field(description="Path to the PDF file")
    document_id: Optional[str] = Field(default=None, description="Documents DB UUID")
    document_title: Optional[str] = Field(default=None, description="Document title for metadata")

class BatchEmbedRequest(BaseModel):
    texts: list[str] = Field(min_length=1)

class IndexChunksRequest(BaseModel):
    knowledge_units: list[dict]
    embeddings: list[list[float]]

class RemoveDocumentRequest(BaseModel):
    document_id: str = Field(description="Documents DB UUID to remove from the index")

class SearchRequestInput(BaseModel):
    query: str = Field(min_length=1)
    top_k: int = Field(default=5, ge=1, le=100)
    filters: Optional[dict] = Field(default=None)
    document_ids: Optional[list[str]] = Field(default=None)

class SectionsRequest(BaseModel):
    document_ids: list[str] = Field(default_factory=list)

BACK_MATTER_HEADINGS = {
    "references",
    "bibliography",
    "works cited",
    "appendix",
}

def _merge_title_fragments(titles: list[str]) -> list[str]:
    """
    Merge column-split heading fragments from two-column PDFs.

    A heading split across a line/column break produces consecutive short
    title-case fragments (e.g. 'More Data Beats' + 'a Cleverer Algorithm').
    Join a fragment with the next when the next starts lowercase or the
    current one ends on an operator (+, -, =) or a dangling fraction.
    """
    if not titles:
        return titles
    merged: list[str] = []
    current = titles[0]
    for nxt in titles[1:]:
        starter = nxt.lstrip()
        joins_lower = bool(starter) and starter[0].islower()
        joins_operator = current.rstrip().endswith(("+", "-", "=", "/"))
        if (joins_lower or joins_operator) and len(current.split()) + len(nxt.split()) <= 12:
            current = f"{current} {nxt}".strip()
        else:
            merged.append(current)
            current = nxt
    merged.append(current)
    return merged

def _clean_section_titles(raw: list[str]) -> list[str]:
    seen: list[str] = []
    for t in raw:
        t = " ".join(t.split())
        if not t:
            continue
        if t.lower() in BACK_MATTER_HEADINGS:
            continue
        if any(ch.isdigit() for ch in t):
            continue
        if "|" in t:
            continue
        if t.startswith(("by ", "fig. ", "fig ")):
            continue
        if "(" in t:
            continue
        if "accuracy" in t.lower() or "examples" in t.lower():
            continue
        if t not in seen:
            seen.append(t)
    return _merge_title_fragments(seen)

# ── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/process-pdf")
def process_pdf(req: ProcessPdfRequest):
    pipeline = DocumentProcessingPipeline(
        chunking_config=ChunkingConfig(min_words=200, max_words=600)
    )
    doc = pipeline.process(Path(req.pdf_path), category="mentorai")
    document_title = req.document_title or (doc.metadata.document.title if doc.metadata else None)

    return {
        "knowledgeUnits": [
            {
                "id": str(ku.id),
                "text": ku.text,
                "section": {
                    "title": ku.section.title if ku.section else "",
                    "level": ku.section.level if ku.section else 1,
                    "line_start": ku.section.line_start if ku.section else 0,
                    "line_end": ku.section.line_end if ku.section else 0,
                    "text": ku.section.text if ku.section else "",
                    "page_start": ku.section.page_start if ku.section else 1,
                    "page_end": ku.section.page_end if ku.section else 1,
                } if ku.section else None,
                "subsection": ku.subsection,
                "pageStart": ku.page_start,
                "pageEnd": ku.page_end,
                "wordCount": ku.word_count,
                "documentId": req.document_id or (str(document_title) if document_title else None),
                "metadata": {"document_title": document_title or ""},
            }
            for ku in doc.content.knowledge_units
        ],
        "metadata": {
            "pageCount": doc.metadata.statistics.page_count if doc.metadata else 0,
            "wordCount": doc.metadata.statistics.word_count if doc.metadata else 0,
        }
    }

@app.post("/batch-embed")
def batch_embed(req: BatchEmbedRequest):
    embeddings = embedding_model.embed_documents(req.texts)
    return {
        "embeddings": [
            list(map(float, e.vector)) for e in embeddings
        ]
    }

@app.post("/remove-document")
def remove_document(req: RemoveDocumentRequest):
    """Remove all indexed knowledge units belonging to a document."""
    vector_store.remove_document(req.document_id)
    return {"status": "removed"}

@app.post("/index-chunks")
def index_chunks(req: IndexChunksRequest):
    from document_processing.domain.content import KnowledgeUnit as DPKU
    from document_processing.domain.content import Section as DPSection
    from retrieval.domain.embedding import Embedding

    def _build_section(sec: object, ku_dict: dict) -> DPSection:
        if isinstance(sec, str):
            return DPSection(title=sec, level=1, line_start=0, line_end=0)
        if isinstance(sec, dict):
            return DPSection(
                title=sec.get("title") or "",
                level=int(sec.get("level") or 1),
                line_start=int(sec.get("line_start") or 0),
                line_end=int(sec.get("line_end") or 0),
                text=sec.get("text") or "",
                page_start=int(sec.get("page_start") or ku_dict.get("pageStart") or 1),
                page_end=int(sec.get("page_end") or ku_dict.get("pageEnd") or 1),
            )
        return DPSection(title="", level=1, line_start=0, line_end=0)

    # Reconstruct knowledge units from dict
    kus = []
    for ku_dict in req.knowledge_units:
        document_id = ku_dict.get("documentId")
        ku = DPKU(
            text=ku_dict["text"],
            section=_build_section(ku_dict.get("section"), ku_dict),
            subsection=ku_dict.get("subsection"),
            page_start=ku_dict.get("pageStart", 1),
            page_end=ku_dict.get("pageEnd", 1),
            word_count=ku_dict.get("wordCount", 0),
        )
        if document_id:
            ku.document_id = str(document_id)
        if isinstance(ku_dict.get("metadata"), dict):
            ku.metadata = dict(ku_dict["metadata"])
        kus.append(ku)

    # Convert embeddings
    embs = [Embedding(vector=e, model_name=embedding_model.model_name(), dimensions=len(e)) for e in req.embeddings]

    # Add to vector store
    vector_store.add_many(kus, embs)
    vector_store.save()

    return {"status": "indexed"}

@app.post("/sections")
def sections(req: SectionsRequest):
    """Return the distinct section titles per document from the vector store."""
    by_doc: dict[str, dict] = {}
    for ku in vector_store.metadata:
        doc_id = ku.document_id
        if not doc_id:
            continue
        if req.document_ids and doc_id not in req.document_ids:
            continue
        title = ku.section.title if ku.section else ""
        if not title:
            continue
        entry = by_doc.setdefault(doc_id, {
            "documentId": doc_id,
            "documentTitle": ku.metadata.get("document_title") or doc_id,
            "titles": [],
        })
        entry["titles"].append(title)

    return {
        "documents": [
            {
                "documentId": doc_id,
                "documentTitle": entry["documentTitle"],
                "titles": _clean_section_titles(entry["titles"]),
            }
            for doc_id, entry in by_doc.items()
        ]
    }

@app.post("/search")
def search(req: SearchRequestInput):
    document_ids = req.document_ids or []
    if req.filters and req.filters.get("document_ids"):
        document_ids = req.filters["document_ids"]
        document_ids = document_ids if isinstance(document_ids, list) else [str(document_ids)]

    filters = SearchFilter(document_ids=document_ids)
    if req.filters:
        if req.filters.get("categories"):
            filters.categories = req.filters["categories"]
        if req.filters.get("tags"):
            filters.tags = req.filters["tags"]
        if req.filters.get("metadata"):
            filters.metadata = req.filters["metadata"]

    search_request = SearchRequest(
        query=Query(text=req.query, top_k=req.top_k, filters=filters)
    )

    retriever = RetrieverFactory.create(
        strategy=RetrievalStrategy.DENSE,
        embedding_model=embedding_model,
        vector_store=vector_store,
        citation_builder=CitationBuilderFactory.create(),
    )

    pipeline = RetrievalPipeline(retriever=retriever, evaluator=None)
    result = pipeline.retrieve(search_request)

    return {
        "results": [
            {
                "id": str(r.knowledge_unit.id),
                "documentId": r.knowledge_unit.document_id or "",
                "documentTitle": r.knowledge_unit.metadata.get("document_title")
                    or r.knowledge_unit.document_id or "",
                "pageStart": r.knowledge_unit.page_start,
                "pageEnd": r.knowledge_unit.page_end,
                "section": r.knowledge_unit.section.title if r.knowledge_unit.section else None,
                "subsection": r.knowledge_unit.subsection,
                "snippet": r.knowledge_unit.text[:250],
                "text": r.knowledge_unit.text,
                "score": float(r.similarity_score),
                "metadata": {},
            }
            for r in result.retrieved_units
        ],
        "citations": [
            {
                "id": str(c.retrieved_unit.knowledge_unit.id),
                "documentTitle": c.title,
                "section": c.section,
                "pageStart": c.page_start,
                "pageEnd": c.page_end,
                "snippet": c.snippet,
                "confidence": float(c.confidence),
            }
            for c in result.citations
        ],
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)