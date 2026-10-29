import React, { useState } from 'react';
import { ERP_CONDITIONS } from '../data/neuroscienceData';
import { Activity, Sliders, Info, Zap, HelpCircle, Layers, CheckCircle2 } from 'lucide-react';

export const ErpVisualizer: React.FC = () => {
  const [selectedConditionId, setSelectedConditionId] = useState<string>('n100-cd');
  const [cdStrength, setCdStrength] = useState<number>(65); // Corollary discharge suppression %
  const [showAnatomyGuide, setShowAnatomyGuide] = useState<boolean>(true);

  const condition = ERP_CONDITIONS.find((c) => c.id === selectedConditionId) || ERP_CONDITIONS[0];

  // SVG coordinate transformation
  // Time domain: -50ms to 450ms -> SVG width 700
  // Voltage domain: -8uV to +8uV -> SVG height 320
  const width = 720;
  const height = 300;
  const padding = { top: 30, right: 30, bottom: 40, left: 55 };

  const timeToX = (timeMs: number) => {
    return (
      padding.left +
      ((timeMs - -50) / (450 - -50)) * (width - padding.left - padding.right)
    );
  };

  // Note in EEG/ERP tradition: Negative voltages are often plotted UPWARD (or downward with clear labeling).
  // We'll plot positive downward or standard Cartesian with clear negative polarity markers.
  // Standard Cartesian: center 0uV in vertical middle.
  const voltageToY = (voltageUv: number) => {
    // Top is -8 uV (negative up in standard ERP), Bottom is +8 uV
    const minV = -8;
    const maxV = 8;
    return (
      padding.top +
      ((voltageUv - minV) / (maxV - minV)) * (height - padding.top - padding.bottom)
    );
  };

  // Interactive dynamic calculation for N100 if selected
  const dynamicTalkPoints = condition.id === 'n100-cd'
    ? condition.waveforms[0].points.map((p) => {
        // Suppress N100 amplitude based on cdStrength slider (65% = normal, 10% = attenuated suppression)
        const attenuationFactor = 1 - cdStrength / 100;
        let v = p.voltageUv;
        if (p.timeMs > 50 && p.timeMs < 150) {
          // Attenuate N100 peak region
          v = p.voltageUv * (0.35 + 0.65 * attenuationFactor);
        }
        return { timeMs: p.timeMs, voltageUv: Math.round(v * 100) / 100 };
      })
    : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Electrophysiology & ERP Biomarker Lab
              </h1>
              <p className="text-xs text-slate-400">
                Interactive simulations of event-related potentials (ERPs) in auditory sensory gating and corollary discharge
              </p>
            </div>
          </div>
        </div>

        {/* Condition Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto">
          {ERP_CONDITIONS.map((cond) => (
            <button
              key={cond.id}
              onClick={() => setSelectedConditionId(cond.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedConditionId === cond.id
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {cond.name.split('&')[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Lab Canvas and Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Center: Interactive Waveform Graph */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                {condition.name}
              </h2>
              <span className="text-xs text-cyan-400">{condition.subtitle}</span>
            </div>
            <div className="text-[11px] text-slate-400 text-right">
              <span className="font-medium text-slate-300">{condition.leadResearcher}</span> ({condition.year})
            </div>
          </div>

          {/* ERP Waveform SVG */}
          <div className="w-full bg-slate-950/90 rounded-xl border border-slate-800/80 p-2 overflow-x-auto">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full min-w-[500px] h-auto select-none"
            >
              {/* Grid Lines */}
              {[-50, 0, 100, 200, 300, 400].map((t) => (
                <line
                  key={`v-${t}`}
                  x1={timeToX(t)}
                  y1={padding.top}
                  x2={timeToX(t)}
                  y2={height - padding.bottom}
                  stroke={t === 0 ? '#475569' : '#1e293b'}
                  strokeWidth={t === 0 ? 1.5 : 1}
                  strokeDasharray={t === 0 ? undefined : '2 2'}
                />
              ))}

              {[-6, -4, -2, 0, 2, 4, 6].map((v) => (
                <line
                  key={`h-${v}`}
                  x1={padding.left}
                  y1={voltageToY(v)}
                  x2={width - padding.right}
                  y2={voltageToY(v)}
                  stroke={v === 0 ? '#475569' : '#1e293b'}
                  strokeWidth={v === 0 ? 1.5 : 1}
                  strokeDasharray={v === 0 ? undefined : '2 2'}
                />
              ))}

              {/* Axis Labels */}
              <text
                x={timeToX(0) + 4}
                y={padding.top + 12}
                fill="#94a3b8"
                fontSize="10"
                fontFamily="sans-serif"
              >
                Stimulus Onset (0 ms)
              </text>
              <text
                x={width - padding.right - 10}
                y={voltageToY(0) - 8}
                fill="#64748b"
                fontSize="10"
                fontFamily="sans-serif"
                textAnchor="end"
              >
                Time (ms)
              </text>

              {[-50, 0, 100, 200, 300, 400].map((t) => (
                <text
                  key={`tx-${t}`}
                  x={timeToX(t)}
                  y={height - padding.bottom + 16}
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="sans-serif"
                  textAnchor="middle"
                >
                  {t}
                </text>
              ))}

              {[-6, -3, 0, 3, 6].map((v) => (
                <text
                  key={`ty-${v}`}
                  x={padding.left - 8}
                  y={voltageToY(v) + 3}
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="sans-serif"
                  textAnchor="end"
                >
                  {v > 0 ? `+${v}` : v} µV
                </text>
              ))}

              {/* Peak Marker Highlight if exists */}
              {condition.peakMarker && (
                <g>
                  <circle
                    cx={timeToX(condition.peakMarker.timeMs)}
                    cy={voltageToY(condition.peakMarker.voltageUv)}
                    r="4.5"
                    fill="#38bdf8"
                    className="animate-ping"
                    opacity="0.6"
                  />
                  <circle
                    cx={timeToX(condition.peakMarker.timeMs)}
                    cy={voltageToY(condition.peakMarker.voltageUv)}
                    r="4"
                    fill="#38bdf8"
                  />
                  <text
                    x={timeToX(condition.peakMarker.timeMs)}
                    y={voltageToY(condition.peakMarker.voltageUv) - 10}
                    fill="#38bdf8"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {condition.peakMarker.label}
                  </text>
                </g>
              )}

              {/* Static Waveforms */}
              {condition.waveforms.map((wf, idx) => {
                const pts =
                  condition.id === 'n100-cd' && wf.label.includes('Self-Produced') && dynamicTalkPoints
                    ? dynamicTalkPoints
                    : wf.points;

                const pathData = pts
                  .map((p, i) => `${i === 0 ? 'M' : 'L'} ${timeToX(p.timeMs)} ${voltageToY(p.voltageUv)}`)
                  .join(' ');

                return (
                  <path
                    key={idx}
                    d={pathData}
                    fill="none"
                    stroke={wf.color}
                    strokeWidth="2.5"
                    strokeDasharray={wf.dash}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={condition.id === 'n100-cd' && wf.label.includes('Schizophrenia') ? 0.75 : 1}
                  />
                );
              })}
            </svg>
          </div>

          {/* Waveform Legend */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
            {condition.waveforms.map((wf, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span
                  className="w-4 h-1 rounded-full inline-block"
                  style={{
                    backgroundColor: wf.color,
                    borderStyle: wf.dash ? 'dashed' : 'solid',
                  }}
                />
                <span className="text-slate-300 font-medium">{wf.label}</span>
              </div>
            ))}
          </div>

          {/* Interactive Slider for N100 Corollary Discharge */}
          {condition.id === 'n100-cd' && (
            <div className="mt-5 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span>Simulate Efference Copy / Corollary Discharge Strength:</span>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    cdStrength > 40
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  {cdStrength}% Attenuation ({cdStrength > 40 ? 'Neurotypical Suppression' : 'Reduced Suppression'})
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="85"
                value={cdStrength}
                onChange={(e) => setCdStrength(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                <span>0-25%: Talk N100 ≈ Listen N100 (Efference failure / Hallucinatory vulnerability)</span>
                <span>60-80%: Typical Motor-Sensory Dampening</span>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="mt-4 p-3 rounded-xl bg-cyan-950/20 border border-cyan-800/30 text-xs text-slate-300 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p>{condition.notes}</p>
          </div>
        </div>

        {/* Right Column: Educational Breakdown & Anatomical Model */}
        <div className="space-y-4">
          {/* Neuroscientific Mechanism */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Electrophysiological Mechanism</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {condition.description}
            </p>
          </div>

          {/* Clinical Significance & Destigmatization */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Psychoeducational Significance</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {condition.clinicalSignificance}
            </p>
          </div>

          {/* Anatomical Forward Model Schematic */}
          {condition.id === 'n100-cd' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  Forward Model Circuit
                </span>
                <button
                  onClick={() => setShowAnatomyGuide(!showAnatomyGuide)}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300"
                >
                  {showAnatomyGuide ? 'Hide details' : 'Show details'}
                </button>
              </div>

              {showAnatomyGuide && (
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-900/60 text-cyan-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                      1
                    </span>
                    <div>
                      <strong className="text-slate-200">Broca’s Area (Left IFG):</strong>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Initiates motor speech plan & internal dialogue.
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-900/60 text-cyan-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                      2
                    </span>
                    <div>
                      <strong className="text-slate-200">Arcuate Fasciculus:</strong>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        White-matter tract relaying efference copy (corollary discharge) to auditory cortex.
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-900/60 text-cyan-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                      3
                    </span>
                    <div>
                      <strong className="text-slate-200">Superior Temporal Gyrus (Auditory Cortex):</strong>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Suppresses N100 amplitude when receiving corollary discharge, confirming self-agency.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
