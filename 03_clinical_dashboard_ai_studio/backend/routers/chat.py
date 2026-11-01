"""
FastAPI Router for Mental Health & Neurological Retrieval Chat API.
"""

from __future__ import annotations

import sys
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

# Ensure workspace packages are available
WORKSPACE_SITE_PACKAGES = Path(__file__).resolve().parent.parent.parent / "site-packages"
if WORKSPACE_SITE_PACKAGES.exists() and str(WORKSPACE_SITE_PACKAGES) not in sys.path:
    sys.path.insert(0, str(WORKSPACE_SITE_PACKAGES))

from backend.agents.schizophrenia_agent import (
    schizophrenia_agent,
    AgentResponse,
    SourceSnippet
)
from backend.services.rag_service import (
    rag_service,
    ingest_documents_from_data_dir
)

router = APIRouter(prefix="/api", tags=["Chat & Retrieval"])

# ------------------------------------------------------------------------------
# REQUEST & RESPONSE SCHEMAS
# ------------------------------------------------------------------------------

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User prompt or question")
    session_id: Optional[str] = Field("default", description="Session identifier for tracking")
    top_k: Optional[int] = Field(3, ge=1, le=10, description="Number of context snippets to retrieve")


class IngestResponse(BaseModel):
    status: str
    backend: str
    chunks_ingested: int
    documents_count: int
    documents: List[dict]


# ------------------------------------------------------------------------------
# ENDPOINTS
# ------------------------------------------------------------------------------

@router.post("/chat", response_model=AgentResponse, status_code=status.HTTP_200_OK)
async def chat_endpoint(payload: ChatRequest):
    """
    Core conversational endpoint:
    1. Intercepts acute crisis inputs and provides helpline fallback.
    2. Flags ungrounded / delusional beliefs to apply calm reality-grounding.
    3. Retrieves top relevant clinical & EEG psychoeducation snippets via RAG.
    4. Generates a grounded, empathetic, non-diagnostic response.
    5. Appends non-clinical psychiatric disclaimer.
    """
    clean_message = payload.message.strip()
    if not clean_message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User message cannot be empty or solely whitespace."
        )

    try:
        response: AgentResponse = schizophrenia_agent.run_conversation_step(
            user_message=clean_message,
            top_k_rag=payload.top_k or 3
        )
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while processing the conversation: {str(e)}"
        )


@router.get("/kb/status")
async def get_kb_status():
    """Returns the current status of the ChromaDB knowledge base."""
    return rag_service.get_status()


@router.post("/kb/ingest", response_model=IngestResponse)
async def trigger_ingestion():
    """Triggers ingestion of clinical and psychoeducational files in data/."""
    result = ingest_documents_from_data_dir()
    return result
