import React from 'react';
import { Phone, MessageSquare, ExternalLink, X, ShieldAlert, Heart, Activity } from 'lucide-react';

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGrounding: () => void;
}

export const CrisisModal: React.FC<CrisisModalProps> = ({ isOpen, onClose, onOpenGrounding }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-rose-500/30 rounded-2xl shadow-2xl overflow-hidden text-slate-100 p-6 md:p-8"
        role="dialog"
        aria-labelledby="crisis-title"
      >
        {/* Top Accent Warning Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500" />

        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 id="crisis-title" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Immediate Crisis Support & Resources
              </h2>
              <p className="text-sm text-slate-400">
                Free, confidential, and compassionate help is available 24/7.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Compassionate Message */}
        <div className="my-5 p-4 rounded-xl bg-rose-950/30 border border-rose-800/40 text-slate-200 text-sm leading-relaxed flex items-start gap-3">
          <Heart className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <p>
            If you are experiencing overwhelming distress, feeling unsafe, or thinking of self-harm, please connect with someone who can support you right now. You do not have to carry this alone.
          </p>
        </div>

        {/* Hotlines Grid */}
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-rose-400/50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 uppercase tracking-wider">
                  US & Canada • 24/7
                </span>
                <span className="font-semibold text-white">988 Suicide & Crisis Lifeline</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Call or text 988. Free, confidential mental health crisis support.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href="tel:988"
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" /> Call 988
              </a>
              <a
                href="sms:988"
                className="px-3.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Text 988
              </a>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-cyan-400/50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 uppercase tracking-wider">
                  US, UK & Canada • 24/7
                </span>
                <span className="font-semibold text-white">Crisis Text Line</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Text HOME to 741741 to connect with a live crisis counselor.
              </p>
            </div>
            <a
              href="sms:741741?body=HOME"
              className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Text 741741
            </a>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase tracking-wider">
                  Worldwide
                </span>
                <span className="font-semibold text-white">International Helplines Directory</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Free, local helplines and crisis chat in over 130 countries.
              </p>
            </div>
            <a
              href="https://findahelpline.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Find Local Line
            </a>
          </div>
        </div>

        {/* Immediate somatosensory grounding alternative */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onOpenGrounding();
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 hover:bg-emerald-900/60 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            Switch to 5-4-3-2-1 Sensory Grounding Tool
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Return to Educational Assistant
          </button>
        </div>
      </div>
    </div>
  );
};
