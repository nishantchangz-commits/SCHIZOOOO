import React, { useState, useEffect, useRef } from 'react';
import { Compass, Wind, Droplets, CheckCircle, Volume2, VolumeX, RotateCcw, Sparkles, ChevronRight, ShieldCheck } from 'lucide-react';
import { GROUNDING_STEPS } from '../data/neuroscienceData';
import { playSoothingChime } from '../utils/audioChime';

type GroundingMode = '54321' | 'box-breathing' | 'tactile-reset';

export const GroundingSuite: React.FC = () => {
  const [mode, setMode] = useState<GroundingMode>('54321');

  // 5-4-3-2-1 State
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});
  const [customObservations, setCustomObservations] = useState<string>('');

  // 4-4-4-4 Box Breathing State
  const [isBreathingActive, setIsBreathingActive] = useState<boolean>(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold (Full)' | 'Exhale' | 'Hold (Empty)'>('Inhale');
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState<number>(4);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [cycleCount, setCycleCount] = useState<number>(0);

  const step = GROUNDING_STEPS[currentStepIndex];

  // Box Breathing Timer Effect
  useEffect(() => {
    if (!isBreathingActive) return;

    const timer = setInterval(() => {
      setPhaseSecondsLeft((prev) => {
        if (prev > 1) {
          return prev - 1;
        }

        // Phase Transition
        setBreathPhase((current) => {
          let nextPhase: 'Inhale' | 'Hold (Full)' | 'Exhale' | 'Hold (Empty)';
          let chimeFreq = 432;

          if (current === 'Inhale') {
            nextPhase = 'Hold (Full)';
            chimeFreq = 528;
          } else if (current === 'Hold (Full)') {
            nextPhase = 'Exhale';
            chimeFreq = 396;
          } else if (current === 'Exhale') {
            nextPhase = 'Hold (Empty)';
            chimeFreq = 432;
          } else {
            nextPhase = 'Inhale';
            chimeFreq = 480;
            setCycleCount((c) => c + 1);
          }

          if (soundEnabled) {
            playSoothingChime(chimeFreq, 0.8);
          }

          return nextPhase;
        });

        return 4; // Reset to 4 seconds
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isBreathingActive, soundEnabled]);

  const toggleCheck = (idx: number) => {
    const key = `${currentStepIndex}-${idx}`;
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNextStep = () => {
    if (currentStepIndex < GROUNDING_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      setCustomObservations('');
      if (soundEnabled) playSoothingChime(528, 0.5);
    }
  };

  const handleReset54321 = () => {
    setCurrentStepIndex(0);
    setCheckedItems({});
    setCustomObservations('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Somatosensory Grounding Suite
            </h1>
            <p className="text-xs text-slate-400">
              Evidence-based sensory anchoring to defuse autonomic overload and re-establish physical presence
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setMode('54321')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              mode === '54321'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            5-4-3-2-1 Grounding
          </button>
          <button
            onClick={() => setMode('box-breathing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              mode === 'box-breathing'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            4-4-4-4 Box Breathing
          </button>
          <button
            onClick={() => setMode('tactile-reset')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              mode === 'tactile-reset'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            Tactile Reset
          </button>
        </div>
      </div>

      {/* Mode 1: 5-4-3-2-1 Somatosensory Anchor */}
      {mode === '54321' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-sm space-y-6">
          {/* Stepper Progress */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Step {currentStepIndex + 1} of {GROUNDING_STEPS.length}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-sm font-semibold text-white">{step.title}</span>
            </div>
            <button
              onClick={handleReset54321}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Start Over
            </button>
          </div>

          {/* Step Guidance */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-slate-200 text-sm leading-relaxed">
            <p className="font-medium text-emerald-300 mb-1">{step.instruction}</p>
            <p className="text-xs text-slate-400">
              Focus entirely on direct sensory contact in the physical room around you. Do not rush.
            </p>
          </div>

          {/* Interactive Checkable Sensory Items */}
          <div className="space-y-2.5">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Tap or check off items as you physically identify them:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {step.examples.map((ex, idx) => {
                const isChecked = !!checkedItems[`${currentStepIndex}-${idx}`];
                return (
                  <button
                    key={idx}
                    onClick={() => toggleCheck(idx)}
                    className={`p-3.5 rounded-xl border text-left text-xs transition-all flex items-start gap-3 ${
                      isChecked
                        ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                        isChecked
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'border-slate-600'
                      }`}
                    >
                      {isChecked && <CheckCircle className="w-3.5 h-3.5" />}
                    </div>
                    <span>{ex}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Direct Observation Input */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-medium text-slate-400">
              Describe what you specifically notice in your room right now (optional reality anchor):
            </label>
            <input
              type="text"
              value={customObservations}
              onChange={(e) => setCustomObservations(e.target.value)}
              placeholder="e.g. The green leaves on my plant; the sound of distant rain; the cool oak desk under my palms..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Bottom Action */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <div className="text-xs text-slate-400">
              {currentStepIndex === GROUNDING_STEPS.length - 1 ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Full Somatosensory Sequence Completed
                </span>
              ) : (
                <span>Bring your full sensory focus into the current step.</span>
              )}
            </div>

            {currentStepIndex < GROUNDING_STEPS.length - 1 ? (
              <button
                onClick={handleNextStep}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <span>Next Step: {GROUNDING_STEPS[currentStepIndex + 1].sense}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleReset54321}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                Repeat Exercise
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mode 2: 4-4-4-4 Box Breathing Visualizer */}
      {mode === 'box-breathing' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col items-center text-center space-y-6">
          <div className="max-w-md">
            <h2 className="text-base font-bold text-white">Autonomic 4-4-4-4 Box Breathing</h2>
            <p className="text-xs text-slate-400 mt-1">
              Equal-ratio diaphragmatic respiration stimulates the vagus nerve, reducing autonomic hyperarousal and restoring cortical sensory gating.
            </p>
          </div>

          {/* Animated Visual Box / Orb */}
          <div className="relative w-64 h-64 flex items-center justify-center my-4">
            {/* Outer Target Box Ring */}
            <div className="absolute inset-0 rounded-3xl border-2 border-dashed border-slate-800" />

            {/* Glowing Pulsing Circle */}
            <div
              className={`rounded-full transition-all duration-1000 flex flex-col items-center justify-center shadow-lg ${
                breathPhase === 'Inhale'
                  ? 'w-48 h-48 bg-emerald-500/20 border-2 border-emerald-400/80 scale-100'
                  : breathPhase === 'Hold (Full)'
                  ? 'w-48 h-48 bg-cyan-500/25 border-2 border-cyan-400 scale-105'
                  : breathPhase === 'Exhale'
                  ? 'w-32 h-32 bg-teal-500/15 border-2 border-teal-500/70 scale-90'
                  : 'w-32 h-32 bg-slate-800/40 border-2 border-slate-700 scale-85'
              }`}
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                {isBreathingActive ? breathPhase : 'Ready'}
              </span>
              <span className="text-4xl font-extrabold text-white mt-1">
                {isBreathingActive ? phaseSecondsLeft : 4}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">seconds</span>
            </div>
          </div>

          {/* Step Sequence Indicators */}
          <div className="grid grid-cols-4 gap-2 w-full max-w-md text-xs">
            <div
              className={`p-2 rounded-lg border text-center transition-colors ${
                isBreathingActive && breathPhase === 'Inhale'
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              1. Inhale (4s)
            </div>
            <div
              className={`p-2 rounded-lg border text-center transition-colors ${
                isBreathingActive && breathPhase === 'Hold (Full)'
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              2. Hold (4s)
            </div>
            <div
              className={`p-2 rounded-lg border text-center transition-colors ${
                isBreathingActive && breathPhase === 'Exhale'
                  ? 'bg-teal-950 border-teal-500 text-teal-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              3. Exhale (4s)
            </div>
            <div
              className={`p-2 rounded-lg border text-center transition-colors ${
                isBreathingActive && breathPhase === 'Hold (Empty)'
                  ? 'bg-indigo-950 border-indigo-500 text-indigo-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              4. Hold (4s)
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (!isBreathingActive && soundEnabled) {
                  playSoothingChime(432, 0.8);
                }
                setIsBreathingActive(!isBreathingActive);
              }}
              className={`px-6 py-2.5 rounded-xl font-semibold text-xs transition-colors shadow-sm ${
                isBreathingActive
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isBreathingActive ? 'Pause Breathing Exercise' : 'Start 4-4-4-4 Box Breathing'}
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
              title={soundEnabled ? 'Mute soothing bell' : 'Enable soothing bell'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
          </div>

          {cycleCount > 0 && (
            <div className="text-xs text-emerald-400 font-medium">
              Completed {cycleCount} full box cycles. Notice the gentle slowing of your heart rate.
            </div>
          )}
        </div>
      )}

      {/* Mode 3: Tactile & Temperature Reset */}
      {mode === 'tactile-reset' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Somatosensory & Temperature Shock Protocols</h2>
              <p className="text-xs text-slate-400">
                Direct somatic interventions leveraging the mammalian dive reflex and proprioceptive feedback
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Protocol 1 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-cyan-400" />
                Cold Water Facial Splash
              </div>
              <p className="text-slate-300 leading-relaxed">
                Splash cool or cold water across your forehead, cheeks, and eyes for 15-30 seconds, or hold a cool damp washcloth against your face.
              </p>
              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-900">
                <strong>Mechanism:</strong> Triggers the trigeminal-cardiac vagal reflex, rapidly dropping heart rate and defusing aberrant autonomic fight-or-flight activation.
              </div>
            </div>

            {/* Protocol 2 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-emerald-400" />
                Firm Proprioceptive Press
              </div>
              <p className="text-slate-300 leading-relaxed">
                Place your bare feet flat on the floor and press down with 50% pressure. Simultaneously, press your hands flat against your thighs or together in prayer position.
              </p>
              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-900">
                <strong>Mechanism:</strong> Floods primary somatosensory cortex (S1) with robust ascending tactile signals, interrupting loop circuits of aberrant cognitive rumination.
              </div>
            </div>

            {/* Protocol 3 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Textured Tactile Hold
              </div>
              <p className="text-slate-300 leading-relaxed">
                Pick up a physical object with definite physical texture (e.g. an ice cube, a metal key, a textured stone, or a rough fabric). Rotate it in your fingertips.
              </p>
              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-900">
                <strong>Mechanism:</strong> Engages high-resolution Meissner and Merkel cutaneous mechanoreceptors, establishing an unmistakable baseline of physical, tactile reality.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
