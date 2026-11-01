# Comprehensive Research Source Pack: From EEG 1D CNN Models to Clinical LLMs in Schizophrenia Spectrum Analysis

**Author:** Computational Neuroscience & Generative AI Research Project  
**Target Platform:** Google NotebookLM (https://notebooklm.google.com/)  
**Document Type:** Primary Research Source Pack & Study Guide  

---

## Abstract & Project Overview
This project presents an integrated translational pipeline bridging computational neuroscience, deep learning, retrieval-augmented generation (RAG), and generative AI agents with strict clinical safety guardrails. The system addresses a fundamental neurocognitive marker in schizophrenia: the failure of sensory attenuation in the auditory N100 event-related potential (ERP) due to corollary discharge dysregulation. 

The pipeline spans four distinct architectural layers:
1. **Electrophysiological Biomarker Modeling:** Empirical statistical verification (t-tests, ANOVA, Cohen's d effect sizes) and deep 1D Convolutional Neural Network (CNN) classification on 23,201 single EEG trials across 81 human participants.
2. **Retrieval-Augmented Generation (RAG):** ChromaDB vector embeddings indexing authorized DSM-5-TR psychiatric literature, CBT for Psychosis (CBTp) protocols, and electrophysiological research.
3. **Clinical Safety & Crisis Guardrails:** Multi-tier middleware intercepting acute crisis inputs (triggering immediate 988 Lifeline and Crisis Text Line 741741 fallbacks) and preventing the validation of ungrounded persecutory delusions while offering 5-4-3-2-1 somatosensory grounding.
4. **Conversational Agent & User Interface:** FastAPI backend coupled with an accessible Streamlit web application and exportable Google AI Studio configurations.

---

## Chapter 1: The Neurobiology of Sensory Attenuation & Corollary Discharge

### 1.1 Efference Copy and Corollary Discharge Circuitry
In healthy neurocognitive systems, motor and sensory cortices maintain a continuous predictive dialogue. When an individual initiates a voluntary motor action—such as vocalizing speech, tapping a finger, or pressing a button that triggers an auditory sound—the motor cortex transmits two simultaneous signals:
- An efferent motor command to the peripheral muscles.
- An internal predictive duplicate, termed the **efference copy** or **corollary discharge**, to the sensory cortex (e.g., primary auditory cortex in Heschl's gyrus).

The corollary discharge pre-activates auditory circuits, dampening (attenuating) the neural response to the anticipated self-generated stimulus. This phenomenon is known as **sensory attenuation** or **sensory gating**.

### 1.2 The Auditory N100 Event-Related Potential
The N100 wave is a prominent negative ERP deflection peaking approximately 100 milliseconds post-stimulus onset.
- **Healthy Controls (HC):** Exhibit marked sensory attenuation: N100 amplitude is dramatically reduced when listening to self-generated tones compared to identical computer-delivered passive tones.
- **Schizophrenia Patients (SZ):** Exhibit a pronounced breakdown in sensory attenuation. Self-generated auditory stimuli elicit unattenuated N100 amplitudes nearly indistinguishable from external passive stimuli.

### 1.3 Neurocomputational Etiology of Auditory Hallucinations & Delusions of Control
When internal thoughts, inner speech, and sub-vocalizations fail to receive the corollary discharge inhibitory stamp:
- Inner mental dialogue is misattributed to external agency, manifesting as **auditory verbal hallucinations** ("hearing voices").
- Intentional actions feel externally manipulated or hijacked, manifesting as **delusions of control**, thought insertion, or persecutory surveillance beliefs.

---

## Chapter 2: Empirical Dataset & Cohort Demographics

The dataset analyzed encompasses 81 human subjects undergoing high-density electroencephalography during motor-auditory button-press and passive listening paradigms:
- **Total Participants:** 81 individuals
  - **Healthy Controls (HC):** 32 subjects (Mean age: 38.4 ± 13.9 years, Mean education: 15.9 years)
  - **Schizophrenia Spectrum (SZ):** 49 subjects (Mean age: 40.0 ± 13.5 years, Mean education: 13.6 years)
- **Total EEG Trials Analyzed:** 23,201 single trials
- **Electrodes of Focus:** Midline scalp electrodes capturing auditory cortex projection vectors:
  - **Fz (Frontal midline)**
  - **FCz (Fronto-central midline)**
  - **Cz (Central vertex)**

---

## Chapter 3: Statistical Hypothesis Testing & Effect Sizes

Inferential analysis of the sensory attenuation differential ($ERP_{passive} - ERP_{active}$) demonstrates statistically significant reductions in schizophrenia:

| Electrode Region | Healthy Controls Mean $\pm$ SD | Schizophrenia Mean $\pm$ SD | Independent $t$-statistic | $p$-value | Cohen's $d$ (Effect Size) | Interaction $z$-score | Interaction $p$-value |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Fz (Frontal)** | $2.19 \pm 1.68\,\mu\text{V}$ | $0.65 \pm 2.43\,\mu\text{V}$ | **$3.12$** | **$0.0025$** | **$0.71$ (Large)** | $3.12$ | $0.0018$ |
| **FCz (Fronto-Central)** | $2.27 \pm 1.90\,\mu\text{V}$ | $1.04 \pm 2.66\,\mu\text{V}$ | **$2.28$** | **$0.0253$** | **$0.52$ (Medium)** | $2.28$ | $0.0226$ |
| **Cz (Central)** | $2.18 \pm 2.20\,\mu\text{V}$ | $0.97 \pm 2.33\,\mu\text{V}$ | **$2.34$** | **$0.0218$** | **$0.53$ (Medium)** | $2.34$ | $0.0193$ |
| **Midline Composite** | $2.21 \pm 1.82\,\mu\text{V}$ | $0.88 \pm 2.37\,\mu\text{V}$ | **$2.70$** | **$0.0085$** | **$0.61$ (Moderate-Large)** | $2.70$ | $0.0070$ |

**Key Takeaway:** Across all midline recording sites, the capacity to attenuate self-generated auditory sensations is diminished by more than 50% to 70% in patients with schizophrenia.

---

## Chapter 4: Deep Learning 1D CNN Architecture & Classification

### 4.1 PyTorch 1D Convolutional Neural Network
A temporal 1D CNN was engineered in PyTorch (`eeg_1d_cnn_model.pt`) to classify trial segments directly from multi-channel EEG inputs ($9\text{ channels} \times 4\text{ temporal windows}$):
- **Conv Block 1:** Conv1D (in: 9, out: 32, kernel: 2, pad: 1) $\rightarrow$ BatchNorm1d $\rightarrow$ MaxPool1d (stride 1) $\rightarrow$ Dropout(0.25) $\rightarrow$ ReLU
- **Conv Block 2:** Conv1D (in: 32, out: 64, kernel: 2, pad: 1) $\rightarrow$ BatchNorm1d $\rightarrow$ MaxPool1d (stride 1) $\rightarrow$ Dropout(0.25) $\rightarrow$ ReLU
- **Fully Connected Head:** Flatten $\rightarrow$ Linear(out: 64) $\rightarrow$ BatchNorm1d $\rightarrow$ Dropout(0.40) $\rightarrow$ Linear(out: 2 classes)

### 4.2 Benchmark Model Performance
- **Single-Trial Metrics (23,201 trials):**
  - Recall: **$92.02\%$** (exceptionally high sensitivity)
  - F1-Score: **$74.17\%$**
  - Accuracy: **$61.46\%$**
- **Subject-Level Aggregated Metrics (Ensemble Majority Voting):**
  - Subject ROC-AUC: **$84.38\%$ ($0.84375$)**
  - Subject F1-Score: **$75.38\%$**
  - Subject Classification Accuracy: **$60.49\%$**

---

## Chapter 5: Retrieval-Augmented Generation (RAG) Architecture

The cognitive retrieval system indexes domain literature using ChromaDB and vector embeddings:
- **Chunking Strategy:** Sliding word window of 220 words with 40-word overlap, preserving heading tags and semantic cohesion.
- **Corpus Ingested:**
  1. *Schizophrenia Spectrum Psychoeducation:* DSM-5-TR positive, negative, and cognitive symptom clusters.
  2. *EEG Biomarkers & Corollary Discharge:* Electrophysiological mechanics of N100, P300, MMN, and gamma-band oscillations.
  3. *Evidence-Based Coping Strategies:* CBTp methods, 5-4-3-2-1 somatosensory grounding, subvocal disruption, and box breathing.
  4. *Clinical Boundaries & Psychiatric Ethics:* Non-diagnostic principles, de-escalation protocols.

---

## Chapter 6: Clinical Safety Guardrails & Psychiatric Ethics

The system enforces four non-negotiable safety rules before and after every model generation turn:
1. **Non-Diagnostic Rule:** Categorical refusal to diagnose conditions or adjust medications.
2. **Non-Validation of Ungrounded Premises:** When users report persecutory beliefs (e.g. microchips in teeth, surveillance, thought tracking):
   - Never validate the delusion as fact.
   - Empathize with the emotional distress ("It sounds terrifying and exhausting to feel that way").
   - Offer sensory grounding (5-4-3-2-1 technique).
   - Encourage consulting a physician or psychiatrist.
3. **Mandatory Non-Clinical Disclaimer:** Appended to every safe response.
4. **Immediate Crisis Intercept:** Any signal of suicide, self-harm, or severe emergency bypasses the LLM and displays 24/7 emergency hotlines (988 Lifeline, Crisis Text Line 741741, Trevor Project, international links).

---

## Suggested Questions for Google NotebookLM Exploration
1. *"How does the corollary discharge circuit explain why people with schizophrenia hear internal speech as external voices?"*
2. *"What are the exact statistical differences in N100 sensory attenuation between healthy controls and schizophrenia patients?"*
3. *"Why does the 1D CNN achieve 92% recall on single trials and 84.4% ROC-AUC on subject-level aggregation?"*
4. *"What are the clinical principles for responding to persecutory delusions without reinforcing false premises?"*
5. *"Generate a 5-minute educational podcast script summarizing this project's findings from raw EEG data to safe LLM responses."*
