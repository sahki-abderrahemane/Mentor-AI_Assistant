from enum import Enum


class RetrievalStrategy(str, Enum):
    """
    Retrieval algorithm strategy.
    """

    DENSE = "dense"
    SPARSE = "sparse"
    HYBRID = "hybrid"
    PARENT = "parent"
    MULTI_QUERY = "multi_query"


class RetrieverType(str, Enum):
    """
    Retriever implementation.
    """

    VECTOR = "vector"
    BM25 = "bm25"
    HYBRID = "hybrid"


class RankingMethod(str, Enum):
    """
    Ranking strategy.
    """

    NONE = "none"
    SIMILARITY = "similarity"
    BM25 = "bm25"
    CROSS_ENCODER = "cross_encoder"
    RECIPROCAL_RANK_FUSION = "rrf"


class EmbeddingProvider(str, Enum):
    """
    Supported embedding providers.
    """

    SENTENCE_TRANSFORMERS = "sentence_transformers"
    BGE = "bge"
    E5 = "e5"
    OPENAI = "openai"
    JINA = "jina"


class VectorStoreType(str, Enum):
    """
    Supported vector databases.
    """

    FAISS = "faiss"
    CHROMA = "chroma"
    QDRANT = "qdrant"
    MILVUS = "milvus"
    PINECONE = "pinecone"


class RetrievalStage(str, Enum):
    """
    Retrieval pipeline stages.
    """

    QUERY_RECEIVED = "query_received"

    QUERY_EMBEDDED = "query_embedded"

    SEARCHED = "searched"

    RANKED = "ranked"

    CITATIONS_BUILT = "citations_built"

    COMPLETED = "completed"


class RetrievalStatus(str, Enum):
    """
    Execution status.
    """

    PENDING = "pending"

    RUNNING = "running"

    SUCCESS = "success"

    FAILED = "failed"