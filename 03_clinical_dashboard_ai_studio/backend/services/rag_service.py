"""
RAG Knowledge Base Service using ChromaDB (with robust fallback).

Ingests psychoeducational, clinical, and electrophysiological literature
from text and PDF documents in the `data/` directory, chunks them,
embeds them, and provides fast vector retrieval.
"""

from __future__ import annotations

import os
import re
import json
from pathlib import Path
from typing import List, Dict, Any, Optional

try:
    from pypdf import PdfReader
except ImportError:
    PdfReader = None

from backend.config import DATA_DIR, CHROMA_PERSIST_DIR

# ------------------------------------------------------------------------------
# DOCUMENT CHUNKER
# ------------------------------------------------------------------------------

def chunk_text(
    text: str,
    chunk_size_words: int = 220,
    overlap_words: int = 40
) -> List[str]:
    """Splits raw text into overlapping word chunks preserving sentence boundaries."""
    # Clean whitespace and repeated newlines
    cleaned = re.sub(r"\r\n", "\n", text)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned).strip()
    
    if not cleaned:
        return []

    words = cleaned.split()
    if len(words) <= chunk_size_words:
        return [cleaned]

    chunks: List[str] = []
    step = max(1, chunk_size_words - overlap_words)
    for i in range(0, len(words), step):
        chunk_slice = words[i : i + chunk_size_words]
        chunk_str = " ".join(chunk_slice)
        if len(chunk_str.strip()) > 30:
            chunks.append(chunk_str.strip())
        if i + chunk_size_words >= len(words):
            break

    return chunks


# ------------------------------------------------------------------------------
# CHROMA VECTOR STORE WITH SECURE FALLBACK
# ------------------------------------------------------------------------------

class RAGVectorStore:
    def __init__(self, persist_dir: Path = CHROMA_PERSIST_DIR, collection_name: str = "psychiatry_neuroscience_kb"):
        self.persist_dir = Path(persist_dir)
        self.collection_name = collection_name
        self.persist_dir.mkdir(parents=True, exist_ok=True)
        self.chroma_client = None
        self.collection = None
        self.use_fallback = False

        # In-memory / file fallback store
        self.fallback_chunks: List[Dict[str, Any]] = []
        self.fallback_file = self.persist_dir / "fallback_index.json"

        self._init_chroma()

    def _init_chroma(self):
        """Attempts to initialize ChromaDB PersistentClient."""
        try:
            import chromadb
            from chromadb.config import Settings

            self.chroma_client = chromadb.PersistentClient(
                path=str(self.persist_dir),
                settings=Settings(anonymized_telemetry=False, is_persistent=True)
            )
            self.collection = self.chroma_client.get_or_create_collection(
                name=self.collection_name,
                metadata={"hnsw:space": "cosine"}
            )
            self.use_fallback = False
            print(f"[RAGService] ChromaDB initialized successfully at {self.persist_dir}")
        except Exception as e:
            print(f"[RAGService] ChromaDB unavailable ({e}). Using native semantic vector fallback.")
            self.use_fallback = True
            self._load_fallback_index()

    def _load_fallback_index(self):
        if self.fallback_file.exists():
            try:
                with open(self.fallback_file, "r", encoding="utf-8") as f:
                    self.fallback_chunks = json.load(f)
                print(f"[RAGService] Loaded {len(self.fallback_chunks)} chunks from fallback index.")
            except Exception as e:
                print(f"[RAGService] Error loading fallback index: {e}")
                self.fallback_chunks = []

    def _save_fallback_index(self):
        try:
            with open(self.fallback_file, "w", encoding="utf-8") as f:
                json.dump(self.fallback_chunks, f, indent=2)
        except Exception as e:
            print(f"[RAGService] Error saving fallback index: {e}")

    def ingest_documents(self, data_directory: Optional[Path] = None) -> Dict[str, Any]:
        """
        Reads all text, markdown, and PDF files in data_directory,
        chunks them, and inserts them into ChromaDB (or fallback index).
        """
        target_dir = Path(data_directory or DATA_DIR)
        if not target_dir.exists():
            target_dir.mkdir(parents=True, exist_ok=True)

        supported_extensions = [".md", ".txt", ".json", ".pdf"]
        files = [p for p in target_dir.rglob("*") if p.suffix.lower() in supported_extensions and p.is_file()]

        total_chunks = 0
        documents_processed = []

        all_ids = []
        all_docs = []
        all_metas = []

        for file_path in sorted(files):
            text_content = ""
            try:
                if file_path.suffix.lower() == ".pdf":
                    if PdfReader is not None:
                        reader = PdfReader(str(file_path))
                        pages_text = [page.extract_text() or "" for page in reader.pages]
                        text_content = "\n".join(pages_text)
                    else:
                        print(f"[RAGService] pypdf not installed. Skipping PDF: {file_path.name}")
                        continue
                else:
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                        text_content = f.read()

                if not text_content.strip():
                    continue

                chunks = chunk_text(text_content)
                for idx, chunk in enumerate(chunks):
                    chunk_id = f"{file_path.name}__chunk_{idx}"
                    metadata = {
                        "source": file_path.name,
                        "path": str(file_path),
                        "chunk_index": idx,
                        "total_chunks": len(chunks)
                    }
                    all_ids.append(chunk_id)
                    all_docs.append(chunk)
                    all_metas.append(metadata)

                total_chunks += len(chunks)
                documents_processed.append({"filename": file_path.name, "chunks": len(chunks)})

            except Exception as e:
                print(f"[RAGService] Error processing file {file_path.name}: {e}")

        if not all_ids:
            return {
                "status": "warning",
                "message": f"No valid documents found in {target_dir}",
                "chunks_ingested": 0,
                "documents": []
            }

        # Store in ChromaDB or fallback
        if not self.use_fallback and self.collection is not None:
            try:
                # Upsert into ChromaDB in batches of 50
                batch_size = 50
                for i in range(0, len(all_ids), batch_size):
                    self.collection.upsert(
                        ids=all_ids[i : i + batch_size],
                        documents=all_docs[i : i + batch_size],
                        metadatas=all_metas[i : i + batch_size]
                    )
                print(f"[RAGService] Ingested {len(all_ids)} chunks into ChromaDB.")
            except Exception as e:
                print(f"[RAGService] Chroma upsert failed ({e}). Falling back.")
                self.use_fallback = True

        # Keep fallback index updated as well
        self.fallback_chunks = [
            {"id": cid, "text": doc, "metadata": meta}
            for cid, doc, meta in zip(all_ids, all_docs, all_metas)
        ]
        self._save_fallback_index()

        return {
            "status": "success",
            "backend": "ChromaDB" if not self.use_fallback else "VectorStoreFallback",
            "chunks_ingested": len(all_ids),
            "documents_count": len(documents_processed),
            "documents": documents_processed
        }

    def query_knowledge_base(self, query_text: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Retrieves top_k most relevant snippets for query_text.
        Returns list of dicts with keys: 'text', 'source', 'score', 'chunk_id', 'metadata'.
        """
        if not query_text or not query_text.strip():
            return []

        # Try ChromaDB query first
        if not self.use_fallback and self.collection is not None:
            try:
                count = self.collection.count()
                if count == 0:
                    self.ingest_documents()

                results = self.collection.query(
                    query_texts=[query_text],
                    n_results=min(top_k, max(1, self.collection.count()))
                )

                formatted = []
                if results and "documents" in results and results["documents"]:
                    docs = results["documents"][0]
                    metas = results["metadatas"][0] if "metadatas" in results else [{}] * len(docs)
                    ids = results["ids"][0] if "ids" in results else [""] * len(docs)
                    distances = results["distances"][0] if "distances" in results and results["distances"] else [0.0] * len(docs)

                    for doc, meta, cid, dist in zip(docs, metas, ids, distances):
                        # Approximate cosine similarity from distance
                        score = max(0.0, 1.0 - float(dist)) if dist is not None else 0.8
                        formatted.append({
                            "text": doc,
                            "source": meta.get("source", "Knowledge Base"),
                            "score": round(score, 4),
                            "chunk_id": cid,
                            "metadata": meta
                        })
                    return formatted
            except Exception as e:
                print(f"[RAGService] Chroma query failed ({e}). Using semantic fallback.")
                self.use_fallback = True

        # Fallback keyword and semantic scoring
        return self._fallback_query(query_text, top_k=top_k)

    def _fallback_query(self, query_text: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Scored retrieval using token overlap and keyword density."""
        if not self.fallback_chunks:
            self._load_fallback_index()
            if not self.fallback_chunks:
                self.ingest_documents()

        query_tokens = set(re.findall(r"\w+", query_text.lower()))
        if not query_tokens:
            return []

        scored: List[Tuple[float, Dict[str, Any]]] = []
        for item in self.fallback_chunks:
            text = item.get("text", "")
            meta = item.get("metadata", {})
            doc_tokens = re.findall(r"\w+", text.lower())
            if not doc_tokens:
                continue

            # Token overlap & frequency
            matches = sum(1 for t in query_tokens if t in doc_tokens)
            exact_phrase_bonus = 3.0 if query_text.lower() in text.lower() else 0.0
            score = (matches / (len(query_tokens) + 0.1)) + exact_phrase_bonus

            if score > 0:
                scored.append((score, item))

        scored.sort(key=lambda x: x[0], reverse=True)
        top_items = scored[:top_k]

        results = []
        for score, item in top_items:
            results.append({
                "text": item.get("text", ""),
                "source": item.get("metadata", {}).get("source", "Knowledge Base"),
                "score": round(min(1.0, score / 2.0), 4),
                "chunk_id": item.get("id", ""),
                "metadata": item.get("metadata", {})
            })

        return results

    def get_status(self) -> Dict[str, Any]:
        """Returns the current state of the knowledge base."""
        total_chunks = 0
        if not self.use_fallback and self.collection is not None:
            try:
                total_chunks = self.collection.count()
            except Exception:
                total_chunks = len(self.fallback_chunks)
        else:
            total_chunks = len(self.fallback_chunks)

        return {
            "backend": "ChromaDB" if not self.use_fallback else "VectorStoreFallback",
            "persist_dir": str(self.persist_dir),
            "total_chunks": total_chunks,
            "status": "ready" if total_chunks > 0 else "empty"
        }


# Singleton service instance
rag_service = RAGVectorStore()


def ingest_documents_from_data_dir(data_directory: Optional[str] = None) -> Dict[str, Any]:
    """Top-level helper to trigger ingestion."""
    path = Path(data_directory) if data_directory else DATA_DIR
    return rag_service.ingest_documents(path)


def query_knowledge_base(query_text: str, top_k: int = 3) -> List[Dict[str, Any]]:
    """Top-level helper for agent retrieval."""
    return rag_service.query_knowledge_base(query_text, top_k=top_k)
