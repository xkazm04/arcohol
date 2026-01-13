'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

import {
  sections,
  mockSubscriptions,
  mockStats,
  codeExamples,
  transparentDark,
  type SectionId,
  type CodeTab,
  type Subscription,
} from './_lib';
import { SubscriptionList } from './_components';
import {
  StatCard,
  GlowButton,
  staggerContainer,
  listItem,
} from '@/components/dashboard';

export default function SubscriptionsPage() {
  const [activeSection, setActiveSection] = useState<SectionId>('getting-started');
  const [activeCodeTab, setActiveCodeTab] = useState<CodeTab>('basic');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'past_due'>('all');
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [copied, setCopied] = useState(false);

  const currentSection = sections.find((s) => s.id === activeSection)!;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeExamples[activeSection][activeCodeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="h-[calc(100vh-100px)] flex flex-col overflow-hidden"
    >
      {/* Header with Stats */}
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
            Subscriptions
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            B2B subscription management with usage-based billing
          </p>
        </div>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 rounded-lg text-[10px] font-mono text-blue-400"
        >
          @arcpay/b2b v1.0.0
        </motion.div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div variants={listItem} className="grid grid-cols-3 gap-3 mb-4 shrink-0">
        <StatCard
          label="Total Subscriptions"
          value={mockStats.totalSubscriptions.toString()}
          subValue="active plans"
          accent="blue"
          delay={0.1}
          trend={{
            value: `+${mockStats.subscriptionsChange}`,
            positive: mockStats.subscriptionsChange > 0,
          }}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatCard
          label="Monthly Income"
          value={`$${mockStats.monthlyIncome.toLocaleString()}`}
          subValue="recurring revenue"
          accent="emerald"
          delay={0.15}
          trend={{
            value: `+${mockStats.incomeChange}%`,
            positive: mockStats.incomeChange > 0,
          }}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Expected Yield"
          value={`$${mockStats.expectedYield.toFixed(2)}`}
          subValue="next month"
          accent="purple"
          delay={0.2}
          trend={{
            value: `${mockStats.yieldPercentage}% APY`,
            positive: true,
          }}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        variants={listItem}
        className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-2 shrink-0"
      >
        {sections.map((s, index) => (
          <motion.button
            key={s.id}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setActiveSection(s.id);
              setActiveCodeTab('basic');
            }}
            className={`relative px-3 py-1.5 text-[11px] font-medium rounded-lg whitespace-nowrap transition-all border ${
              activeSection === s.id
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                : 'bg-slate-900/50 text-slate-400 border-slate-800/40 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            {activeSection === s.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-blue-500/10 rounded-lg border border-blue-500/30"
                style={{ boxShadow: '0 0 15px rgba(59, 130, 246, 0.2)' }}
              />
            )}
            <span className="relative z-10">{s.label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Section Description */}
      <motion.div
        variants={listItem}
        className="relative bg-slate-900/50 rounded-lg border border-slate-800/40 p-4 mb-4 shrink-0 overflow-hidden"
      >
        {/* Corner markers */}
        <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-blue-500/30 rounded-tl" />
        <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-blue-500/30 rounded-tr" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-blue-500/30 rounded-bl" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-blue-500/30 rounded-br" />

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
                style={{ textShadow: '0 0 10px rgba(59, 130, 246, 0.3)' }}
              >
                {currentSection.label}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">{currentSection.description}</p>
            </div>
            <div className="shrink-0 max-w-xs">
              <div className="text-[10px] font-mono text-slate-500 uppercase mb-1">Best for</div>
              <p className="text-[10px] text-blue-400/80 leading-relaxed">{currentSection.useCase}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0 overflow-hidden">
        {/* Left - Demo Preview */}
        <motion.div
          variants={listItem}
          className="col-span-5 relative bg-slate-900/50 rounded-lg border border-slate-800/40 flex flex-col overflow-hidden"
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
            <span className="text-[10px] font-mono text-slate-500">Live Preview</span>
          </div>
          <div className="flex-1 overflow-auto bg-slate-950/30">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <SubscriptionList
                  subscriptions={mockSubscriptions}
                  activeFilter={activeFilter}
                  onFilterChange={setActiveFilter}
                  onSelect={handleSelectSubscription}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Right - Code Panel */}
        <motion.div
          variants={listItem}
          className="col-span-7 relative bg-[#1e1e1e] rounded-lg border border-slate-800 flex flex-col overflow-hidden"
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
                label="Full Config"
                isActive={activeCodeTab === 'full'}
                onClick={() => setActiveCodeTab('full')}
              />
              <CodeTabButton
                label="React Hook"
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
          <div className="flex-1 overflow-auto">
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

      {/* Selected Subscription Detail Modal */}
      <AnimatePresence>
        {selectedSubscription && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setSelectedSubscription(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-800 rounded-lg p-6 max-w-md w-full mx-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Subscription Details</h3>
                <button
                  onClick={() => setSelectedSubscription(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Customer</span>
                  <span className="text-white">{selectedSubscription.customer.name}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Plan</span>
                  <span className="text-white">{selectedSubscription.planName}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Amount</span>
                  <span className="text-white font-mono">${selectedSubscription.amount}/{selectedSubscription.interval}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Status</span>
                  <span className={`font-medium ${
                    selectedSubscription.status === 'active' ? 'text-emerald-400' :
                    selectedSubscription.status === 'past_due' ? 'text-amber-400' :
                    'text-slate-400'
                  }`}>
                    {selectedSubscription.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Current Period</span>
                  <span className="text-white font-mono text-[10px]">
                    {selectedSubscription.currentPeriodStart} - {selectedSubscription.currentPeriodEnd}
                  </span>
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <GlowButton size="sm" variant="secondary" className="flex-1">
                  Pause
                </GlowButton>
                <GlowButton size="sm" variant="primary" className="flex-1">
                  Manage
                </GlowButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
      whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
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
