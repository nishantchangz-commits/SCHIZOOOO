import React from 'react';
import { AlertCircle, ShieldCheck } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-800 bg-slate-950/90 text-slate-400 py-4 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-3 text-xs leading-relaxed">
        <div className="flex items-center gap-2 text-cyan-400 shrink-0 font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>Clinical & Safety Boundary:</span>
        </div>
        <p className="text-slate-400 text-center md:text-left">
          <strong className="text-slate-300">DISCLAIMER:</strong> This application is an educational and psychoeducational tool powered by AI. It is <strong className="text-slate-300">NOT</strong> a clinical diagnostic instrument, prescriber of treatment, or substitute for evaluation by a licensed psychiatrist or physician. If you are experiencing acute distress, contact emergency services or dial <strong className="text-rose-400">988</strong>.
        </p>
      </div>
    </footer>
  );
};
