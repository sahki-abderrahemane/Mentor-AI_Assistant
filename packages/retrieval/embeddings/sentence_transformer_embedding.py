"""
packages/retrieval/embeddings/sentence_transformer_embedding.py
"""

from __future__ import annotations

from document_processing.utils import text
from sentence_transformers import SentenceTransformer

from retrieval.domain.embedding import Embedding

from .base_embedding import BaseEmbeddingModel
from .config import EmbeddingConfig


class SentenceTransformerEmbedding(BaseEmbeddingModel):
    """
    Embedding model backed by SentenceTransformers.
    """

    def __init__(
        self,
        config: EmbeddingConfig,
    ) -> None:
        super().__init__(config)

        self._model: SentenceTransformer | None = None

    @property
    def model(
        self,
    ) -> SentenceTransformer:
        """
        Lazily load the SentenceTransformer model.
        """

        if self._model is None:

            self._model = SentenceTransformer(
                model_name_or_path=self.config.model_name,
                device=self.config.device,
                trust_remote_code=self.config.trust_remote_code,
            )

        return self._model

    def embed_query(
        self,
        text: str,
    ) -> Embedding:
        """
        Generate an embedding for a search query.
        """

        text = self._prepare_query(text)

        vector = self.model.encode(
            text,
            normalize_embeddings=False,
            convert_to_numpy=False,
        )

        return self._build_embedding(list(vector))

    def embed_document(
        self,
        text: str,
    ) -> Embedding:
    
        return self.embed_documents(
        [text],
    )[0]    

    def embedding_dimension(
        self,
    ) -> int:
        """
        Return the embedding dimension.
        """

        return self.model.get_embedding_dimension()

    def embed_documents(
        self,
        texts: list[str],
    ) -> list[Embedding]:
    
        vectors = self.model.encode(
        texts,
        normalize_embeddings=self.config.normalize_embeddings,
        convert_to_numpy=True,
        show_progress_bar=False,
    )

        return [
        Embedding(
            vector=vector.astype(float).tolist(),
            dimensions=len(vector),
            model_name=self.config.model_name,
            normalized=self.config.normalize_embeddings,
        )
        for vector in vectors
    ]

    def model_name(
        self,
    ) -> str:
        """
        Return the embedding model name.
        """

        return self.config.model_name

    def _prepare_query(
        self,
        text: str,
    ) -> str:
        """
        Apply query prefixes required by some embedding models.
        """

        if "bge" in self.config.model_name.lower():
            return f"Represent this sentence for searching relevant passages: {text}"

        if "e5" in self.config.model_name.lower():
            return f"query: {text}"

        return text

    def _prepare_document(
        self,
        text: str,
    ) -> str:
        """
        Apply document prefixes required by some embedding models.
        """

        if "e5" in self.config.model_name.lower():
            return f"passage: {text}"

        return text