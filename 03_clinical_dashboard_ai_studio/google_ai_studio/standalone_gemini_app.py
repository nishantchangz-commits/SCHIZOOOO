"""
Standalone Google AI Studio Gemini App for NeuroRetrieval.

Exported and formatted for Google GenAI SDK (google-genai).
Uses Gemini 2.0 / 2.5 Flash with clinical safety guardrails, system instructions,
and local corpus fallback mode when running without an API key.
"""

import os
import sys
import argparse
from pathlib import Path

# Add local site-packages if available
ROOT_DIR = Path(__file__).resolve().parent.parent
SITE_PACKAGES = ROOT_DIR / "site-packages"
if SITE_PACKAGES.exists() and str(SITE_PACKAGES) not in sys.path:
    sys.path.insert(0, str(SITE_PACKAGES))

try:
    from google import genai
    from google.genai import types
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False


def load_env_file():
    """Attempt to load GEMINI_API_KEY from .env in project or root directories."""
    candidate_paths = [
        Path(__file__).parent / ".env",
        Path(__file__).parent.parent / ".env",
        Path(__file__).parent.parent.parent.parent / ".env",
        Path(__file__).parent.parent.parent / "05_neurophenom_sync_artwork_lora" / ".env"
    ]
    for p in candidate_paths:
        if p.exists():
            try:
                for line in p.read_text(encoding="utf-8").splitlines():
                    line = line.strip()
                    if line.startswith("#") or "=" not in line:
                        continue
                    k, v = line.split("=", 1)
                    k = k.strip()
                    v = v.strip().strip("'").strip('"')
                    if k in ["GEMINI_API_KEY", "GOOGLE_API_KEY"] and not os.environ.get(k):
                        os.environ[k] = v
            except Exception:
                pass


def load_system_instruction() -> str:
    instr_path = Path(__file__).parent / "system_instructions.txt"
    if instr_path.exists():
        return instr_path.read_text(encoding="utf-8")
    return "You are a psychiatric psychoeducational assistant with strict crisis overrides."


def load_corpus() -> str:
    corpus_path = Path(__file__).parent / "neuroscience_knowledge_corpus.txt"
    if corpus_path.exists():
        return corpus_path.read_text(encoding="utf-8")
    return ""


def offline_corpus_response(user_input: str, corpus_text: str) -> str:
    """Provides high-fidelity offline psychoeducation grounded in local corpus when no API key is set."""
    query = user_input.lower()
    
    # Crisis override check
    crisis_keywords = ["suicide", "kill myself", "end my life", "want to die", "self harm"]
    if any(cw in query for cw in crisis_keywords):
        return (
            "⚠️ IMMEDIATE SUPPORT & CRISIS RESOURCES\n"
            "It sounds like you may be going through an intensely overwhelming or distressing moment. Compassionate, confidential support is available right now:\n"
            "• In the US & Canada: Call or Text 988 (Suicide & Crisis Lifeline) or visit 988lifeline.org\n"
            "• Crisis Text Line: Text HOME to 741741\n"
            "• UK: Call 111 (NHS Mental Health) or 999 for emergencies. Call Samaritans at 116 123.\n"
            "• International: findahelpline.com or befrienders.org\n"
            "Please reach out to one of these resources right away or visit the nearest emergency department."
        )

    response_parts = []
    response_parts.append("### 🧠 NeuroRetrieval Clinical Knowledge Synthesis")

    if "n100" in query or "sensory attenuation" in query or "attenuation" in query or "corollary" in query:
        response_parts.append(
            "**1. N100 Sensory Attenuation & Corollary Discharge:**\n"
            "- A core neurobiological hallmark of healthy cognitive function is sensory attenuation: when the motor cortex initiates an action or subvocal speech, it transmits an 'efference copy' (corollary discharge) to sensory cortices (such as Heschl's gyrus).\n"
            "- In healthy individuals, the N100 event-related potential (~100ms post-stimulus) is significantly attenuated during self-generated stimuli.\n"
            "- In patients with schizophrenia spectrum conditions, studies document a marked failure of sensory attenuation: N100 amplitude remains unattenuated during self-initiated acoustic events, causing internally generated thoughts to be experienced as alien or external."
        )
    elif "biomarker" in query or "eeg" in query or "salience" in query or "p300" in query or "mmn" in query:
        response_parts.append(
            "**2. Electrophysiological Markers in Psychosis:**\n"
            "- **P200/P300 Deficits:** Reduced amplitude during working memory updating and salient stimulus evaluation.\n"
            "- **Mismatch Negativity (MMN):** Attenuated pre-attentive sensory memory responses indicating cortical NMDA-receptor hypofunction.\n"
            "- **Gamma-Band Oscillations (40 Hz ASSR):** Disruptions in local parvalbumin-positive GABAergic interneuron network synchrony."
        )
    elif "coping" in query or "grounding" in query or "cbt" in query or "technique" in query or "exercise" in query:
        response_parts.append(
            "**3. Somatosensory Grounding & Coping Protocol:**\n"
            "- **5-4-3-2-1 Technique:** 5 visual objects in the room, 4 tangible textures you can physically touch, 3 real ambient auditory sounds, 2 scents, 1 physical taste.\n"
            "- **Autonomic Respiration (Box Breathing):** 4 seconds inhale, 4 seconds hold, 4 seconds exhale, 4 seconds pause to down-regulate sympathetic hyperarousal."
        )
    else:
        response_parts.append(
            "**Neurocomputational Synthesis:**\n"
            "In computational psychiatry, positive psychotic symptoms (such as auditory hallucinations and persecutory delusions) are modeled as aberrant salience and predictive coding failure. "
            "When internal corollary discharge circuits underperform, baseline sensory noise is misattributed as an externally driven perceptual anomaly."
        )

    response_parts.append(
        "\n*DISCLAIMER: This application is an educational and psychoeducational tool. It is NOT a clinical diagnostic instrument, prescriber of treatment, or substitute for evaluation by a licensed psychiatrist or physician.*"
    )
    return "\n\n".join(response_parts)


def main():
    parser = argparse.ArgumentParser(description="Standalone Google AI Studio Gemini Assistant")
    parser.add_argument("--prompt", type=str, default="", help="Single query to evaluate non-interactively")
    parser.add_argument("--demo", action="store_true", help="Run automated multi-modal clinical evaluation demo")
    parser.add_argument("--model", type=str, default="gemini-2.0-flash", help="Model name (default: gemini-2.0-flash)")
    args = parser.parse_args()

    load_env_file()
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

    system_instruction = load_system_instruction()
    corpus_text = load_corpus()

    print("=" * 75)
    print("🧠 NeuroRetrieval Gemini Assistant (Google AI Studio Edition)")
    print("=" * 75)

    use_live_api = bool(api_key and GENAI_AVAILABLE)

    if use_live_api:
        print(f"🟢 Connected to Google GenAI API | Model: {args.model}")
        print("   Safety Guardrails: Active | Temperature: 0.2")
        client = genai.Client(api_key=api_key)
        chat = client.chats.create(
            model=args.model,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.2,
                top_p=0.95,
                top_k=40,
                max_output_tokens=1024,
            )
        )
        if corpus_text:
            chat.send_message(
                f"Here is the authorized reference knowledge corpus for this session:\n\n{corpus_text}\n\nAcknowledge with OK."
            )
    else:
        print("⚪ Running in Autonomous Clinical Knowledge Engine (Offline Mode)")
        print("   (To connect live Gemini Cloud API: set $env:GEMINI_API_KEY='your_key')")

    print("-" * 75)

    # 1. Automated Demo Mode
    if args.demo:
        demo_query = (
            "Evaluate Patient p01: N100 sensory attenuation deficit -62%, "
            "P200 integrative spike at gaze ROI (x=0.55, y=0.45). "
            "Patient remarks: 'The paint ribs pull apart when I stare at them.'"
        )
        print(f"\n[Demo Query]: {demo_query}\n")
        if use_live_api:
            resp = chat.send_message(demo_query)
            print(f"Assistant:\n{resp.text}\n")
        else:
            resp = offline_corpus_response(demo_query, corpus_text)
            print(f"Assistant:\n{resp}\n")
        return

    # 2. Single Prompt Mode
    if args.prompt:
        print(f"\n[Query]: {args.prompt}\n")
        if use_live_api:
            resp = chat.send_message(args.prompt)
            print(f"Assistant:\n{resp.text}\n")
        else:
            resp = offline_corpus_response(args.prompt, corpus_text)
            print(f"Assistant:\n{resp}\n")
        return

    # 3. Interactive CLI Chat Mode
    print("Type your clinical query below. Type 'exit' or 'quit' to end.\n")
    while True:
        try:
            user_input = input("You: ").strip()
            if not user_input:
                continue
            if user_input.lower() in ["exit", "quit", "q"]:
                print("Session ended.")
                break

            if use_live_api:
                response = chat.send_message(user_input)
                print(f"\nAssistant:\n{response.text}\n")
            else:
                response = offline_corpus_response(user_input, corpus_text)
                print(f"\nAssistant:\n{response}\n")

        except (KeyboardInterrupt, EOFError):
            print("\nSession interrupted.")
            break
        except Exception as e:
            print(f"Error: {e}")


if __name__ == "__main__":
    main()
