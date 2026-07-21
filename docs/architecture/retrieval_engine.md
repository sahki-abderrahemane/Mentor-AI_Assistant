# Retrieval Engine

## Overview

The Retrieval Engine is the core component responsible for retrieving semantically relevant Knowledge Units from the MentorAI knowledge base.

It acts as the bridge between the Document Processing Engine (DPE) and downstream Large Language Models (LLMs), transforming a user's natural language query into a ranked collection of contextual Knowledge Units enriched with citations and optional evaluation metrics.

The implementation follows a modular architecture based on the principles of SOLID, Separation of Concerns, Dependency Injection, and the Factory pattern. Each stage of the retrieval process is encapsulated in an independent component, allowing implementations to evolve without affecting the overall pipeline.

---

# Objectives

The Retrieval Engine is designed to:

- Perform semantic retrieval using dense vector embeddings.
- Support multiple retrieval strategies.
- Separate indexing from retrieval.
- Produce ranked search results.
- Generate source citations.
- Support retrieval evaluation.
- Remain extensible for future retrieval algorithms.

---

# Architecture

The Retrieval Engine is organized into several independent modules.

```
                        User Query
                             │
                             ▼
                     SearchRequest
                             │
                             ▼
                  RetrievalPipeline
                             │
                             ▼
                        Retriever
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
            DenseRetriever    HybridRetriever
                    │
                    ▼
             Embedding Model
                    │
                    ▼
              Vector Store
                    │
                    ▼
          RetrievedKnowledgeUnits
                    │
                    ▼
            Similarity Ranker
                    │
                    ▼
          DefaultCitationBuilder
                    │
                    ▼
               SearchResult
                    │
                    ▼
          EvaluationService (optional)
```

---

# Package Organization

```
retrieval/

├── contracts/
├── domain/
├── embeddings/
├── vectorstores/
├── indexing/
├── retrievers/
├── rankers/
├── citations/
├── evaluation/
├── factories/
├── services/
├── tests/
└── documentation/
```

Each package has a single responsibility and communicates only through well-defined contracts or domain models.

---

# Core Components

## Query Layer

The retrieval process begins with a `SearchRequest`.

It contains:

- Query
- Retrieval strategy
- Creation timestamp

The embedded `Query` contains:

- query text
- requested top-k
- optional filters
- metadata

---

## Embedding Layer

The embedding layer converts natural language into dense vector representations.

Current implementation:

- SentenceTransformerEmbedding

Future implementations may include:

- BGE
- E5
- OpenAI
- Jina

All embedding providers implement the common `EmbeddingModel` contract.

---

## Vector Store Layer

The vector database stores dense embeddings generated during indexing.

Current implementation:

- FAISS

Responsibilities include:

- indexing Knowledge Units
- similarity search
- persistence
- loading existing indexes

Future implementations include:

- Chroma
- Qdrant
- Milvus
- Pinecone

---

## Indexing Layer

The indexing pipeline transforms Knowledge Units into searchable vectors.

Workflow:

```
Knowledge Unit
      │
      ▼
Embedding Model
      │
      ▼
Embedding
      │
      ▼
Vector Store
```

Indexing is executed independently from retrieval, allowing the knowledge base to be updated incrementally.

---

## Retrieval Layer

Retrievers implement different retrieval strategies.

Current implementations:

- DenseRetriever
- HybridRetriever

Each retriever returns a `SearchResult`.

Responsibilities:

- embedding the query
- searching the vector database
- metadata filtering
- ranking
- citation generation

---

## Ranking Layer

The ranking layer determines the final ordering of retrieved Knowledge Units.

Current implementation:

- SimilarityRanker

Future implementations:

- Cross Encoder
- BM25
- Reciprocal Rank Fusion (RRF)

---

## Citation Layer

The citation builder transforms retrieved Knowledge Units into user-friendly citations.

Each citation contains:

- document title
- section
- page numbers
- snippet
- confidence

This enables transparent and explainable responses.

---

## Evaluation Layer

The evaluation subsystem measures retrieval quality.

Current metrics:

- Recall@K
- Precision@K
- Hit Rate
- Mean Reciprocal Rank (MRR)

Evaluation is optional and can be executed independently of retrieval.

---

## Factory Layer

Factories centralize component creation.

Current factories include:

- EmbeddingFactory
- VectorStoreFactory
- RetrieverFactory
- RankerFactory
- CitationBuilderFactory
- EvaluationFactory

Factories remove construction logic from the application layer and simplify dependency management.

---

## Retrieval Pipeline

The `RetrievalPipeline` is the orchestration layer of the Retrieval Engine.

It does not implement retrieval algorithms.

Instead, it coordinates existing components.

Workflow:

1. Receive SearchRequest.
2. Delegate retrieval to the configured Retriever.
3. Optionally execute retrieval evaluation.
4. Return the final SearchResult.

This separation keeps orchestration independent from retrieval algorithms.

---

# Domain Models

The Retrieval Engine is built around several immutable domain models.

Main entities include:

- Query
- SearchRequest
- SearchResult
- RetrievedKnowledgeUnit
- RetrievalMetadata
- RetrievalEvent
- Citation
- EvaluationResult

These models provide a consistent interface between all retrieval components.

---

# Design Principles

The Retrieval Engine follows several architectural principles.

## SOLID

Each component has a single responsibility.

Implementations depend on abstractions rather than concrete classes.

New retrieval algorithms can be added without modifying existing code.

---

## Separation of Concerns

Each module owns exactly one concern.

Examples:

- embeddings generate vectors
- vector stores perform similarity search
- retrievers coordinate retrieval
- rankers order results
- citation builders generate citations
- evaluators measure performance

---

## Factory Pattern

Component construction is delegated to factories rather than business logic.

This simplifies dependency injection and future extensibility.

---

## Dependency Injection

Components receive dependencies through constructors.

No module creates its own collaborators.

This improves testing and modularity.

---

# Current Implementations

| Component | Implementation |
|-----------|----------------|
| Embedding Model | SentenceTransformerEmbedding |
| Vector Store | FAISS |
| Retriever | DenseRetriever |
| Hybrid Retriever | HybridRetriever |
| Ranker | SimilarityRanker |
| Citation Builder | DefaultCitationBuilder |
| Evaluation | EvaluationService |

---

# Future Extensions

The architecture is intentionally designed for future expansion.

Planned additions include:

- BM25 retrieval
- Parent retrieval
- Cross-Encoder reranking
- Reciprocal Rank Fusion
- Chroma integration
- Qdrant integration
- Milvus integration
- Pinecone integration
- Additional embedding providers
- Learning-to-Rank algorithms

No architectural changes are required to integrate these components.

---

# Conclusion

The Retrieval Engine provides a modular, extensible, and production-ready semantic retrieval system for MentorAI.

Its layered architecture separates indexing, retrieval, ranking, citation generation, and evaluation into independent components connected through stable abstractions. This design enables straightforward extension, comprehensive testing, and seamless integration with downstream RAG and LLM workflows.