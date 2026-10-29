import React, { useState } from 'react';
import { Header } from './components/Header';
import { ChatAssistant } from './components/ChatAssistant';
import { ErpVisualizer } from './components/ErpVisualizer';
import { GroundingSuite } from './components/GroundingSuite';
import { KnowledgeBase } from './components/KnowledgeBase';
import { CrisisModal } from './components/CrisisModal';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { ActiveTab } from './types/neuro';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCrisis={() => setIsCrisisModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'chat' && (
          <ChatAssistant
            onNavigateTab={setActiveTab}
            onOpenCrisis={() => setIsCrisisModalOpen(true)}
          />
        )}
        {activeTab === 'erp-lab' && <ErpVisualizer />}
        {activeTab === 'grounding' && <GroundingSuite />}
        {activeTab === 'library' && <KnowledgeBase />}
      </main>

      {/* Mandatory Non-Clinical Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Crisis Support Overlay Modal */}
      <CrisisModal
        isOpen={isCrisisModalOpen}
        onClose={() => setIsCrisisModalOpen(false)}
        onOpenGrounding={() => {
          setIsCrisisModalOpen(false);
          setActiveTab('grounding');
        }}
      />
    </div>
  );
}
