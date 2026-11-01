"""
Schizophrenia & EEG Neurocognition Agent.

Handles the conversational loop by combining:
1. Retrieved psychoeducational/neuroscientific context from `rag_service.py`
2. Strict clinical safety rules & crisis intercepts from `safety_filter.py`
3. LLM generation (via Gemini API / google-genai) with safe, reality-grounded fallback
"""

from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

# Ensure local site-packages is available in path
WORKSPACE_SITE_PACKAGES = Path(__file__).resolve().parent.parent.parent / "site-packages"
if WORKSPACE_SITE_PACKAGES.exists() and str(WORKSPACE_SITE_PACKAGES) not in sys.path:
    sys.path.insert(0, str(WORKSPACE_SITE_PACKAGES))

from backend.config import GEMINI_API_KEY, LLM_MODEL, STANDARD_DISCLAIMER
from backend.services.safety_filter import (
    evaluate_safety,
    sanitize_and_format_response,
    CRISIS_FALLBACK_MESSAGE,
    SYSTEM_INSTRUCTION_TEMPLATE,
    SafetyCheckResult
)
from backend.services.rag_service import query_knowledge_base

# ------------------------------------------------------------------------------
# DATA MODELS FOR CHAT
# ------------------------------------------------------------------------------

class SourceSnippet(BaseModel):
    source: str
    text: str
    score: float
    chunk_id: Optional[str] = None


class AgentResponse(BaseModel):
    response: str
    disclaimer: str = STANDARD_DISCLAIMER
    sources: List[SourceSnippet] = Field(default_factory=list)
    crisis_triggered: bool = False
    safety_flags: List[str] = Field(default_factory=list)
    ungrounded_beliefs_flagged: bool = False
    reality_grounding_applied: bool = False
    model_used: str = LLM_MODEL


# ------------------------------------------------------------------------------
# AGENT CLASS
# ------------------------------------------------------------------------------

class SchizophreniaEEGAgent:
    def __init__(self, model_name: str = LLM_MODEL, api_key: str = GEMINI_API_KEY):
        self.model_name = model_name
        self.api_key = api_key or os.getenv("GEMINI_API_KEY", "")
        self.client = None
        self._init_client()

    def _init_client(self):
        """Initializes Google GenAI client if API key is provided."""
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
                print(f"[Agent] Google GenAI client initialized with model '{self.model_name}'.")
            except Exception as e:
                print(f"[Agent] Failed to initialize Google GenAI client: {e}")
                self.client = None
        else:
            print("[Agent] No GEMINI_API_KEY detected. Agent running in autonomous synthesis mode.")

    def run_conversation_step(
        self,
        user_message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        top_k_rag: int = 3
    ) -> AgentResponse:
        """
        Processes a single conversational turn through the safety and RAG pipeline.
        """
        # Step 1: Input Safety Guardrail Scan
        safety_eval: SafetyCheckResult = evaluate_safety(user_message)

        # Immediate override if crisis detected
        if safety_eval.crisis_detected:
            return AgentResponse(
                response=CRISIS_FALLBACK_MESSAGE,
                disclaimer=STANDARD_DISCLAIMER,
                sources=[],
                crisis_triggered=True,
                safety_flags=safety_eval.crisis_keywords,
                ungrounded_beliefs_flagged=safety_eval.ungrounded_detected,
                reality_grounding_applied=False,
                model_used="safety_filter_override"
            )

        # Step 2: RAG Context Retrieval
        retrieved_snippets = query_knowledge_base(user_message, top_k=top_k_rag)
        source_objects = [
            SourceSnippet(
                source=s.get("source", "Knowledge Base"),
                text=s.get("text", ""),
                score=s.get("score", 0.0),
                chunk_id=s.get("chunk_id")
            )
            for s in retrieved_snippets
        ]

        # Step 3: Format Context and System Prompt
        context_block = "\n\n".join([
            f"[Source: {s.source} (Relevance: {s.score})]\n{s.text}"
            for s in source_objects
        ])

        system_prompt = SYSTEM_INSTRUCTION_TEMPLATE
        if safety_eval.ungrounded_detected:
            system_prompt += (
                "\n\nCRITICAL REALITY-GROUNDING DIRECTIVE:\n"
                "The user message may express ungrounded beliefs, persecutory themes, or non-reality-based perceptions. "
                "1. Empathize with the emotion (e.g., 'That sounds frightening and overwhelming').\n"
                "2. DO NOT validate or confirm the factual reality of the delusion, conspiracy, or surveillance.\n"
                "3. Offer calming reality-anchoring or 5-4-3-2-1 sensory grounding techniques.\n"
                "4. Gently encourage checking in with their doctor or psychiatric care team."
            )

        full_prompt = (
            f"{system_prompt}\n\n"
            f"--- RELEVANT CLINICAL & NEUROSCIENCE KNOWLEDGE BASE ---\n"
            f"{context_block if context_block else 'No specific snippet retrieved; adhere to general psychoeducation principles.'}\n\n"
            f"--- USER INQUIRY ---\n{user_message}"
        )

        # Step 4: Generate Response (LLM or Knowledge Synthesizer)
        raw_response = ""
        model_used = self.model_name

        if self.client is not None:
            try:
                # Call Gemini API
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=full_prompt,
                )
                raw_response = response.text or ""
            except Exception as e:
                print(f"[Agent] LLM API call error ({e}). Generating knowledge base synthesis.")
                raw_response = self._synthesize_grounded_response(
                    user_message=user_message,
                    sources=source_objects,
                    ungrounded_flag=safety_eval.ungrounded_detected
                )
                model_used = "offline_psychoeducation_synthesizer"
        else:
            # Autonomous grounded synthesis using RAG snippets
            raw_response = self._synthesize_grounded_response(
                user_message=user_message,
                sources=source_objects,
                ungrounded_flag=safety_eval.ungrounded_detected
            )
            model_used = "offline_psychoeducation_synthesizer"

        # Step 5: Post-Generation Safety Evaluation (Anti-hallucination / Crisis check)
        out_safety: SafetyCheckResult = evaluate_safety(raw_response)
        if out_safety.crisis_detected:
            return AgentResponse(
                response=CRISIS_FALLBACK_MESSAGE,
                disclaimer=STANDARD_DISCLAIMER,
                sources=[],
                crisis_triggered=True,
                safety_flags=out_safety.crisis_keywords,
                ungrounded_beliefs_flagged=safety_eval.ungrounded_detected,
                reality_grounding_applied=True,
                model_used="safety_filter_override"
            )

        # Step 6: Sanitize & Append Standard Non-Clinical Disclaimer
        final_text = sanitize_and_format_response(
            response_text=raw_response,
            crisis_triggered=False,
            include_disclaimer=True
        )

        return AgentResponse(
            response=final_text,
            disclaimer=STANDARD_DISCLAIMER,
            sources=source_objects,
            crisis_triggered=False,
            safety_flags=[],
            ungrounded_beliefs_flagged=safety_eval.ungrounded_detected,
            reality_grounding_applied=safety_eval.ungrounded_detected,
            model_used=model_used
        )

    def _synthesize_grounded_response(
        self,
        user_message: str,
        sources: List[SourceSnippet],
        ungrounded_flag: bool
    ) -> str:
        """
        Generates an evidence-based, compassionate, reality-grounded response
        when running offline or when LLM API is unreachable.
        """
        if ungrounded_flag:
            return (
                "I can hear how intensely distressing and overwhelming these thoughts and sensations are for you right now. "
                "Feeling watched, monitored, or unsettled can cause tremendous anxiety and emotional exhaustion.\n\n"
                "While I cannot confirm or validate those experiences, your feelings of distress are completely valid and real. "
                "When your nervous system feels overloaded, grounding yourself in physical reality can help:\n\n"
                "- **Try the 5-4-3-2-1 Grounding Method:** Look around the room right now and name 5 things you can see, "
                "4 things you can physically touch (like your chair or desk), 3 sounds you can hear, 2 things you can smell, and 1 sip of water you can taste.\n"
                "- **Regulate Breathing:** Take a slow 4-second inhale through your nose and a long, gentle 6-second exhale through your mouth.\n\n"
                "Because intense fears or persecutory thoughts are exhausting to manage alone, we strongly encourage reaching out "
                "to a licensed psychiatrist, mental health counselor, or trusted doctor who can offer a safe, confidential space."
            )

        # Context-based synthesis for neuroscience / psychoeducation queries
        lower_msg = user_message.lower()

        if any(term in lower_msg for term in ["eeg", "n100", "sensory attenuation", "corollary discharge", "biomarker"]):
            return (
                "### Neurophysiological Overview: EEG & Sensory Attenuation in Schizophrenia\n\n"
                "In electrophysiological neuroscience, a critical feature of sensory processing is the brain's ability "
                "to distinguish between self-generated actions and external stimuli.\n\n"
                "- **Corollary Discharge & Efference Copy:** When the brain initiates an action (such as speaking or pressing a button to produce a tone), "
                "the motor cortex sends an internal predictive signal (efference copy) to sensory cortices. This dampens the sensory response to expected self-generated stimuli.\n"
                "- **The N100 Event-Related Potential (ERP):** In healthy individuals, the N100 amplitude is significantly attenuated (reduced) for self-generated sounds. "
                "In individuals with schizophrenia, research demonstrates a failure of this sensory attenuation: the N100 amplitude does not decrease normally.\n"
                "- **Link to Auditory Hallucinations:** When this corollary discharge mechanism is impaired, internal thoughts or subvocal speech may fail to be tagged "
                "as self-generated, potentially causing them to be perceived as external voices."
            )

        if any(term in lower_msg for term in ["coping", "technique", "cbt", "grounding", "help", "overwhelm"]):
            return (
                "### Evidence-Based Coping Strategies and Grounding Techniques\n\n"
                "When experiencing heightened distress, sensory overload, or intrusive thoughts, the following evidence-based techniques can provide support:\n\n"
                "1. **The 5-4-3-2-1 Sensory Grounding Technique:**\n"
                "   - 5 things you can see around your immediate room.\n"
                "   - 4 textures or objects you can physically touch.\n"
                "   - 3 real ambient sounds you can hear.\n"
                "   - 2 pleasant scents you can notice.\n"
                "   - 1 taste (a sip of cool water or mint).\n\n"
                "2. **Acoustic Distraction & Subvocal Disruption:**\n"
                "   - Listening to calming instrumental music or engaging podcasts with headphones.\n"
                "   - Reading text aloud or softly humming, which engages vocal tract musculature and disrupts subvocal auditory verbal phenomena.\n\n"
                "3. **Box Breathing:** Inhale for 4 seconds, hold for 4 seconds, exhale smoothly for 4 seconds, and rest for 4 seconds."
            )

        # Default clinical psychoeducation synthesis
        context_summary = ""
        if sources:
            top_snippet = sources[0].text[:400]
            context_summary = f"\n\n**Key Knowledge Base Context:**\n> {top_snippet}...\n"

        return (
            f"### Psychoeducational Summary\n\n"
            f"Schizophrenia spectrum conditions involve complex neurochemical, neurodevelopmental, and psychosocial factors. "
            f"Key symptoms can include sensory anomalies (hallucinations), firmly held beliefs (delusions), and alterations in motivation or emotional expression.{context_summary}\n\n"
            f"Empirical clinical research highlights that combining evidence-based psychotherapy (such as CBT for Psychosis), "
            f"consistent social rhythm routines, and professional psychiatric care provides the foundation for long-term functional recovery."
        )


# Singleton agent instance
schizophrenia_agent = SchizophreniaEEGAgent()
