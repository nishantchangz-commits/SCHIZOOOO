"""
Google AI Studio Multimodal Clinical Copilot: NeuroPhenom-AI
Integrated with Google GenAI SDK (google-genai) and local patient cohort dataset.

Features:
- Dual-Mode: Live Google AI Studio (Gemini 2.0 Flash) with Automatic Function Calling OR Autonomous Offline Clinical Engine
- 4 Clinical Diagnostic & Phenomenological Tools
- Multimodal Patient Artwork Evaluation (PIL Images)
- Safety guardrails, DSM-5 / ICD-11 grounding, and CBTp crisis stabilization
"""

import os
import sys
import json
import argparse
from pathlib import Path
from PIL import Image

# Ensure local site-packages are accessible
ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
SITE_PACKAGES = ROOT_DIR / "site-packages"
if SITE_PACKAGES.exists() and str(SITE_PACKAGES) not in sys.path:
    sys.path.insert(0, str(SITE_PACKAGES))

try:
    from google import genai
    from google.genai import types
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

BASE_DIR = Path(__file__).resolve().parent
PROJECTS_DIR = BASE_DIR.parent.parent
KNOWLEDGE_PATH = BASE_DIR / "patient_cohort_knowledge_base.json"
IMAGES_DIR = PROJECTS_DIR / "05_neurophenom_sync_artwork_lora" / "lora_dataset" / "train" / "images"

# Load patient data
if KNOWLEDGE_PATH.exists():
    PATIENT_DB = json.loads(KNOWLEDGE_PATH.read_text(encoding="utf-8"))
else:
    PATIENT_DB = {}


# ==============================================================================
# TOOL DEFINITIONS (Function Calling for Gemini 2.0 Flash)
# ==============================================================================
def query_patient_eeg_erp(patient_id: str) -> str:
    """Retrieves electrophysiological EEG biomarkers (N100, P300, MMN, 40Hz ASSR) and 1D-CNN prediction for a patient.
    
    Args:
        patient_id: Patient code, e.g. 'p01', 'p02', ..., 'p10'.
    """
    pid = patient_id.strip().lower()
    if pid not in PATIENT_DB:
        return json.dumps({"error": f"Patient {patient_id} not found. Available: {list(PATIENT_DB.keys())}"})
    
    p = PATIENT_DB[pid]
    return json.dumps({
        "patient_id": pid,
        "clinical_diagnosis": p["clinical_profile"]["diagnosis"],
        "age": p["clinical_profile"]["age"],
        "eeg_biomarkers": {
            "n100_sensory_attenuation_deficit": f"{p['clinical_profile']['n100_attenuation_deficit']}% (Norm: > -20%)",
            "p300_amplitude": f"{p['clinical_profile']['p300_amplitude_uv']} uV (Norm: 9-12 uV)",
            "p300_latency": f"{p['clinical_profile']['p300_latency_ms']} ms",
            "mmn_amplitude": f"{p['clinical_profile']['mmn_amplitude_uv']} uV",
            "gamma_40hz_assr_snr": f"{p['clinical_profile']['gamma_40hz_assr_snr']} dB",
            "cnn_schizophrenia_probability": f"{p['clinical_profile']['cnn_schizophrenia_score'] * 100:.1f}%"
        },
        "clinical_notes": p["clinical_profile"]["clinical_notes"]
    }, indent=2)


def get_artwork_evolution_stage(patient_id: str, stage: int) -> str:
    """Retrieves patient artwork progression details, gaze coordinates, and salience tokens for a given stage (1 to 5).
    
    Args:
        patient_id: Patient code, e.g. 'p01'.
        stage: Evolution time step integer from 1 (baseline) to 5 (peak emergence).
    """
    pid = patient_id.strip().lower()
    if pid not in PATIENT_DB:
        return json.dumps({"error": f"Patient {patient_id} not found."})
    
    stages = PATIENT_DB[pid]["artwork_progression"]
    matching = [s for s in stages if s["stage"] == stage]
    if not matching:
        return json.dumps({"error": f"Stage {stage} not found for patient {pid}. Must be 1 to 5."})
    
    s = matching[0]
    return json.dumps({
        "patient_id": pid,
        "stage": s["stage"],
        "eeg_salience": round(s["raw_eeg_salience"], 3),
        "gaze_token": s["gaze_token"],
        "neural_token": s["neural_token"],
        "gaze_roi": {
            "center_x_px": s["gaze_x_px"],
            "center_y_px": s["gaze_y_px"],
            "radius_px": s["radius_px"]
        },
        "perceptual_change": s["observed_change"],
        "master_caption": s["master_caption"]
    }, indent=2)


def run_gaze_salience_prediction(patient_id: str, gaze_x: float, gaze_y: float) -> str:
    """Calculates predicted neural salience based on distance from patient's primary fixation locus.
    
    Args:
        patient_id: Patient code, e.g. 'p01'.
        gaze_x: Normalized horizontal coordinate (0.0 to 1.0).
        gaze_y: Normalized vertical coordinate (0.0 to 1.0).
    """
    pid = patient_id.strip().lower()
    if pid not in PATIENT_DB:
        return json.dumps({"error": f"Patient {patient_id} not found."})
    
    s1 = PATIENT_DB[pid]["artwork_progression"][0]
    norm_cx = s1["gaze_x_px"] / 512.0
    norm_cy = s1["gaze_y_px"] / 512.0
    
    # Euclidean distance
    dist = ((gaze_x - norm_cx) ** 2 + (gaze_y - norm_cy) ** 2) ** 0.5
    salience = max(0.15, min(0.95, 1.0 - (dist * 1.5)))
    
    token = "gzhigh" if salience > 0.65 else ("gzmed" if salience > 0.35 else "gzlow")
    return json.dumps({
        "patient_id": pid,
        "input_coordinates": {"x": gaze_x, "y": gaze_y},
        "primary_locus": {"x": round(norm_cx, 3), "y": round(norm_cy, 3)},
        "distance_from_lock": round(dist, 4),
        "predicted_neural_salience": round(salience, 3),
        "assigned_gaze_token": token
    }, indent=2)


def generate_cbtp_grounding_plan(patient_id: str, distress_level: str) -> str:
    """Generates a structured Cognitive Behavioral Therapy for Psychosis (CBTp) grounding protocol for high sensory distress.
    
    Args:
        patient_id: Patient code.
        distress_level: 'mild', 'moderate', or 'acute'.
    """
    level = distress_level.lower().strip()
    return json.dumps({
        "patient_id": patient_id,
        "distress_tier": level,
        "immediate_action": "Pause canvas interaction and decouple gaze fixation.",
        "somatosensory_grounding": [
            "5-4-3-2-1 Sensory Reset: 5 visible physical objects, 4 tactile surfaces, 3 environmental sounds, 2 pleasant aromas, 1 sip of cold water.",
            "Proprioceptive Grounding: Press bare soles firmly against floor, feel gravity anchoring body weight.",
            "Autonomic Box Breathing: 4s inhale, 4s hold, 4s exhale, 4s pause."
        ],
        "cognitive_reframing": "Validate distress without confirming delusion premise. Normalize aberrant salience as temporary neurochemical fluctuation.",
        "emergency_escalation": "If agitation escalates, contact licensed clinical supervisor or dial 988."
    }, indent=2)


# ==============================================================================
# ENVIRONMENT & KEYS
# ==============================================================================
def load_env_key():
    for p in [BASE_DIR / ".env", BASE_DIR.parent / ".env", ROOT_DIR / ".env"]:
        if p.exists():
            for line in p.read_text(encoding="utf-8").splitlines():
                line = line.strip()
                if line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                k = k.strip()
                v = v.strip().strip("'").strip('"')
                if k in ["GEMINI_API_KEY", "GOOGLE_API_KEY"] and not os.environ.get(k):
                    os.environ[k] = v


def get_system_prompt() -> str:
    bundle_path = BASE_DIR / "neuro_ai_studio_bundle.json"
    if bundle_path.exists():
        data = json.loads(bundle_path.read_text(encoding="utf-8"))
        return data["systemInstruction"]["parts"][0]["text"]
    return "You are NeuroPhenom-AI, a clinical computational neuroscience copilot."


# ==============================================================================
# OFFLINE DETERMINISTIC CLINICAL ENGINE
# ==============================================================================
def run_offline_synthesis(query: str, patient_id: str = "p01", stage: int = 5) -> str:
    """Simulates the full agentic tool pipeline and synthesizes clinical report offline."""
    q_low = query.lower()
    
    # Crisis override
    if any(w in q_low for w in ["suicide", "kill myself", "end life", "die"]):
        return (
            "⚠️ IMMEDIATE CRISIS INTERVENTION OVERRIDE\n\n"
            "Compassionate, confidential professional support is available right now:\n"
            "• US & Canada: Call or Text 988 (Suicide & Crisis Lifeline)\n"
            "• Crisis Text Line: Text HOME to 741741\n"
            "• UK: Call 111 (NHS) or 999. Samaritans: 116 123.\n"
            "• International: https://findahelpline.com"
        )
    
    # Parse patient ID from query if present
    for pid in PATIENT_DB.keys():
        if pid in q_low:
            patient_id = pid
            break

    eeg_data = json.loads(query_patient_eeg_erp(patient_id))
    stage_data = json.loads(get_artwork_evolution_stage(patient_id, stage))

    resp = []
    resp.append("=" * 70)
    resp.append(f"🧠 NeuroPhenom-AI: Clinical & Multimodal Case Synthesis ({patient_id.upper()})")
    resp.append("=" * 70)
    
    resp.append(f"\n**1. Patient Clinical & Electrophysiological Profile:**")
    resp.append(f"- **Diagnosis:** {eeg_data.get('clinical_diagnosis')} (Age {eeg_data.get('age')})")
    biomarkers = eeg_data.get('eeg_biomarkers', {})
    resp.append(f"- **N100 Sensory Attenuation Deficit:** {biomarkers.get('n100_sensory_attenuation_deficit')}")
    resp.append(f"- **P300 ERP Wave:** {biomarkers.get('p300_amplitude')} (Latency: {biomarkers.get('p300_latency')})")
    resp.append(f"- **Mismatch Negativity (MMN):** {biomarkers.get('mmn_amplitude')}")
    resp.append(f"- **1D-CNN Schizophrenia Confidence:** {biomarkers.get('cnn_schizophrenia_probability')}")
    resp.append(f"- **Clinical Context:** {eeg_data.get('clinical_notes')}")

    resp.append(f"\n**2. Artwork Phenomenological Progression (Stage {stage}/5):**")
    resp.append(f"- **Observed Emergence Delta:** {stage_data.get('perceptual_change')}")
    resp.append(f"- **EEG Salience Value:** {stage_data.get('eeg_salience')} (Neural Token: `{stage_data.get('neural_token')}`, Gaze Token: `{stage_data.get('gaze_token')}`)")
    gaze_roi = stage_data.get('gaze_roi', {})
    resp.append(f"- **Gaze Fixation Locus:** Center ({gaze_roi.get('center_x_px')}px, {gaze_roi.get('center_y_px')}px), Radius: {gaze_roi.get('radius_px')}px")
    
    resp.append(f"\n**3. Computational Psychiatry Mechanistic Analysis:**")
    resp.append(
        "Under the predictive coding framework of schizophrenia, corollary discharge failure "
        "impairs the efference copy transmitted to sensory cortices. As unattenuated internal sensory noise "
        "competes with sensory inputs, aberrant salience leads the patient to experience internally driven thoughts "
        "as an alien presence, which visually materializes around tight gaze fixation coordinates on the painted canvas."
    )

    if any(w in q_low for w in ["anxious", "scared", "fear", "delusion", "voices", "shock", "watch"]):
        grounding = json.loads(generate_cbtp_grounding_plan(patient_id, "moderate"))
        resp.append(f"\n**4. Recommended CBTp Somatosensory Grounding Plan:**")
        for step in grounding.get("somatosensory_grounding", []):
            resp.append(f"- {step}")

    resp.append("\n" + "-" * 70)
    resp.append(
        "*DISCLAIMER: This application is a clinical research and psychoeducational copilot powered by Google Gemini. "
        "It is NOT a clinical diagnostic device, therapeutic prescription, or substitute for formal medical evaluation by a licensed psychiatrist or physician.*"
    )
    return "\n".join(resp)


# ==============================================================================
# MAIN ENTRYPOINT
# ==============================================================================
def main():
    parser = argparse.ArgumentParser(description="NeuroPhenom Google AI Studio Clinical Copilot")
    parser.add_argument("--patient", type=str, default="p01", help="Patient ID (p01 to p10)")
    parser.add_argument("--stage", type=int, default=5, help="Artwork stage (1 to 5)")
    parser.add_argument("--prompt", type=str, default="", help="Custom query")
    parser.add_argument("--image", action="store_true", help="Analyze patient's actual 512x512 artwork image")
    parser.add_argument("--demo", action="store_true", help="Run automated demonstration")
    parser.add_argument("--interactive", action="store_true", help="Run interactive CLI chat")
    args = parser.parse_args()

    load_env_key()
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    use_live_api = bool(api_key and GENAI_AVAILABLE)

    print("=" * 75)
    print("🧠 NeuroPhenom-AI: Google AI Studio Multimodal Clinical Copilot")
    print("=" * 75)

    if use_live_api:
        print("🟢 Connected to Google AI Studio (Model: gemini-2.0-flash)")
        print("   Automatic Function Calling: [query_patient_eeg_erp, get_artwork_evolution_stage,")
        print("                                run_gaze_salience_prediction, generate_cbtp_grounding_plan]")
    else:
        print("⚪ Operating in Autonomous Offline Clinical Synthesis Engine")
        print("   (To connect live Gemini 2.0 Flash: set $env:GEMINI_API_KEY='your_key')")

    print("-" * 75)

    # Resolve image if requested
    img_path = IMAGES_DIR / f"{args.patient}_s01_t0{args.stage}.png"
    pil_image = None
    if args.image and img_path.exists():
        try:
            pil_image = Image.open(img_path)
            print(f"🖼️ Loaded Patient Artwork: {img_path.name} ({pil_image.size[0]}x{pil_image.size[1]} RGB)")
        except Exception as e:
            print(f"Warning loading image: {e}")

    # Build prompt
    if args.demo:
        query = (
            f"Analyze Patient {args.patient}: correlate their N100 EEG attenuation deficit and 1D-CNN score "
            f"with their Stage {args.stage} artwork emergence. How does aberrant salience manifest in the visual composition?"
        )
    elif args.prompt:
        query = args.prompt
    elif not args.interactive:
        query = f"Provide a complete clinical synthesis for Patient {args.patient} at Stage {args.stage}."
    else:
        query = None

    # Execute single prompt or demo
    if query:
        print(f"\n[Clinical Query]: {query}\n")
        if use_live_api:
            try:
                client = genai.Client(api_key=api_key)
                contents = [query]
                if pil_image:
                    contents.append(pil_image)
                    
                response = client.models.generate_content(
                    model="gemini-2.0-flash",
                    contents=contents,
                    config=types.GenerateContentConfig(
                        system_instruction=get_system_prompt(),
                        temperature=0.2,
                        tools=[
                            query_patient_eeg_erp,
                            get_artwork_evolution_stage,
                            run_gaze_salience_prediction,
                            generate_cbtp_grounding_plan
                        ]
                    )
                )
                print("Assistant:\n")
                print(response.text)
            except Exception as e:
                print(f"Google GenAI API call returned: {e}")
                print("Falling back to local clinical synthesis engine...")
                print(run_offline_synthesis(query, args.patient, args.stage))
        else:
            print(run_offline_synthesis(query, args.patient, args.stage))
        return

    # Interactive mode
    print("Type your clinical or patient query below. Type 'exit' to quit.\n")
    while True:
        try:
            user_input = input("Clinician: ").strip()
            if not user_input:
                continue
            if user_input.lower() in ["exit", "quit", "q"]:
                print("Session ended.")
                break
            
            if use_live_api:
                client = genai.Client(api_key=api_key)
                resp = client.models.generate_content(
                    model="gemini-2.0-flash",
                    contents=[user_input],
                    config=types.GenerateContentConfig(
                        system_instruction=get_system_prompt(),
                        temperature=0.2,
                        tools=[
                            query_patient_eeg_erp,
                            get_artwork_evolution_stage,
                            run_gaze_salience_prediction,
                            generate_cbtp_grounding_plan
                        ]
                    )
                )
                print(f"\nAssistant:\n{resp.text}\n")
            else:
                print(f"\n{run_offline_synthesis(user_input, args.patient, args.stage)}\n")

        except (KeyboardInterrupt, EOFError):
            print("\nSession ended.")
            break


if __name__ == "__main__":
    main()
