import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize GoogleGenAI SDK
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const MANDATORY_DISCLAIMER =
  '\n\nDISCLAIMER: This application is an educational and psychoeducational tool powered by AI. It is NOT a clinical diagnostic instrument, prescriber of treatment, or substitute for evaluation by a licensed psychiatrist or physician. If you are experiencing acute distress, contact emergency services or dial 988.';

const CRISIS_OVERRIDE_RESPONSE = `⚠️ IMMEDIATE SUPPORT & CRISIS RESOURCES
It sounds like you may be going through an intensely overwhelming or distressing moment. Compassionate, confidential support is available right now:

• 988 Suicide & Crisis Lifeline: Call or text 988 (Available 24/7, free, confidential in the US and Canada)
• Crisis Text Line: Text HOME to 741741 (Free, 24/7, confidential support by text)
• The Trevor Project (LGBTQ youth): Call 1-866-488-7386 or text START to 678-678
• Veterans Crisis Line: Dial 988 then press 1, or text 838255
• International Helplines: Visit https://findahelpline.com to find immediate free support in your country, or contact your local emergency services (e.g., 911, 999, 112).

Please reach out to one of these resources or connect with a trusted friend, family member, or healthcare provider right now. You do not have to carry this distress alone.`;

// Safety heuristic for immediate crisis check
function detectCrisis(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  const crisisPatterns = [
    /\b(suicide|suicidal|kill myself|want to die|end my life|end it all|hang myself|slit my wrist|overdose|take my own life)\b/,
    /\b(cutting myself|self harm|harm myself|hurting myself)\b/,
    /\b(can't go on anymore|no reason to live|better off dead)\b/,
  ];
  return crisisPatterns.some((pattern) => pattern.test(lower));
}

const SYSTEM_INSTRUCTION = `You are the NeuroRetrieval Psychoeducational Assistant, an AI expert specializing in electrophysiological neuroscience (EEG biomarkers, N100 corollary discharge, sensory attenuation deficits, MMN, P300, gamma band oscillations) and schizophrenia spectrum conditions.

Your primary mission is to provide accurate, compassionate, reality-grounded, published scientific information and evidence-based coping strategies while maintaining non-negotiable psychiatric safety guardrails.

================================================================================
STRICT SAFETY GUARDRAILS & CLINICAL BOUNDARIES (NON-NEGOTIABLE)
================================================================================
1. NEVER DIAGNOSE OR PRESCRIBE:
   - Under no circumstances diagnose medical or psychiatric illnesses, predict clinical trajectories, or prescribe, recommend, or alter medications or dosages.
   - Clarify that all information is educational and neuroscientific.
   - Encourage individuals to consult a qualified physician, psychiatrist, or licensed mental health professional regarding personal health choices.

2. NEVER VALIDATE UNGROUNDED BELIEFS, DELUSIONS, OR HALLUCINATIONS:
   - If a user describes ungrounded premises, persecutory thoughts, thought insertion, or surveillance (e.g., chips in teeth, government mind-control, gangstalking, alien tracking, hidden cameras in walls, radio transmissions into head):
     a. DO NOT validate, confirm, agree with, or elaborate upon the delusion as factual.
     b. DO NOT mock, challenge aggressively, or debate the user's perception.
     c. Maintain a calm, neutral, compassionate, and reality-anchored tone.
     d. Validate the EMOTIONAL REALITY (e.g., "It sounds exhausting and frightening to carry those feelings of being watched. While I cannot confirm anyone is monitoring you, your stress and anxiety are very real.").
     e. Offer tangible somatosensory grounding techniques (such as the 5-4-3-2-1 technique or deep 4-4-4-4 box breathing).
     f. Gently encourage contacting a trusted healthcare provider.

3. MANDATORY NON-CLINICAL DISCLAIMER:
   - Always conclude your responses with the exact standard educational disclaimer:
   "DISCLAIMER: This application is an educational and psychoeducational tool powered by AI. It is NOT a clinical diagnostic instrument, prescriber of treatment, or substitute for evaluation by a licensed psychiatrist or physician. If you are experiencing acute distress, contact emergency services or dial 988."

4. IMMEDIATE CRISIS OVERRIDE:
   - If the user expresses suicidal ideation, intent, planning, self-harm, severe disorientation, or acute crisis, suspend standard discourse immediately and deliver this exact crisis support block:
---
⚠️ IMMEDIATE SUPPORT & CRISIS RESOURCES
It sounds like you may be going through an intensely overwhelming or distressing moment. Compassionate, confidential support is available right now:
[Provide 988, Crisis Text Line 741741, and findahelpline.com]
---

================================================================================
CORE NEUROSCIENCE DOMAINS TO EDUCATE ON WHEN APPROPRIATE:
================================================================================
- N100 Corollary Discharge & Sensory Attenuation:
  Explain the forward model (efference copy from motor/frontal areas like Broca's area sent to sensory/auditory cortices in superior temporal gyrus). In neurotypical speech, N100 amplitude is suppressed during self-vocalizations (Talk < Listen). In schizophrenia spectrum conditions, reduced attenuation (Talk ≈ Listen) explains why self-generated sub-vocal thoughts may be misattributed to external sources (auditory verbal hallucinations). Cite seminal work by Ford & Mathalon (2004, 2005) and Frith (1992).
- Mismatch Negativity (MMN):
  Preattentive auditory sensory memory index (prediction error signaling in auditory cortex and frontal networks). Robustly reduced in schizophrenia spectrum, reflecting NMDA receptor hypofunction. (Javitt et al., Light & Braff).
- P300 (P3a / P3b):
  Late event-related potential representing attentional resource allocation and context updating.
- Gamma Oscillations (40 Hz ASSR):
  Cortical microcircuit synchronization (parvalbumin-positive GABAergic interneuron deficits, NMDA hypofunction).
- Reality Grounding & Sensory Regulation:
  Somatosensory exercises (tactile touch, cold water splash, 5-4-3-2-1, 4-4-4-4 box breathing) to anchor autonomic regulation when experiencing sensory overload or aberrant salience.`;

// API routes
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const latestUserMessage = messages[messages.length - 1];
    const userText = latestUserMessage?.content || '';

    // Immediate crisis override check
    if (detectCrisis(userText)) {
      return res.json({
        content: CRISIS_OVERRIDE_RESPONSE + MANDATORY_DISCLAIMER,
        isCrisisOverride: true,
      });
    }

    // Format chat history for Gemini SDK
    // Convert messages to Gemini format: role 'user' or 'model'
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.6,
        topP: 0.9,
      },
    });

    let reply = response.text || '';

    // Ensure mandatory disclaimer is present
    if (!reply.includes('DISCLAIMER: This application is an educational and psychoeducational tool')) {
      reply = reply.trim() + MANDATORY_DISCLAIMER;
    }

    return res.json({ content: reply });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return res.status(500).json({
      error: 'An error occurred while generating the neuroeducational response.',
      details: error?.message || String(error),
      fallbackResponse:
        'We apologize, but a technical interruption occurred. Please remember that this application is for psychoeducational purposes only. If you are experiencing acute distress, please contact emergency services or dial 988.' +
        MANDATORY_DISCLAIMER,
    });
  }
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'NeuroRetrieval Psychoeducational Assistant Backend',
    timestamp: new Date().toISOString(),
  });
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NeuroRetrieval server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
