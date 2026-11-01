"""
Safety Guardrails & Clinical Safety Filter Middleware.

Enforces strict psychiatric safety, crisis detection, anti-hallucination /
ungrounded belief handling, non-clinical disclaimers, and emergency fallbacks.
"""

from __future__ import annotations

import re
from typing import List, Tuple, Optional
from pydantic import BaseModel, Field

# ------------------------------------------------------------------------------
# 1. CRISIS HELPLINE OVERRIDE MESSAGE & DISCLAIMERS
# ------------------------------------------------------------------------------

CRISIS_FALLBACK_MESSAGE = (
    "### ⚠️ IMMEDIATE SUPPORT & CRISIS RESOURCES\n\n"
    "It sounds like you may be going through an intensely overwhelming or distressing moment. "
    "Your life, safety, and well-being matter deeply. Please know that you are not alone, "
    "and compassionate support is available right now:\n\n"
    "- **In the US & Canada (24/7, Free, Confidential):**\n"
    "  - **Call or Text:** **988** (Suicide & Crisis Lifeline)\n"
    "  - **Chat Online:** [988lifeline.org](https://988lifeline.org)\n"
    "- **Crisis Text Line:**\n"
    "  - **Text HOME to 741741** (US, UK, Canada) to connect with a crisis counselor.\n"
    "- **Veterans Crisis Line:**\n"
    "  - **Dial 988 and press 1**, or text **838255**.\n"
    "- **The Trevor Project (LGBTQ Youth):**\n"
    "  - **Call 1-866-488-7386** or text **START to 678-678**.\n"
    "- **UK Emergency & Crisis Support:**\n"
    "  - Call **111** (NHS Mental Health Services) or **999** for emergency assistance.\n"
    "  - Call Samaritans at **116 123**.\n"
    "- **International Helplines:**\n"
    "  - If you are outside the US or UK, find immediate local crisis support at [findahelpline.com](https://findahelpline.com) "
    "or [befrienders.org](https://www.befrienders.org).\n"
    "  - Or contact your local emergency hospital or ambulance service immediately.\n\n"
    "*Please reach out to one of these resources right away or go to the nearest emergency department.*"
)

STANDARD_DISCLAIMER = (
    "**Informational Disclaimer:** This application provides psychoeducational and neuroscientific information "
    "for educational purposes only. It is not a clinical diagnostic instrument, prescriber of treatment, "
    "or substitute for evaluation by a qualified psychiatrist, physician, or mental health clinician. "
    "If you are experiencing acute distress, contact emergency services or dial 988."
)

# ------------------------------------------------------------------------------
# 2. STRICT SYSTEM INSTRUCTION TEMPLATE
# ------------------------------------------------------------------------------

SYSTEM_INSTRUCTION_TEMPLATE = """You are a specialized psychoeducational assistant focusing on neurodevelopmental and psychiatric science, with special expertise in EEG biomarkers (such as N100 corollary discharge and sensory attenuation deficits) and Schizophrenia spectrum conditions.

You must strictly adhere to the following four non-negotiable safety guardrails at all times:

1. **NEVER DIAGNOSE OR PRESCRIBE:**
   - Under no circumstances diagnose medical or psychiatric conditions, offer clinical prognosis, or prescribe/alter medications or dosages.
   - Provide only psychoeducational, neuroscientific, and published empirical information.
   - Always encourage the user to discuss specific symptoms or treatment decisions with their licensed psychiatrist or healthcare provider.

2. **NEVER REINFORCE UNGROUNDED BELIEFS OR HALLUCINATIONS:**
   - Do NOT validate, confirm, agree with, or elaborate upon ungrounded beliefs, persecutory delusions, or hallucinations (e.g., claims of government mind-reading chips, surveillance through teeth, alien signals, or persecution).
   - Do NOT mock, argue, or aggressively debate the user's perception.
   - Maintain a calm, neutral, compassionate, and reality-grounded tone.
   - Validate the *emotional experience* of fear or exhaustion without validating the *unfactual premise* (e.g., "It sounds exhausting and distressing to feel constantly watched. While I cannot confirm anyone is tracking you, your stress is very real.").
   - Offer evidence-based grounding techniques (e.g., 5-4-3-2-1 sensory grounding, deep rhythmic breathing) and gently guide toward professional healthcare support.

3. **ALWAYS MAINTAIN NON-CLINICAL TRANSPARENCY:**
   - Frame all information as educational context.
   - Ensure every response emphasizes that this tool is not a replacement for professional psychiatric care.

4. **CRISIS OVERRIDE AWARENESS:**
   - If any indicator of acute self-harm, suicide, severe crisis, or violence is detected, suspend standard informational discourse and deliver immediate crisis helpline resources.

Answer the user's question clearly, concisely, and supportively using the provided context from clinical and neuroscientific literature when available.
"""

# ------------------------------------------------------------------------------
# 3. REGEX KEYWORD PATTERNS & DETECTION LOGIC
# ------------------------------------------------------------------------------

# Patterns indicating acute crisis, self-harm, suicide, or severe psychiatric emergency
CRISIS_PATTERNS = [
    r"\b(?:kill(?:ing)?\s+(?:my|your)self)\b",
    r"\b(?:suicid(?:e|al|ing)?)\b",
    r"\b(?:want\s+to\s+die)\b",
    r"\b(?:end(?:ing)?\s+(?:my|your|one'?s)\s+life)\b",
    r"\b(?:end\s+it\s+all)\b",
    r"\b(?:hurt(?:ing)?\s+(?:my|your)self)\b",
    r"\b(?:harm(?:ing)?\s+(?:my|your)self)\b",
    r"\b(?:self[- ]harm(?:ing)?)\b",
    r"\b(?:cut(?:ting)?\s+(?:(?:my|your)\s+)?wrists?)\b",
    r"\b(?:overdose|od['’]?ing)\b",
    r"\b(?:take\s+all\s+(?:(?:my|your)\s+)?pills)\b",
    r"\b(?:hang(?:ing)?\s+(?:my|your)self)\b",
    r"\b(?:jump\s+off\s+a\s+(?:bridge|building|roof))\b",
    r"\b(?:better\s+off\s+dead)\b",
    r"\b(?:no\s+reason\s+to\s+live)\b",
    r"\b(?:goodbye\s+(?:cruel\s+)?world)\b",
    r"\b(?:write|wrote|leaving)\s+(?:a\s+)?suicide\s+note\b",
    r"\b(?:can['’]t\s+go\s+on\s+living)\b",
    r"\b(?:don['’]t\s+want\s+to\s+wake\s+up)\b",
]

COMPILED_CRISIS_REGEX = [re.compile(p, re.IGNORECASE) for p in CRISIS_PATTERNS]

# Patterns indicating ungrounded persecutory, bizarre, or delusional beliefs requiring reality grounding
UNGROUNDED_PATTERNS = [
    r"\b(?:implant(?:ed)?\s+(?:a\s+)?(?:microchip|chip|transmitter|tracker|device)\s+in\s+my\s+(?:brain|head|body|teeth|tooth|skull))\b",
    r"\b(?:(?:microchip|transmitter|tracker|device)\s+in\s+my\s+(?:brain|head|body|teeth|tooth|skull))\b",
    r"\b(?:microchip(?:ped)?\s+by\s+(?:the\s+)?(?:fbi|cia|government|police|aliens|military))\b",
    r"\b(?:gang[- ]?stalking|gang[- ]?stalked)\b",
    r"\b(?:reading\s+my\s+mind|controlling\s+my\s+thoughts|thought\s+insertion)\b",
    r"\b(?:the\s+government\s+is\s+(?:watching|monitoring|broadcasting|targeting)\s+my\s+thoughts)\b",
    r"\b(?:voices\s+(?:are\s+)?telling\s+me\s+to\s+(?:hurt|attack|burn|kill))\b",
    r"\b(?:(?:they|the\s+government|someone)?\s*put\s+cameras\s+in\s+my\s+(?:eyes|walls|teeth|house|room))\b",
    r"\b(?:poison(?:ing|ed)\s+my\s+(?:water|food|air)\s+to\s+control\s+me)\b",
    r"\b(?:secret\s+agents\s+are\s+following\s+me\s+everywhere)\b",
]

COMPILED_UNGROUNDED_REGEX = [re.compile(p, re.IGNORECASE) for p in UNGROUNDED_PATTERNS]

# ------------------------------------------------------------------------------
# 4. SAFETY EVALUATION DATA MODELS
# ------------------------------------------------------------------------------

class SafetyCheckResult(BaseModel):
    is_safe: bool = True
    crisis_detected: bool = False
    crisis_keywords: List[str] = Field(default_factory=list)
    ungrounded_detected: bool = False
    ungrounded_keywords: List[str] = Field(default_factory=list)
    override_message: Optional[str] = None
    applied_grounding_note: Optional[str] = None


# ------------------------------------------------------------------------------
# 5. CORE SAFETY FILTER FUNCTIONS
# ------------------------------------------------------------------------------

def scan_crisis_keywords(text: str) -> Tuple[bool, List[str]]:
    """Scans text for acute crisis or self-harm keywords."""
    if not text:
        return False, []
    
    matches: List[str] = []
    for pattern in COMPILED_CRISIS_REGEX:
        found = pattern.findall(text)
        if found:
            matches.extend(found)
            
    is_crisis = len(matches) > 0
    return is_crisis, list(set(matches))


def scan_ungrounded_beliefs(text: str) -> Tuple[bool, List[str]]:
    """Scans text for ungrounded persecutory or delusional premises requiring reality-grounded tone."""
    if not text:
        return False, []
        
    matches: List[str] = []
    for pattern in COMPILED_UNGROUNDED_REGEX:
        found = pattern.findall(text)
        if found:
            matches.extend(found)
            
    is_ungrounded = len(matches) > 0
    return is_ungrounded, list(set(matches))


def evaluate_safety(text: str) -> SafetyCheckResult:
    """
    Comprehensive evaluation of input or output text.
    Returns SafetyCheckResult with crisis flags, ungrounded flags, and override message if crisis detected.
    """
    crisis_detected, crisis_matches = scan_crisis_keywords(text)
    ungrounded_detected, ungrounded_matches = scan_ungrounded_beliefs(text)

    if crisis_detected:
        return SafetyCheckResult(
            is_safe=False,
            crisis_detected=True,
            crisis_keywords=crisis_matches,
            ungrounded_detected=ungrounded_detected,
            ungrounded_keywords=ungrounded_matches,
            override_message=CRISIS_FALLBACK_MESSAGE,
        )

    grounding_note = None
    if ungrounded_detected:
        grounding_note = (
            "Reality-grounding protocol active: respond with empathy toward distress "
            "without validating ungrounded perceptions or persecutory premises."
        )

    return SafetyCheckResult(
        is_safe=True,
        crisis_detected=False,
        crisis_keywords=[],
        ungrounded_detected=ungrounded_detected,
        ungrounded_keywords=ungrounded_matches,
        override_message=None,
        applied_grounding_note=grounding_note,
    )


def sanitize_and_format_response(
    response_text: str,
    crisis_triggered: bool = False,
    include_disclaimer: bool = True
) -> str:
    """
    Ensures safe formatting, overrides with helpline if crisis detected,
    and appends the standard non-clinical disclaimer.
    """
    if crisis_triggered:
        return CRISIS_FALLBACK_MESSAGE

    # Also scan outgoing response text for safety
    out_crisis, _ = scan_crisis_keywords(response_text)
    if out_crisis:
        return CRISIS_FALLBACK_MESSAGE

    formatted = response_text.strip()
    if include_disclaimer and STANDARD_DISCLAIMER not in formatted:
        formatted = f"{formatted}\n\n---\n{STANDARD_DISCLAIMER}"

    return formatted
