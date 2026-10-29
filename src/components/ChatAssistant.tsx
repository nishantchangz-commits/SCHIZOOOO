import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  RefreshCw,
  ShieldAlert,
  Brain,
  Compass,
  Activity,
  AlertTriangle,
  Info,
  Copy,
  Check,
  User,
} from 'lucide-react';
import { ChatMessage, ActiveTab } from '../types/neuro';
import { SUGGESTED_QUERIES } from '../data/neuroscienceData';

interface ChatAssistantProps {
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenCrisis: () => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content: `Welcome to the NeuroRetrieval Psychoeducational Assistant.

I specialize in electrophysiological neuroscience—including EEG biomarkers, the N100 corollary discharge mechanism, sensory attenuation deficits, Mismatch Negativity (MMN), and cortical synchrony—with a focus on reality-grounded psychoeducation and evidence-based coping.

How can I assist your scientific learning or provide grounded neurobiological clarity today? You can choose one of the foundational research inquiries below or ask your own question.

DISCLAIMER: This application is an educational and psychoeducational tool powered by AI. It is NOT a clinical diagnostic instrument, prescriber of treatment, or substitute for evaluation by a licensed psychiatrist or physician. If you are experiencing acute distress, contact emergency services or dial 988.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ onNavigateTab, onOpenCrisis }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!queryText) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isCrisisOverride: data.isCrisisOverride,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `I apologize, but an error occurred while connecting to the assistant. Please try again in a moment.

If you are experiencing acute distress, please reach out to emergency resources or dial 988.

DISCLAIMER: This application is an educational and psychoeducational tool powered by AI. It is NOT a clinical diagnostic instrument, prescriber of treatment, or substitute for evaluation by a licensed psychiatrist or physician. If you are experiencing acute distress, contact emergency services or dial 988.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-5xl mx-auto px-3 sm:px-6 py-4">
      {/* Top Clinical & Safety Banner */}
      <div className="mb-3 px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            <strong>Clinical Boundary:</strong> All discussions are grounded in published electrophysiological neuroscience. The assistant never diagnoses, prescribes, or validates ungrounded premises.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            onClick={() => onNavigateTab('grounding')}
            className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/40 text-emerald-300 text-[11px] font-medium flex items-center gap-1 transition-colors"
          >
            <Compass className="w-3 h-3 text-emerald-400" />
            Grounding Tools
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Reset conversation"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isCrisis = msg.isCrisisOverride;

          // Split content into body and disclaimer if disclaimer is present
          const disclaimerIndex = msg.content.indexOf('DISCLAIMER: This application is an educational');
          let mainBody = msg.content;
          let disclaimerText = '';

          if (!isUser && disclaimerIndex !== -1) {
            mainBody = msg.content.substring(0, disclaimerIndex).trim();
            disclaimerText = msg.content.substring(disclaimerIndex).trim();
          }

          return (
            <div
              key={msg.id}
              className={`flex gap-3 text-sm ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    isCrisis
                      ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400'
                      : 'bg-cyan-950 border border-cyan-800/60 text-cyan-400'
                  }`}
                >
                  {isCrisis ? <ShieldAlert className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
                </div>
              )}

              <div
                className={`relative max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 sm:p-5 shadow-sm leading-relaxed ${
                  isUser
                    ? 'bg-cyan-700 text-white rounded-tr-sm'
                    : isCrisis
                    ? 'bg-rose-950/40 border-2 border-rose-600/60 text-rose-100 rounded-tl-sm'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm'
                }`}
              >
                {/* Crisis Header Alert */}
                {isCrisis && (
                  <div className="mb-3 pb-2.5 border-b border-rose-700/50 flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      Immediate Crisis Protocol Activated
                    </span>
                    <button
                      onClick={onOpenCrisis}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
                    >
                      Open Hotlines
                    </button>
                  </div>
                )}

                {/* Message Body */}
                <div className="whitespace-pre-wrap font-sans text-[13.5px] sm:text-[14px]">
                  {mainBody}
                </div>

                {/* Contextual Action Chips for Assistant */}
                {!isUser && !isCrisis && (
                  <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
                    <button
                      onClick={() => onNavigateTab('erp-lab')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-750 text-cyan-300 border border-cyan-800/40 hover:border-cyan-600/60 transition-all flex items-center gap-1"
                    >
                      <Activity className="w-3 h-3 text-cyan-400" />
                      View N100 Waveform Simulation
                    </button>
                    <button
                      onClick={() => onNavigateTab('grounding')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-750 text-emerald-300 border border-emerald-800/40 hover:border-emerald-600/60 transition-all flex items-center gap-1"
                    >
                      <Compass className="w-3 h-3 text-emerald-400" />
                      Interactive 5-4-3-2-1 Sensory Reset
                    </button>
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="ml-auto p-1 text-slate-400 hover:text-slate-200 rounded transition-colors"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}

                {/* Disclaimer Callout Block */}
                {disclaimerText && (
                  <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 flex items-start gap-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{disclaimerText}</span>
                  </div>
                )}

                <div
                  className={`mt-2 text-[10px] text-right ${
                    isUser ? 'text-cyan-200/70' : 'text-slate-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-slate-300">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 text-sm">
            <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-800/60 text-cyan-400 flex items-center justify-center shrink-0 animate-pulse">
              <Brain className="w-4 h-4" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-sm p-4 text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs">Synthesizing electrophysiological evidence & reality-grounded response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Inquiries (Shown especially early or for quick exploration) */}
      {messages.length <= 3 && !isLoading && (
        <div className="mt-3 mb-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Recommended Neuroscience & Coping Inquiries:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {SUGGESTED_QUERIES.slice(0, 3).map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(item.query)}
                className="text-left p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-700/50 text-slate-300 text-xs transition-all flex flex-col justify-between group"
              >
                <span className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </span>
                <span className="text-[11px] text-slate-400 line-clamp-1 mt-1">
                  {item.query}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="mt-3 flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about N100 corollary discharge, sensory attenuation, MMN, or somatosensory grounding..."
            disabled={isLoading}
            className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors disabled:opacity-60"
          />
        </div>
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-4 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl font-medium transition-all shadow-sm flex items-center justify-center shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
