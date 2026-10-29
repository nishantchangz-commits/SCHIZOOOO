import { ErpCondition, ResearchArticle, GroundingStep } from '../types/neuro';

// Helper to generate realistic ERP waveforms
function generateWaveform(
  type: 'talk-control' | 'listen-control' | 'talk-sz' | 'listen-sz' | 'mmn-standard' | 'mmn-deviant' | 'p300' | 'assr-40hz'
): { timeMs: number; voltageUv: number }[] {
  const points: { timeMs: number; voltageUv: number }[] = [];
  
  for (let t = -50; t <= 450; t += 5) {
    let v = 0;
    
    // Baseline noise
    const noise = Math.sin(t * 0.1) * 0.15;
    
    if (type === 'listen-control') {
      // Normal acoustic listening: P50 (small pos at 50ms), N100 (prominent neg at 100ms, -6.2 uV), P200 (pos at 180ms, +3.5 uV)
      const p50 = 1.2 * Math.exp(-Math.pow((t - 50) / 18, 2));
      const n100 = -6.2 * Math.exp(-Math.pow((t - 100) / 28, 2));
      const p200 = 3.5 * Math.exp(-Math.pow((t - 180) / 40, 2));
      const n200 = -1.2 * Math.exp(-Math.pow((t - 240) / 40, 2));
      v = p50 + n100 + p200 + n200 + noise;
    } else if (type === 'talk-control') {
      // Normal corollary discharge: N100 during self-vocalization is attenuated by ~60% (-2.4 uV)
      const p50 = 0.6 * Math.exp(-Math.pow((t - 50) / 18, 2));
      const n100 = -2.4 * Math.exp(-Math.pow((t - 100) / 28, 2));
      const p200 = 1.8 * Math.exp(-Math.pow((t - 180) / 40, 2));
      const n200 = -0.6 * Math.exp(-Math.pow((t - 240) / 40, 2));
      v = p50 + n100 + p200 + n200 + noise;
    } else if (type === 'listen-sz') {
      // Listening in schizophrenia spectrum: similar acoustic N100 (~ -5.6 uV)
      const p50 = 1.1 * Math.exp(-Math.pow((t - 52) / 18, 2));
      const n100 = -5.6 * Math.exp(-Math.pow((t - 102) / 30, 2));
      const p200 = 2.9 * Math.exp(-Math.pow((t - 185) / 45, 2));
      v = p50 + n100 + p200 + noise;
    } else if (type === 'talk-sz') {
      // Reduced sensory attenuation in schizophrenia spectrum: N100 remains large (~ -5.1 uV), failing to suppress
      const p50 = 0.9 * Math.exp(-Math.pow((t - 52) / 18, 2));
      const n100 = -5.1 * Math.exp(-Math.pow((t - 102) / 30, 2));
      const p200 = 2.4 * Math.exp(-Math.pow((t - 185) / 45, 2));
      v = p50 + n100 + p200 + noise;
    } else if (type === 'mmn-standard') {
      // Repeated standard tone (predictable)
      const p50 = 1.0 * Math.exp(-Math.pow((t - 50) / 15, 2));
      const n100 = -4.0 * Math.exp(-Math.pow((t - 100) / 25, 2));
      const p200 = 2.5 * Math.exp(-Math.pow((t - 180) / 35, 2));
      v = p50 + n100 + p200 + noise;
    } else if (type === 'mmn-deviant') {
      // Oddball deviant tone -> MMN generates negative deflection around 150-220ms
      const p50 = 1.0 * Math.exp(-Math.pow((t - 50) / 15, 2));
      const n100 = -4.2 * Math.exp(-Math.pow((t - 100) / 25, 2));
      const mmn = -3.8 * Math.exp(-Math.pow((t - 175) / 35, 2)); // The Mismatch Negativity component
      const p200 = 1.0 * Math.exp(-Math.pow((t - 220) / 35, 2));
      v = p50 + n100 + mmn + p200 + noise;
    } else if (type === 'p300') {
      // P300 attentional orienting component
      const n100 = -2.5 * Math.exp(-Math.pow((t - 100) / 25, 2));
      const p200 = 1.5 * Math.exp(-Math.pow((t - 180) / 30, 2));
      const p300 = 7.5 * Math.exp(-Math.pow((t - 320) / 60, 2));
      v = n100 + p200 + p300 + noise;
    } else if (type === 'assr-40hz') {
      // 40Hz auditory steady state response: 40 cycles/sec = 1 cycle every 25ms
      const envelope = t > 0 ? Math.min(1, t / 80) * Math.exp(-Math.max(0, t - 350) / 100) : 0;
      const oscillation = Math.sin((t / 1000) * 40 * 2 * Math.PI) * 2.2 * envelope;
      v = oscillation + noise;
    }

    points.push({ timeMs: t, voltageUv: Math.round(v * 100) / 100 });
  }

  return points;
}

export const ERP_CONDITIONS: ErpCondition[] = [
  {
    id: 'n100-cd',
    name: 'N100 Corollary Discharge & Sensory Attenuation',
    subtitle: 'Talk vs. Listen Paradigm (Ford & Mathalon Model)',
    leadResearcher: 'Judith M. Ford & Daniel H. Mathalon',
    year: 2004,
    description:
      'During self-generated vocalization or inner speech, motor speech planning areas (Broca’s area) send an "efference copy" forward signal to the auditory cortex (superior temporal gyrus). This "corollary discharge" instructs sensory cortex to anticipate self-action and dampens the auditory response (N100 wave attenuation).',
    clinicalSignificance:
      'In schizophrenia spectrum conditions, this dampening is significantly reduced. Because self-generated inner speech triggers the auditory cortex as strongly as external sound, the brain fails to tag thoughts as "self-originated," which electrophysiologically underpins auditory verbal hallucinations.',
    waveforms: [
      {
        label: 'Listen (Acoustic Playback - Control)',
        color: '#38bdf8', // Sky blue
        points: generateWaveform('listen-control'),
      },
      {
        label: 'Talk (Self-Produced Speech - Control Attenuation)',
        color: '#10b981', // Emerald green
        points: generateWaveform('talk-control'),
      },
      {
        label: 'Talk in Schizophrenia Spectrum (Reduced Attenuation)',
        color: '#f59e0b', // Amber
        dash: '4 4',
        points: generateWaveform('talk-sz'),
      },
    ],
    peakMarker: {
      timeMs: 100,
      voltageUv: -6.2,
      label: 'N100 Deflection (~100 ms)',
    },
    notes:
      'Key finding: Typical attenuation suppresses N100 by ~60%. In individuals experiencing active auditory hallucinations, suppression drops to <15%, matching external sound intensity.',
  },
  {
    id: 'mmn',
    name: 'Mismatch Negativity (MMN) & Predictive Coding',
    subtitle: 'Oddball Auditory Paradigm (Preattentive Memory)',
    leadResearcher: 'Daniel C. Javitt, Gregory A. Light & David L. Braff',
    year: 2005,
    description:
      'MMN occurs automatically when a sequence of repetitive standard sounds is interrupted by a rare deviant sound (e.g. pitch or duration oddball). It represents the brain’s pre-attentive sensory memory prediction error without requiring conscious attention.',
    clinicalSignificance:
      'Robustly and consistently diminished in schizophrenia across stages. MMN reduction reflects NMDA-receptor hypofunction on parvalbumin cortical interneurons, directly correlating with functional cognitive capacity and everyday community functioning.',
    waveforms: [
      {
        label: 'Standard Tones (Frequent 1000 Hz)',
        color: '#64748b', // Slate
        points: generateWaveform('mmn-standard'),
      },
      {
        label: 'Deviant Tones (Oddball 1200 Hz)',
        color: '#8b5cf6', // Violet
        points: generateWaveform('mmn-deviant'),
      },
    ],
    peakMarker: {
      timeMs: 175,
      voltageUv: -3.8,
      label: 'Mismatch Negativity (~150-200 ms)',
    },
    notes:
      'Because MMN is pre-attentive, it does not depend on motivation or patient effort, making it one of the most reliable electrophysiological endophenotypes in psychiatric neuroscience.',
  },
  {
    id: 'assr-gamma',
    name: '40 Hz Auditory Steady-State Response (ASSR)',
    subtitle: 'Cortical Synchronization & GABAergic Microcircuits',
    leadResearcher: 'Peter J. Uhlhaas & Wolf Singer',
    year: 2010,
    description:
      'When presented with 40-click-per-second auditory stimulus trains, the auditory cortex synchronizes at exactly 40 Hz (gamma band). Gamma synchrony is orchestrated by fast-spiking parvalbumin-positive GABAergic interneurons.',
    clinicalSignificance:
      'Phase-locking and power of 40 Hz ASSR are selectively impaired in schizophrenia spectrum, explaining difficulties in perceptual binding (integrating disparate sensory features into a coherent unified whole).',
    waveforms: [
      {
        label: 'Evoked 40 Hz Gamma Oscillation',
        color: '#06b6d4', // Cyan
        points: generateWaveform('assr-40hz'),
      },
    ],
    notes:
      'Impaired gamma synchrony reflects timing precision deficits rather than gross anatomical loss, demonstrating an electrophysiological coordination dysfunction.',
  },
];

export const RESEARCH_ARTICLES: ResearchArticle[] = [
  {
    id: 'ford-2004',
    title: 'Electrophysiological Evidence of Corollary Discharge Dysfunction in Schizophrenia During Talking and Thinking',
    authors: 'Judith M. Ford, & Daniel H. Mathalon',
    journal: 'Journal of Psychiatric Research & Schizophrenia Bulletin',
    year: 2004,
    doi: '10.1093/schbul/sbi048',
    category: 'corollary-discharge',
    keyFindings: [
      'In healthy participants, acoustic N100 ERP amplitude is significantly attenuated during self-produced speech compared to passive listening.',
      'In individuals with schizophrenia, N100 suppression during talking was significantly reduced or absent.',
      'Sub-vocal rehearsal and thought processes fail to send an adequate predictive inhibitory efference copy to auditory cortices.',
    ],
    psychoeducationalTakeaway:
      'Hearing voices or having thoughts feel like external sounds has a tangible, measurable neurobiological basis: a subtle timing mismatch in how the brain warns its own auditory cortex that an internal thought is self-generated. It is a sensory signal-tagging difference, not a mystical or sinister force.',
  },
  {
    id: 'frith-1992',
    title: 'The Cognitive Neuropsychology of Schizophrenia: Self-Monitoring and Forward Models',
    authors: 'Christopher D. Frith',
    journal: 'Lawrence Erlbaum Associates / Trends in Neurosciences',
    year: 1992,
    doi: '10.1016/0166-2236(92)90045-8',
    category: 'corollary-discharge',
    keyFindings: [
      'Proposed the seminal forward model of internal action monitoring.',
      'Deficits in self-monitoring cause willed intentions and inner monologue to be registered as external events.',
      'Established the framework connecting motor efference copy to agency attribution.',
    ],
    psychoeducationalTakeaway:
      'When the brain’s internal "agency tracker" doesn’t send its cancellation signal, self-generated inner monologue is perceived as incoming sound from the outside world. Knowing this helps ground the experience in brain circuitry rather than external narratives.',
  },
  {
    id: 'light-braff-2005',
    title: 'Mismatch Negativity Features as an Endophenotype in Schizophrenia Spectrum Disorder',
    authors: 'Gregory A. Light, & David L. Braff',
    journal: 'Biological Psychiatry',
    year: 2005,
    doi: '10.1016/j.biopsych.2005.04.013',
    category: 'mmn',
    keyFindings: [
      'Mismatch negativity (MMN) deficits correlate strongly with real-world functional status, independent of age and medication dosage.',
      'Deficit stems from cortical NMDA-receptor hypofunction in primary sensory regions.',
      'Serves as an objective electrophysiological biomarker in clinical translational trials.',
    ],
    psychoeducationalTakeaway:
      'Sensory differences in processing sound patterns represent fundamental microcircuit properties (how brain cells communicate rapidly via NMDA receptors), validating that sensory fatigue and overload in noisy environments are grounded neurophysiological phenomena.',
  },
  {
    id: 'kapur-2003',
    title: 'Psychosis as a State of Aberrant Salience: A Framework Linking Biology, Phenomenology, and Pharmacology',
    authors: 'Shitij Kapur',
    journal: 'American Journal of Psychiatry',
    year: 2003,
    doi: '10.1176/appi.ajp.160.1.13',
    category: 'aberrant-salience',
    keyFindings: [
      'Hyper-dopaminergic signaling leads to an aberrant assignment of salience to neutral everyday stimuli.',
      'Delusions represent the cognitive mind’s top-down effort to make rational sense of these intensely salient emotional experiences.',
      'Antipsychotic medication attenuates aberrant salience, allowing psychological reality-testing to re-anchor.',
    ],
    psychoeducationalTakeaway:
      'When dopamine surges inappropriately, everyday objects, license plates, or glances feel fraught with profound personal meaning. The belief or story (e.g. "I am being watched") is the brain’s attempt to explain why everything suddenly feels so intensely urgent. Somatosensory grounding calms the autonomic nervous system to defuse this false urgency.',
  },
  {
    id: 'uhlhaas-singer-2010',
    title: 'Abnormal Neural Oscillations and Synchrony in Schizophrenia',
    authors: 'Peter J. Uhlhaas, & Wolf Singer',
    journal: 'Nature Reviews Neuroscience',
    year: 2010,
    doi: '10.1038/nrn2774',
    category: 'oscillations',
    keyFindings: [
      'Deficits in high-frequency gamma (30-80 Hz) and beta band synchrony across distributed networks.',
      'Associated with parvalbumin-expressing GABAergic interneuron hypoactivity.',
      'Explains fragmented cognitive coordination and vulnerability to sensory sensory overload.',
    ],
    psychoeducationalTakeaway:
      'Gamma oscillations act like a conductor’s baton, synchronizing different brain regions. When the conductor’s timing fluctuates, sensory inputs can feel fragmented or intense. Grounding techniques provide strong, rhythmically coherent sensory input that helps re-stabilize cortical rhythm.',
  },
];

export const GROUNDING_STEPS: GroundingStep[] = [
  {
    sense: 'Sight',
    count: 5,
    title: '5 Things You Can See',
    instruction:
      'Look around your physical room right now. Notice 5 distinct objects. Observe their geometric shapes, textures, how light hits their surface, or subtle colors.',
    examples: [
      'The grain of wood on a table',
      'The shadow cast by a window frame',
      'A spot of color on a book spine',
      'The weave of a fabric or cushion',
      'The reflection of light on a glass or screen edge',
    ],
  },
  {
    sense: 'Touch',
    count: 4,
    title: '4 Things You Can Physically Touch',
    instruction:
      'Bring tactile awareness into direct somatosensory contact with 4 physical surfaces. Feel the texture, temperature, and firmness.',
    examples: [
      'The firm pressure of your feet planted flat on the floor',
      'The fabric of your shirt or trousers between your fingertips',
      'The cool, smooth surface of a desk or mug',
      'The supportive resistance of the chair against your back',
    ],
  },
  {
    sense: 'Sound',
    count: 3,
    title: '3 Real External Sounds',
    instruction:
      'Tune into real, physical ambient sounds in your surrounding environment. Focus on neutral, acoustic mechanical or natural sounds.',
    examples: [
      'The low, steady hum of a refrigerator or computer fan',
      'A distant vehicle or gentle wind outside',
      'Your own steady, rhythmic breathing sound as air enters your nose',
    ],
  },
  {
    sense: 'Smell',
    count: 2,
    title: '2 Scents You Can Detect',
    instruction:
      'Inhale gently through your nose and detect 2 natural scents in the air or nearby objects.',
    examples: [
      'The scent of fresh air, soap, or clean laundry',
      'The aroma of coffee, tea, or a wooden pencil',
    ],
  },
  {
    sense: 'Taste',
    count: 1,
    title: '1 Taste in Your Mouth',
    instruction:
      'Notice any lingering taste in your mouth, or take a deliberate, refreshing sip of cold water and feel the moisture on your tongue.',
    examples: [
      'A cold sip of clean water coating your mouth',
      'The fresh minty hint of toothpaste or neutral clean saliva',
    ],
  },
];

export const SUGGESTED_QUERIES = [
  {
    title: 'N100 Corollary Discharge',
    query: 'Can you explain N100 corollary discharge and why internal thoughts can sometimes feel like external voices?',
    category: 'Electrophysiology',
  },
  {
    title: 'Sensory Attenuation Deficits',
    query: 'What does EEG research demonstrate about sensory attenuation during self-produced speech versus listening?',
    category: 'EEG Biomarkers',
  },
  {
    title: 'Mismatch Negativity (MMN)',
    query: 'How does Mismatch Negativity (MMN) index predictive coding and NMDA receptor function in schizophrenia spectrum conditions?',
    category: 'Biomarkers',
  },
  {
    title: 'Somatosensory Grounding',
    query: 'I am experiencing perceptual overload and feeling ungrounded. Can you guide me through a somatosensory grounding technique?',
    category: 'Coping Strategies',
  },
  {
    title: 'Aberrant Salience & Stress',
    query: 'Why does heightened anxiety and dopamine dysregulation make everyday neutral events feel intensely meaningful or threatening?',
    category: 'Neurobiology',
  },
  {
    title: '40 Hz Gamma Oscillations',
    query: 'What role do 40 Hz gamma oscillations and parvalbumin GABAergic interneurons play in sensory binding?',
    category: 'Electrophysiology',
  },
];
