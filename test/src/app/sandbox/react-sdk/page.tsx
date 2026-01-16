'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { GlowButton, staggerContainer, listItem, TabSwitcher, useTabValue } from '@/components/dashboard';

// Convert sections to TabItem format
const tabItems = sections.map(s => ({ id: s.id, label: s.label }));

export default function ReactSDKPage() {
  // Use URL-synced tab value
  const activeSection = useTabValue('section', tabItems, 'getting-started') as SectionId;
  const [activeCodeTab, setActiveCodeTab] = useState<CodeTab>('basic');
  const [copied, setCopied] = useState(false);

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
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="h-[calc(100vh-100px)] flex flex-col overflow-hidden"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4 shrink-0"
      >
        <div>
          <h1
            className="text-lg font-semibold text-white mb-1"
            style={{ textShadow: '0 0 20px rgba(6, 182, 212, 0.3)' }}
          >
            React SDK
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Drop-in components for payments, invoices, and subscriptions
          </p>
        </div>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-[10px] font-mono text-cyan-400"
        >
          @arcpay/react v1.0.0
        </motion.div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div variants={listItem} className="mb-4 shrink-0">
        <TabSwitcher
          tabs={tabItems}
          urlParamKey="section"
          defaultTab="getting-started"
          onChange={() => setActiveCodeTab('basic')}
          layoutId="reactSdkTab"
        />
      </motion.div>

      {/* Component Description */}
      <motion.div
        variants={listItem}
        className="relative bg-slate-900/50 rounded-lg border border-slate-800/40 p-4 mb-4 shrink-0 overflow-hidden"
      >
        {/* Corner markers */}
        <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-cyan-500/30 rounded-tl" />
        <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-cyan-500/30 rounded-tr" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-cyan-500/30 rounded-bl" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-cyan-500/30 rounded-br" />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="flex items-start justify-between gap-8"
          >
            <div className="flex-1">
              <h2
                className="text-sm font-semibold text-white mb-1"
                style={{ textShadow: '0 0 10px rgba(6, 182, 212, 0.3)' }}
              >
                {currentSection.label}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">{currentSection.description}</p>
            </div>
            <div className="shrink-0 max-w-xs">
              <div className="text-[10px] font-mono text-slate-500 uppercase mb-1">Best for</div>
              <p className="text-[10px] text-cyan-400/80 leading-relaxed">{currentSection.useCase}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Main Content - Stacked Layout */}
      <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-y-auto">
        {/* Preview */}
        <motion.div
          variants={listItem}
          className="relative bg-slate-900/50 rounded-lg border border-slate-800/40 flex flex-col shrink-0 overflow-hidden"
        >
          {/* Corner markers */}
          <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-purple-500/30 rounded-tl z-10" />
          <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-purple-500/30 rounded-tr z-10" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-purple-500/30 rounded-bl z-10" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-purple-500/30 rounded-br z-10" />

          <div className="px-4 py-2.5 border-b border-slate-800/40 flex justify-between items-center bg-slate-900/30">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              {isGettingStarted ? 'Setup Guide' : 'Live Preview'}
            </span>
          </div>
          <div className="flex items-center justify-center p-6 bg-slate-950/30 min-h-[200px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection + activeCodeTab}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                {renderDemo()}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Code */}
        <motion.div
          variants={listItem}
          className="relative bg-[#1e1e1e] rounded-lg border border-slate-800 flex flex-col shrink-0 overflow-hidden"
        >
          {/* Corner markers */}
          <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-emerald-500/30 rounded-tl z-10" />
          <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-emerald-500/30 rounded-tr z-10" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-emerald-500/30 rounded-bl z-10" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-emerald-500/30 rounded-br z-10" />

          <div className="flex items-center justify-between bg-[#252526] border-b border-black/20">
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
            <GlowButton
              size="sm"
              variant={copied ? 'secondary' : 'primary'}
              onClick={handleCopyCode}
              icon={
                copied ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                )
              }
            >
              {copied ? 'Copied!' : 'Copy'}
            </GlowButton>
          </div>
          <div className="overflow-auto">
            <SyntaxHighlighter
              language="tsx"
              style={transparentDark}
              customStyle={{
                margin: 0,
                borderRadius: 0,
                fontSize: '11px',
                background: 'transparent',
                padding: '1rem',
              }}
              showLineNumbers={true}
              lineNumberStyle={{ color: '#6e7681', paddingRight: '1rem', minWidth: '2.5rem' }}
            >
              {codeExamples[activeSection][activeCodeTab]}
            </SyntaxHighlighter>
          </div>
        </motion.div>
      </div>
    </motion.div>
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
    <motion.button
      onClick={onClick}
      whileHover={{ backgroundColor: 'rgba(6, 182, 212, 0.05)' }}
      whileTap={{ scale: 0.98 }}
      className={`relative px-4 py-2.5 text-[11px] font-medium transition-colors ${
        isActive
          ? 'text-emerald-400'
          : 'text-slate-400 hover:text-white'
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="activeCodeTab"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400"
          style={{ boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)' }}
        />
      )}
      {label}
    </motion.button>
  );
}
