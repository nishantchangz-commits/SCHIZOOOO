# 🧠 NeuroPhenom-AI: Google AI Studio Multimodal Copilot

This guide outlines how the **NeuroPhenom-AI** clinical and research application was built using your 5 days of multi-patient EEG and artwork evolution data, and how to use it in **Google AI Studio (aistudio.google.com)**, the **CLI**, and the **Live Web Dashboard**.

---

## 📂 Project Assets & Architecture

1. **`patient_cohort_knowledge_base.json` & `.txt`**:
   - Compiles all 10 patient records (`p01` through `p10`), their age, ICD-11 schizophrenia diagnoses, and qualitative clinical notes.
   - Includes real electrophysiological EEG biomarkers:
     - N100 Sensory Attenuation Deficit (% reduction, corollary discharge impairment)
     - P300 ERP amplitude (µV) and peak latency (ms)
     - Mismatch Negativity (MMN, µV) reflecting cortical NMDA-receptor hypofunction
     - 40Hz ASSR gamma oscillation synchrony (dB)
     - 1D-CNN Schizophrenia biomarker prediction probability
   - Maps 50 evolutionary artwork frames across stages 1 to 5 with gaze fixation ROIs (`gaze_x`, `gaze_y`, `radius`), raw EEG salience, and tokens (`gzlow`/`gzhigh`, `nlow`/`nhigh`).

2. **`neuro_ai_studio_bundle.json`**:
   - The master Google AI Studio export configuration.
   - Model: `gemini-2.0-flash`
   - Temperature: `0.2` (strict adherence to clinical guardrails)
   - Pre-configured OpenAPI function declarations for the 4 core clinical tools.
   - Clinical safety system instructions and emergency crisis overrides (988 Lifeline).

3. **`ai_studio_patient_analyzer.py`**:
   - Python application built with the official `google-genai` SDK (`from google import genai`).
   - Implements **Automatic Function Calling** for 4 tools:
     1. `query_patient_eeg_erp(patient_id)`
     2. `get_artwork_evolution_stage(patient_id, stage)`
     3. `run_gaze_salience_prediction(patient_id, gaze_x, gaze_y)`
     4. `generate_cbtp_grounding_plan(patient_id, distress_level)`
   - Dual-Mode: Executes live against Google AI Studio with `GEMINI_API_KEY` or runs locally via the autonomous clinical synthesis engine.
   - Multimodal: Directly loads and analyzes 512x512 PNG artwork files from `lora_dataset/train/images/`.

4. **Streamlit Integration (Mode 4)**:
   - Added directly to `projects/05_neurophenom_sync_artwork_lora/app.py`.
   - Accessible live on the Cloudflare QUIC public URL.

---

## 🚀 How to Run the App

### Option A: In the Live Web Dashboard
1. Open the public Streamlit link: `https://sofa-rush-corners-literacy.trycloudflare.com`
2. Select **"4. Google AI Studio Clinical Copilot"** from the navigation bar.
3. Choose any patient (`p01` to `p10`) and artwork stage (1 to 5).
4. Click quick-prompt buttons (e.g. *Full Case Synthesis*, *Correlate N100 & Gaze*, *CBTp Grounding Plan*) or type a custom clinician inquiry.

### Option B: Standalone Terminal / CLI
```powershell
cd d:\antigravity\projects\03_clinical_dashboard_ai_studio\google_ai_studio

# 1. Automated Case Evaluation Demo (Patient p01, Stage 5)
d:\antigravity\.venv\Scripts\python.exe ai_studio_patient_analyzer.py --demo --patient p01 --stage 5

# 2. Multimodal Artwork Image Analysis
d:\antigravity\.venv\Scripts\python.exe ai_studio_patient_analyzer.py --patient p02 --stage 4 --image --prompt "Evaluate pareidolia emergence"

# 3. Interactive Clinician Chat
d:\antigravity\.venv\Scripts\python.exe ai_studio_patient_analyzer.py --interactive
```

---

## 🌐 How to Load Directly into Google AI Studio (Web Interface)

1. Open [https://aistudio.google.com/](https://aistudio.google.com/) and click **"Create Prompt"** -> **"Chat prompt"**.
2. **Model Selection**: Choose `Gemini 2.0 Flash` (Temperature: `0.2`, Top P: `0.95`).
3. **System Instructions**: Copy and paste the text from [`system_instructions.txt`](file:///d:/antigravity/projects/03_clinical_dashboard_ai_studio/google_ai_studio/system_instructions.txt).
4. **Context Grounding**: Click **"Add Context / Upload File"** and upload [`patient_cohort_knowledge_base.txt`](file:///d:/antigravity/projects/03_clinical_dashboard_ai_studio/google_ai_studio/patient_cohort_knowledge_base.txt).
5. **Tools / Function Calling**: Enable Function Calling and paste the tool definitions from [`neuro_ai_studio_bundle.json`](file:///d:/antigravity/projects/03_clinical_dashboard_ai_studio/google_ai_studio/neuro_ai_studio_bundle.json).
