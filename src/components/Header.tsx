import React from 'react';
import { Activity, Brain, ShieldAlert, Sparkles, BookOpen, Compass } from 'lucide-react';
import { ActiveTab } from '../types/neuro';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenCrisis: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenCrisis }) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-emerald-400 p-0.5 shadow-md flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Brain className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">NeuroRetrieval</span>
              <span className="hidden sm:inline-flex text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/50">
                Psychoeducational AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Electrophysiological Neuroscience & Reality Grounding
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Desktop & Tablet) */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'chat'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Assistant
          </button>
          <button
            onClick={() => setActiveTab('erp-lab')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'erp-lab'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            ERP Biomarker Lab
          </button>
          <button
            onClick={() => setActiveTab('grounding')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'grounding'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Sensory Grounding
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'library'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Neuro Library
          </button>
        </nav>

        {/* Emergency / Crisis Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCrisis}
            className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm animate-pulse hover:animate-none"
            title="Immediate Crisis Resources & 988"
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Crisis Help (988)</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 bg-slate-950/80 px-2 py-1.5">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-1.5 text-center text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'chat' ? 'bg-cyan-600/30 text-cyan-300' : 'text-slate-400'
          }`}
        >
          Assistant
        </button>
        <button
          onClick={() => setActiveTab('erp-lab')}
          className={`flex-1 py-1.5 text-center text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'erp-lab' ? 'bg-cyan-600/30 text-cyan-300' : 'text-slate-400'
          }`}
        >
          ERP Lab
        </button>
        <button
          onClick={() => setActiveTab('grounding')}
          className={`flex-1 py-1.5 text-center text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'grounding' ? 'bg-cyan-600/30 text-cyan-300' : 'text-slate-400'
          }`}
        >
          Grounding
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`flex-1 py-1.5 text-center text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'library' ? 'bg-cyan-600/30 text-cyan-300' : 'text-slate-400'
          }`}
        >
          Library
        </button>
      </div>
    </header>
  );
};
