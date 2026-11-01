"""
Showcase HTML Template for NeuroRetrieval Platform.
"""

SHOWCASE_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NeuroRetrieval: Schizophrenia EEG Model to LLM & NotebookLM</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    body { font-family: 'Inter', sans-serif; background-color: #0b0f19; color: #f1f5f9; }
    .glass-card { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; }
    .gradient-text { background: linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .glow-hover:hover { box-shadow: 0 0 25px rgba(56, 189, 248, 0.25); border-color: rgba(56, 189, 248, 0.4); }
  </style>
</head>
<body class="min-h-screen">

  <!-- NAVBAR -->
  <nav class="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50 px-6 py-4">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <span class="text-2xl">🧠</span>
        <span class="text-xl font-bold tracking-tight text-white">NeuroRetrieval</span>
        <span class="text-xs px-2.5 py-0.5 rounded-full bg-sky-950 text-sky-400 border border-sky-800 font-medium">Model ➡️ LLM ➡️ NotebookLM</span>
      </div>
      <div class="flex items-center space-x-4">
        <a href="http://localhost:8501" target="_blank" class="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-sm transition shadow-lg shadow-sky-600/30 flex items-center space-x-2">
          <span>💬 Open Streamlit App</span>
          <i class="fa-solid fa-arrow-up-right-from-square text-xs"></i>
        </a>
        <a href="https://notebooklm.google.com/" target="_blank" class="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition shadow-lg shadow-indigo-600/30 flex items-center space-x-2">
          <span>📓 Open NotebookLM</span>
          <i class="fa-solid fa-arrow-up-right-from-square text-xs"></i>
        </a>
        <a href="/docs" target="_blank" class="px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm">
          API Docs
        </a>
      </div>
    </div>
  </nav>

  <!-- HERO SECTION -->
  <header class="py-16 px-6 max-w-7xl mx-auto text-center">
    <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs mb-6">
      <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
      <span>Translational Computational Neuroscience & Generative AI</span>
    </div>
    <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
      Schizophrenia Spectrum Analysis:<br>
      <span class="gradient-text">From 1D CNN Models to Safe LLMs</span>
    </h1>
    <p class="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
      An end-to-end research platform investigating <strong>auditory N100 corollary discharge deficits</strong> and sensory attenuation failure in schizophrenia, combining deep learning classification with clinical RAG, safety guardrails, and Google NotebookLM synthesis.
    </p>

    <!-- KEY STATS ROW -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
      <div class="glass-card p-5 text-center">
        <div class="text-3xl font-extrabold text-sky-400">81</div>
        <div class="text-xs uppercase tracking-wider text-slate-400 mt-1">Human Subjects</div>
        <div class="text-xs text-slate-500 mt-0.5">32 Controls · 49 Schizophrenia</div>
      </div>
      <div class="glass-card p-5 text-center">
        <div class="text-3xl font-extrabold text-indigo-400">23,201</div>
        <div class="text-xs uppercase tracking-wider text-slate-400 mt-1">Single EEG Trials</div>
        <div class="text-xs text-slate-500 mt-0.5">High-density auditory ERP</div>
      </div>
      <div class="glass-card p-5 text-center">
        <div class="text-3xl font-extrabold text-purple-400">84.38%</div>
        <div class="text-xs uppercase tracking-wider text-slate-400 mt-1">Subject ROC-AUC</div>
        <div class="text-xs text-slate-500 mt-0.5">PyTorch 1D CNN Classifier</div>
      </div>
      <div class="glass-card p-5 text-center">
        <div class="text-3xl font-extrabold text-emerald-400">100%</div>
        <div class="text-xs uppercase tracking-wider text-slate-400 mt-1">Safety Pass Rate</div>
        <div class="text-xs text-slate-500 mt-0.5">19/19 Crisis & Delusion Tests</div>
      </div>
    </div>
  </header>

  <!-- PIPELINE ARCHITECTURE SECTION -->
  <section class="max-w-7xl mx-auto px-6 py-12">
    <h2 class="text-2xl md:text-3xl font-bold mb-8 flex items-center space-x-3">
      <span class="text-sky-400"><i class="fa-solid fa-network-wired"></i></span>
      <span>End-to-End System Pipeline</span>
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Card 1 -->
      <div class="glass-card p-6 glow-hover transition">
        <div class="w-12 h-12 rounded-xl bg-sky-950/80 border border-sky-800 flex items-center justify-center text-sky-400 text-xl mb-4">
          <i class="fa-solid fa-wave-square"></i>
        </div>
        <h3 class="text-lg font-bold text-white mb-2">1. Neurobiology & 1D CNN</h3>
        <p class="text-sm text-slate-400 mb-4 leading-relaxed">
          Analyzes sensory attenuation ($ERP_{passive} - ERP_{active}$) across Fz, FCz, and Cz electrodes. Evaluates corollary discharge failure and classifies trials using a trained PyTorch 1D CNN with Batch Normalization.
        </p>
        <span class="text-xs px-2.5 py-1 rounded bg-slate-800 text-sky-300 font-mono">92.0% Single-Trial Recall</span>
      </div>

      <!-- Card 2 -->
      <div class="glass-card p-6 glow-hover transition">
        <div class="w-12 h-12 rounded-xl bg-indigo-950/80 border border-indigo-800 flex items-center justify-center text-indigo-400 text-xl mb-4">
          <i class="fa-solid fa-shield-halved"></i>
        </div>
        <h3 class="text-lg font-bold text-white mb-2">2. RAG & Safety Guardrails</h3>
        <p class="text-sm text-slate-400 mb-4 leading-relaxed">
          ChromaDB vector database indexes DSM-5 psychoeducation and CBTp grounding literature. Middleware intercepts acute crisis inputs (988 Lifeline) and applies reality-grounding to ungrounded persecutory beliefs.
        </p>
        <span class="text-xs px-2.5 py-1 rounded bg-slate-800 text-indigo-300 font-mono">988 Lifeline · 741741 Text</span>
      </div>

      <!-- Card 3 -->
      <div class="glass-card p-6 glow-hover transition">
        <div class="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-800 flex items-center justify-center text-purple-400 text-xl mb-4">
          <i class="fa-solid fa-headphones-simple"></i>
        </div>
        <h3 class="text-lg font-bold text-white mb-2">3. NotebookLM & Web Apps</h3>
        <p class="text-sm text-slate-400 mb-4 leading-relaxed">
          Complete multi-modal user presentation: Streamlit conversational interface, FastAPI backend, and Google NotebookLM research pack for generating AI conversational podcast overviews.
        </p>
        <span class="text-xs px-2.5 py-1 rounded bg-slate-800 text-purple-300 font-mono">Audio Overviews · Podcasts</span>
      </div>
    </div>
  </section>

  <!-- DEEP LEARNING MODEL & VISUALIZATIONS -->
  <section class="max-w-7xl mx-auto px-6 py-12">
    <h2 class="text-2xl md:text-3xl font-bold mb-8 flex items-center space-x-3">
      <span class="text-indigo-400"><i class="fa-solid fa-chart-line"></i></span>
      <span>Empirical Findings & Model Visualizations</span>
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      <div class="glass-card p-6">
        <h3 class="text-lg font-semibold mb-3 text-sky-300 flex items-center space-x-2">
          <i class="fa-solid fa-brain"></i>
          <span>N100 Sensory Attenuation Waveforms</span>
        </h3>
        <img src="/static/n100_sensory_attenuation_waveforms.png" alt="Waveforms" class="rounded-lg w-full border border-slate-700">
        <p class="text-xs text-slate-400 mt-3">
          Comparing self-generated (active) vs externally delivered (passive) tones across healthy controls and schizophrenia patients.
        </p>
      </div>

      <div class="glass-card p-6">
        <h3 class="text-lg font-semibold mb-3 text-indigo-300 flex items-center space-x-2">
          <i class="fa-solid fa-microchip"></i>
          <span>1D CNN Classification Performance</span>
        </h3>
        <img src="/static/cnn_classification_performance.png" alt="CNN Performance" class="rounded-lg w-full border border-slate-700">
        <p class="text-xs text-slate-400 mt-3">
          ROC Curves, Precision-Recall curves, and training metrics for single-trial EEG classification.
        </p>
      </div>
    </div>

    <!-- STATISTICAL TABLE -->
    <div class="glass-card p-6 overflow-x-auto">
      <h3 class="text-lg font-bold text-white mb-4">Inferential Statistics: Sensory Attenuation Deficit ($ERP_{passive} - ERP_{active}$)</h3>
      <table class="w-full text-left text-sm text-slate-300">
        <thead class="bg-slate-800 text-xs uppercase text-slate-400 border-b border-slate-700">
          <tr>
            <th class="py-3 px-4">Electrode Channel</th>
            <th class="py-3 px-4">Healthy Controls (Mean ± SD)</th>
            <th class="py-3 px-4">Schizophrenia (Mean ± SD)</th>
            <th class="py-3 px-4">t-statistic</th>
            <th class="py-3 px-4">p-value</th>
            <th class="py-3 px-4">Cohen's d (Effect Size)</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800">
          <tr>
            <td class="py-3 px-4 font-semibold text-sky-400">Fz (Frontal Midline)</td>
            <td class="py-3 px-4">2.19 ± 1.68 µV</td>
            <td class="py-3 px-4">0.65 ± 2.43 µV</td>
            <td class="py-3 px-4 font-mono">3.124</td>
            <td class="py-3 px-4 text-emerald-400 font-semibold">0.0025 **</td>
            <td class="py-3 px-4"><span class="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs">0.710 (Large)</span></td>
          </tr>
          <tr>
            <td class="py-3 px-4 font-semibold text-sky-400">FCz (Fronto-Central)</td>
            <td class="py-3 px-4">2.27 ± 1.90 µV</td>
            <td class="py-3 px-4">1.04 ± 2.66 µV</td>
            <td class="py-3 px-4 font-mono">2.281</td>
            <td class="py-3 px-4 text-emerald-400 font-semibold">0.0253 *</td>
            <td class="py-3 px-4"><span class="px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 text-xs">0.518 (Medium)</span></td>
          </tr>
          <tr>
            <td class="py-3 px-4 font-semibold text-sky-400">Cz (Central Midline)</td>
            <td class="py-3 px-4">2.18 ± 2.20 µV</td>
            <td class="py-3 px-4">0.97 ± 2.33 µV</td>
            <td class="py-3 px-4 font-mono">2.340</td>
            <td class="py-3 px-4 text-emerald-400 font-semibold">0.0218 *</td>
            <td class="py-3 px-4"><span class="px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 text-xs">0.532 (Medium)</span></td>
          </tr>
          <tr class="bg-slate-800/40">
            <td class="py-3 px-4 font-bold text-indigo-400">Midline Composite</td>
            <td class="py-3 px-4 font-medium">2.21 ± 1.82 µV</td>
            <td class="py-3 px-4 font-medium">0.88 ± 2.37 µV</td>
            <td class="py-3 px-4 font-mono font-bold">2.698</td>
            <td class="py-3 px-4 text-emerald-400 font-bold">0.0085 **</td>
            <td class="py-3 px-4"><span class="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs">0.613 (Moderate-Large)</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <!-- NOTEBOOKLM INTEGRATION SECTION -->
  <section class="max-w-7xl mx-auto px-6 py-12">
    <div class="glass-card p-8 md:p-12 border-indigo-500/30 relative overflow-hidden">
      <div class="absolute -right-10 -bottom-10 opacity-10 text-9xl text-indigo-400">
        <i class="fa-solid fa-microphone-lines"></i>
      </div>

      <div class="max-w-3xl">
        <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-300 text-xs mb-4">
          <i class="fa-solid fa-sparkles"></i>
          <span>Google Labs Research Integration</span>
        </div>
        <h2 class="text-3xl md:text-4xl font-extrabold text-white mb-4">
          Deep Dive Research in Google NotebookLM
        </h2>
        <p class="text-slate-300 text-base md:text-lg mb-6 leading-relaxed">
          Take this schizophrenia research project into <strong>Google NotebookLM</strong> to generate AI-powered <strong>Audio Overviews (Podcasts)</strong>, dynamic study guides, and cross-source research summaries.
        </p>

        <div class="flex flex-wrap gap-4">
          <a href="https://notebooklm.google.com/" target="_blank" class="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/40 transition flex items-center space-x-2">
            <span>🚀 Open Google NotebookLM</span>
            <i class="fa-solid fa-arrow-up-right-from-square text-xs"></i>
          </a>
          <a href="/api/download/notebooklm-source-pack" class="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition flex items-center space-x-2">
            <i class="fa-solid fa-download"></i>
            <span>Download Source Pack (.md)</span>
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="border-t border-slate-800 py-10 px-6 text-center text-sm text-slate-500">
    <p class="mb-2">🧠 NeuroRetrieval Project · Computational Neuroscience, 1D CNN Models & Clinical LLM Safety</p>
    <p class="text-xs text-slate-600">Educational & scientific research platform. Not a replacement for professional clinical care.</p>
  </footer>

</body>
</html>
"""
