import React, { useState } from 'react';
import { BookOpen, Search, ExternalLink, Bookmark, ShieldCheck, Check, Sparkles, Filter } from 'lucide-react';
import { RESEARCH_ARTICLES } from '../data/neuroscienceData';
import { ResearchArticle } from '../types/neuro';

export const KnowledgeBase: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>('ford-2004');

  const filteredArticles = RESEARCH_ARTICLES.filter((article) => {
    const matchesCategory =
      selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.psychoeducationalTakeaway.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Electrophysiological Neuroscience Repository
            </h1>
            <p className="text-xs text-slate-400">
              Published peer-reviewed literature translated into destigmatizing, reality-grounded psychoeducation
            </p>
          </div>
        </div>
      </div>

      {/* Search and Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles by topic, author, or electrophysiological concept..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Domains' },
            { id: 'corollary-discharge', label: 'Corollary Discharge' },
            { id: 'mmn', label: 'MMN & Prediction' },
            { id: 'aberrant-salience', label: 'Aberrant Salience' },
            { id: 'oscillations', label: 'Gamma Oscillations' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Articles List */}
      <div className="space-y-4">
        {filteredArticles.map((article: ResearchArticle) => {
          const isExpanded = expandedArticleId === article.id;

          return (
            <div
              key={article.id}
              className={`bg-slate-900 border rounded-2xl transition-all overflow-hidden ${
                isExpanded ? 'border-cyan-500/50 shadow-md' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div
                onClick={() => setExpandedArticleId(isExpanded ? null : article.id)}
                className="p-5 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                      {article.category.replace('-', ' ')}
                    </span>
                    <span className="text-xs text-slate-400">
                      {article.journal} • {article.year}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white hover:text-cyan-300 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-xs text-slate-400">{article.authors}</p>
                </div>

                <div className="shrink-0 text-xs text-cyan-400 font-semibold self-end sm:self-center">
                  {isExpanded ? 'Collapse' : 'Explore Findings'}
                </div>
              </div>

              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 space-y-4 text-xs">
                  {/* Psychoeducational Takeaway Callout */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-emerald-950/20 to-slate-950 border border-cyan-700/40 text-slate-200">
                    <div className="flex items-center gap-1.5 font-bold text-cyan-300 uppercase tracking-wider text-[11px] mb-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      Reality-Grounded Psychoeducational Insight
                    </div>
                    <p className="text-xs leading-relaxed text-slate-300">
                      {article.psychoeducationalTakeaway}
                    </p>
                  </div>

                  {/* Key Empirical Findings */}
                  <div>
                    <h4 className="font-semibold text-slate-300 mb-2">Key Electrophysiological Findings:</h4>
                    <ul className="space-y-2">
                      {article.keyFindings.map((finding, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-400">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Reference Citation Footer */}
                  {article.doi && (
                    <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-1">
                      <span>DOI:</span>
                      <span className="text-slate-400 font-mono">{article.doi}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filteredArticles.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-xs bg-slate-900/50 rounded-2xl border border-slate-800">
            No scientific articles found matching "{searchQuery}". Try selecting another domain.
          </div>
        )}
      </div>

      {/* Clinical Reality Grounding Summary Card */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-2.5">
        <div className="flex items-center gap-2 font-bold text-white">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Understanding Perceptual Anomalies Without Fear or Mystification</span>
        </div>
        <p className="text-slate-400 leading-relaxed text-[12px]">
          Electrophysiological neuroscience emphasizes that unusual auditory experiences, thought-echo sensations, or feelings of intense personal significance are caused by measurable neural circuit timing mismatches (such as failure of the corollary discharge efference copy or aberrant dopamine-mediated salience). Understanding this neurobiology strips away feelings of supernatural or persecutory causation and grounds recovery in evidence-based clinical partnerships and somatosensory coping.
        </p>
      </div>
    </div>
  );
};
