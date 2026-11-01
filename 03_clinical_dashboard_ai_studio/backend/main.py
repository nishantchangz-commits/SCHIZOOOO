"""
Main FastAPI Application Entrypoint.
"""

from __future__ import annotations

import sys
from pathlib import Path
from contextlib import asynccontextmanager

# Ensure workspace site-packages is in sys.path
WORKSPACE_SITE_PACKAGES = Path(__file__).resolve().parent.parent / "site-packages"
if WORKSPACE_SITE_PACKAGES.exists() and str(WORKSPACE_SITE_PACKAGES) not in sys.path:
    sys.path.insert(0, str(WORKSPACE_SITE_PACKAGES))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from backend.routers.chat import router as chat_router
from backend.services.rag_service import rag_service, ingest_documents_from_data_dir
from backend.config import STANDARD_DISCLAIMER
from backend.showcase_html import SHOWCASE_HTML

STATIC_DIR = Path(__file__).resolve().parent / "static"
NOTEBOOKLM_FILE = Path(__file__).resolve().parent.parent / "notebooklm" / "notebooklm_schizophrenia_source_pack.md"

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure local knowledge base is ingested and ready
    print("[Startup] Initializing NeuroRetrieval Knowledge Base...")
    status = rag_service.get_status()
    if status.get("total_chunks", 0) == 0:
        print("[Startup] Knowledge base is empty. Running initial ingestion...")
        ingest_documents_from_data_dir()
    print("[Startup] Backend initialized and ready.")
    yield
    print("[Shutdown] Cleaning up resources...")

app = FastAPI(
    title="NeuroRetrieval & Mental Health Psychoeducation API",
    description="Safety-first conversational retrieval system for EEG biomarkers and schizophrenia psychoeducation.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for Streamlit frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static Files (plots and visualizations)
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# Include Chat & Retrieval Router
app.include_router(chat_router)

@app.get("/", response_class=HTMLResponse, tags=["General"])
async def root():
    """Serves the interactive project showcase page."""
    return HTMLResponse(content=SHOWCASE_HTML)

@app.get("/showcase", response_class=HTMLResponse, tags=["General"])
async def showcase_page():
    """Direct route for project showcase."""
    return HTMLResponse(content=SHOWCASE_HTML)

@app.get("/api/download/notebooklm-source-pack", tags=["NotebookLM"])
async def download_notebooklm_pack():
    """Allows downloading the curated Google NotebookLM research source pack."""
    if NOTEBOOKLM_FILE.exists():
        return FileResponse(
            path=str(NOTEBOOKLM_FILE),
            filename="notebooklm_schizophrenia_source_pack.md",
            media_type="text/markdown"
        )
    return {"error": "Source pack not found"}

@app.get("/api/health", tags=["General"])
async def health_check():
    kb_info = rag_service.get_status()
    return {
        "status": "healthy",
        "knowledge_base": kb_info,
        "safety_guardrails": "active"
    }

if __name__ == "__main__":
    import uvicorn
    from backend.config import BACKEND_HOST, BACKEND_PORT
    uvicorn.run("backend.main:app", host=BACKEND_HOST, port=BACKEND_PORT, reload=True)
