'use client';

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

// Local imports
import { sections, transparentDark, codeExamples, type SectionId, type CodeTab } from './_lib';
import {
  GettingStartedContent,
  CheckoutDemo,
  InvoiceDemo,
  PlansDemo,
  BalanceDemo,
  TransactionHistoryDemo,
  FiatOnRampDemo,
} from './_components';

export default function ReactSDKPage() {
  const [activeSection, setActiveSection] = useState<SectionId>('getting-started');
  const [activeCodeTab, setActiveCodeTab] = useState<CodeTab>('basic');

  const isGettingStarted = activeSection === 'getting-started';
  const currentSection = sections.find((s) => s.id === activeSection)!;

  const renderDemo = () => {
    switch (activeSection) {
      case 'getting-started':
        return <GettingStartedContent />;
      case 'checkout':
        return <CheckoutDemo variant={activeCodeTab} />;
      case 'invoice':
        return <InvoiceDemo variant={activeCodeTab} />;
      case 'plans':
        return <PlansDemo variant={activeCodeTab} />;
      case 'balance':
        return <BalanceDemo variant={activeCodeTab} />;
      case 'transaction-history':
        return <TransactionHistoryDemo variant={activeCodeTab} />;
      case 'fiat-on-ramp':
        return <FiatOnRampDemo variant={activeCodeTab} />;
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeExamples[activeSection][activeCodeTab]);
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">React SDK</h1>
          <p className="text-sm text-slate-400">
            Drop-in components for payments, invoices, and subscriptions
          </p>
        </div>
        <div className="text-xs font-mono text-slate-500">@arcpay/react v1.0.0</div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-2 shrink-0">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              setActiveSection(s.id);
              setActiveCodeTab('basic');
            }}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
              activeSection === s.id
                ? 'bg-cyan-500 text-black'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Component Description */}
      <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-800/60 p-4 mb-4 shrink-0">
        <div className="flex items-start justify-between gap-8">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-white mb-1">{currentSection.label}</h2>
            <p className="text-sm text-slate-400 leading-relaxed">{currentSection.description}</p>
          </div>
          <div className="shrink-0 max-w-xs">
            <div className="text-xs font-medium text-slate-500 mb-1">Best for</div>
            <p className="text-xs text-cyan-400/80 leading-relaxed">{currentSection.useCase}</p>
          </div>
        </div>
      </div>

      {/* Main Content - Stacked Layout */}
      <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-y-auto">
        {/* Preview */}
        <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-800/60 flex flex-col shrink-0">
          <div className="px-4 py-2 border-b border-slate-800/60 flex justify-between items-center bg-slate-900/50">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-600/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-600/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-600/50" />
            </div>
            <span className="text-xs font-mono text-slate-500">
              {isGettingStarted ? 'Setup Guide' : 'Live Preview'}
            </span>
          </div>
          <div className="flex items-center justify-center p-6 bg-slate-950/30 min-h-[200px]">
            {renderDemo()}
          </div>
        </div>

        {/* Code */}
        <div className="bg-[#0d1117] rounded-xl border border-slate-800 flex flex-col shrink-0">
          <div className="flex items-center justify-between bg-[#161b22] border-b border-slate-700">
            <div className="flex">
              <CodeTabButton
                label="Basic"
                isActive={activeCodeTab === 'basic'}
                onClick={() => setActiveCodeTab('basic')}
              />
              <CodeTabButton
                label="Full Props"
                isActive={activeCodeTab === 'full'}
                onClick={() => setActiveCodeTab('full')}
              />
              <CodeTabButton
                label="Hook"
                isActive={activeCodeTab === 'hook'}
                onClick={() => setActiveCodeTab('hook')}
              />
            </div>
            <button
              onClick={handleCopyCode}
              className="px-3 py-2 text-[10px] text-slate-400 hover:text-white uppercase"
            >
              Copy
            </button>
          </div>
          <div className="overflow-auto">
            <SyntaxHighlighter
              language="tsx"
              style={transparentDark}
              customStyle={{
                margin: 0,
                borderRadius: 0,
                fontSize: '12px',
                background: 'transparent',
                padding: '1rem',
              }}
              showLineNumbers={true}
              lineNumberStyle={{ color: '#6e7681', paddingRight: '1rem', minWidth: '2.5rem' }}
            >
              {codeExamples[activeSection][activeCodeTab]}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-component for code tabs
function CodeTabButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-xs font-medium transition-colors ${
        isActive
          ? 'text-cyan-400 bg-[#0d1117] border-b-2 border-cyan-400'
          : 'text-slate-400 hover:text-white'
      }`}
    >
      {label}
    </button>
  );
}
