'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { useDisputes } from '@/mocks/MockB2BProvider';
import { sections, terminalLines, codeExamples, type SectionId, type CodeTab, type DisputeFormData } from './_lib';
import { DisputeForm, DisputeList, AITerminal } from './_components';
import { GlowButton, staggerContainer, listItem } from '@/components/dashboard';

// Transparent dark theme for code highlighting
const transparentDark = {
  'code[class*="language-"]': {
    color: '#e2e8f0',
    background: 'transparent',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '12px',
    lineHeight: '1.6',
  },
  'pre[class*="language-"]': {
    background: 'transparent',
    margin: 0,
    padding: 0,
  },
  comment: { color: '#64748b' },
  keyword: { color: '#f472b6' },
  string: { color: '#a5f3fc' },
  function: { color: '#fbbf24' },
  number: { color: '#c084fc' },
  operator: { color: '#94a3b8' },
  punctuation: { color: '#94a3b8' },
  'class-name': { color: '#22d3ee' },
  property: { color: '#34d399' },
};

type ViewMode = 'docs' | 'demo';

export default function DisputesPage() {
  const { disputes, isCreating, createDispute, evaluateDispute } = useDisputes();
  const [activeSection, setActiveSection] = useState<SectionId>('getting-started');
  const [activeCodeTab, setActiveCodeTab] = useState<CodeTab>('basic');
  const [viewMode, setViewMode] = useState<ViewMode>('docs');
  const [copied, setCopied] = useState(false);

  // Demo state
  const [activeTab, setActiveTab] = useState<'open' | 'resolved'>('open');
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);
  const [terminalText, setTerminalText] = useState<string>('');
  const [formData, setFormData] = useState<DisputeFormData>({
    transactionId: 'txn_demo_001',
    amount: '500',
    category: 'not_received',
    claim: 'I paid for the annual subscription but never received access.',
  });

  const currentSection = sections.find((s) => s.id === activeSection)!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createDispute({
      transactionId: formData.transactionId,
      amount: parseFloat(formData.amount),
      category: formData.category,
      claim: formData.claim,
    });
    setFormData((prev) => ({
      ...prev,
      transactionId: `txn_demo_${Date.now().toString(36).slice(0, 6)}`,
      claim: '',
    }));
  };

  const handleEvaluate = async (disputeId: string) => {
    setEvaluatingId(disputeId);
    setTerminalText('');

    for (let i = 0; i < terminalLines.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      setTerminalText(prev => prev + terminalLines[i] + '\n');
    }

    await evaluateDispute(disputeId);
    setEvaluatingId(null);
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
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-10 h-10 bg-orange-500/10 rounded-lg border border-orange-500/30 flex items-center justify-center"
            style={{ boxShadow: '0 0 15px rgba(249, 115, 22, 0.15)' }}
          >
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </motion.div>
          <div>
            <h1
              className="text-lg font-semibold text-white mb-0.5"
              style={{ textShadow: '0 0 20px rgba(249, 115, 22, 0.3)' }}
            >
              Dispute Protection SDK
            </h1>
            <p className="text-xs text-slate-400">AI-powered chargeback protection and evidence management</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-900/50 border border-slate-800/40 rounded-lg p-0.5">
            {(['docs', 'demo'] as ViewMode[]).map((mode) => (
              <motion.button
                key={mode}
                onClick={() => setViewMode(mode)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-all ${
                  viewMode === mode
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode === 'docs' && (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Docs & Code
                  </span>
                )}
                {mode === 'demo' && (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Live Demo
                  </span>
                )}
              </motion.button>
            ))}
          </div>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="px-2.5 py-1 bg-orange-500/10 border border-orange-500/30 rounded-lg text-[10px] font-mono text-orange-400"
          >
            @arcpay/b2b v1.0.0
          </motion.div>
        </div>
      </motion.div>

      {/* Section Tab Navigation */}
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
            className={`relative px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
              activeSection === s.id
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            {s.label}
            {activeSection === s.id && (
              <motion.div
                layoutId="disputes-section-indicator"
                className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-orange-500 rounded-full"
                style={{ boxShadow: '0 0 10px rgba(249, 115, 22, 0.5)' }}
              />
            )}
          </motion.button>
        ))}
      </motion.div>

      {/* Section Description Bar */}
      <motion.div
        variants={listItem}
        className="relative bg-slate-900/50 rounded-lg border border-slate-800/40 p-4 mb-4 shrink-0 overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-orange-500/30 rounded-tl" />
        <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-orange-500/30 rounded-tr" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-orange-500/30 rounded-bl" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-orange-500/30 rounded-br" />

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
                style={{ textShadow: '0 0 10px rgba(249, 115, 22, 0.3)' }}
              >
                {currentSection.label}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">{currentSection.description}</p>
            </div>
            <div className="shrink-0 max-w-xs">
              <div className="text-[10px] font-mono text-slate-500 uppercase mb-1">Best for</div>
              <p className="text-[10px] text-orange-400/80 leading-relaxed">{currentSection.useCase}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Main Content - View Mode Dependent */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* DOCS VIEW - Combined Docs + Code */}
          {viewMode === 'docs' && (
            <motion.div
              key="docs"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="h-full overflow-auto"
            >
              <DocsCodeView
                section={currentSection}
                activeCodeTab={activeCodeTab}
                onTabChange={setActiveCodeTab}
                code={codeExamples[activeSection][activeCodeTab]}
                copied={copied}
                onCopy={handleCopyCode}
              />
            </motion.div>
          )}

          {/* DEMO VIEW */}
          {viewMode === 'demo' && (
            <motion.div
              key="demo"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <DemoView
                disputes={disputes}
                formData={formData}
                isCreating={isCreating}
                activeTab={activeTab}
                evaluatingId={evaluatingId}
                terminalText={terminalText}
                onFormChange={setFormData}
                onSubmit={handleSubmit}
                onTabChange={setActiveTab}
                onEvaluate={handleEvaluate}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ============ COMBINED DOCS + CODE VIEW ============
interface DocsCodeViewProps {
  section: typeof sections[number];
  activeCodeTab: CodeTab;
  onTabChange: (tab: CodeTab) => void;
  code: string;
  copied: boolean;
  onCopy: () => void;
}

function DocsCodeView({ section, activeCodeTab, onTabChange, code, copied, onCopy }: DocsCodeViewProps) {
  const featuresBySection: Record<SectionId, { title: string; description: string; icon: React.ReactNode }[]> = {
    'getting-started': [
      { title: 'Easy Integration', description: 'Single SDK for all dispute operations. Install via npm, yarn, pnpm, or bun.', icon: <PackageIcon /> },
      { title: 'Sandbox & Production', description: 'Test in sandbox mode before going live. Seamless environment switching.', icon: <ToggleIcon /> },
      { title: 'Auto Accept Threshold', description: 'Automatically accept small disputes under a configurable amount.', icon: <ThresholdIcon /> },
      { title: 'AI-Powered Analysis', description: 'Enable AI evaluation with confidence scoring and automated recommendations.', icon: <AIIcon /> },
    ],
    'file-dispute': [
      { title: '6 Dispute Categories', description: 'Not received, not as described, duplicate charge, quality issue, unauthorized, or other.', icon: <CategoryIcon /> },
      { title: 'Evidence Attachments', description: 'Upload order confirmations, communication logs, photos, and more.', icon: <AttachIcon /> },
      { title: 'Desired Resolution', description: 'Buyers specify full refund, partial refund, replacement, or other resolution.', icon: <ResolutionIcon /> },
      { title: 'Automatic Deadlines', description: 'System sets merchant response deadline (72h) and resolution deadline (14d).', icon: <ClockIcon /> },
    ],
    'respond': [
      { title: 'Accept or Contest', description: 'Merchants can accept the claim, reject with evidence, or propose partial refund.', icon: <ResponseIcon /> },
      { title: 'Counter-Evidence', description: 'Submit shipping proofs, delivery photos, signatures, and service records.', icon: <EvidenceIcon /> },
      { title: 'Partial Settlements', description: 'Propose partial refunds to resolve disputes amicably.', icon: <PartialIcon /> },
      { title: 'Response Window', description: '72-hour default window to respond before escalation.', icon: <ClockIcon /> },
    ],
    'ai-evaluation': [
      { title: 'Confidence Scoring', description: 'AI provides 0-100% confidence in its recommendation.', icon: <ScoreIcon /> },
      { title: 'Detailed Reasoning', description: 'Natural language explanation of the evaluation decision.', icon: <ReasonIcon /> },
      { title: 'Factor Analysis', description: 'Buyer history, merchant history, evidence quality, and transaction analysis.', icon: <FactorsIcon /> },
      { title: 'Three-Way Decision', description: 'Approve (buyer wins), Deny (merchant wins), or Escalate (human review).', icon: <DecisionIcon /> },
    ],
    'delivery-proof': [
      { title: 'Physical Shipment', description: 'Register carrier, tracking number, delivery date, and signature.', icon: <ShipIcon /> },
      { title: 'Digital Delivery', description: 'Log IP address, download links, and access timestamps.', icon: <DigitalIcon /> },
      { title: 'Service Rendered', description: 'Document service date, description, completion confirmation.', icon: <ServiceIcon /> },
      { title: 'Subscription Access', description: 'Track period start/end, features accessed, and usage logs.', icon: <SubIcon /> },
    ],
    'webhooks': [
      { title: 'Real-Time Events', description: 'Receive instant notifications for dispute lifecycle changes.', icon: <WebhookIcon /> },
      { title: 'Signature Verification', description: 'Secure webhook payloads with HMAC signature verification.', icon: <SecurityIcon /> },
      { title: '7 Event Types', description: 'Created, updated, responded, evidence added, evaluated, escalated, resolved.', icon: <EventsIcon /> },
      { title: 'Retry Logic', description: 'Automatic retries with exponential backoff for failed deliveries.', icon: <RetryIcon /> },
    ],
  };

  const features = featuresBySection[section.id] || [];

  return (
    <div className="flex flex-col gap-5 pb-4">
      {/* TOP SECTION: Features */}
      <div className="grid grid-cols-4 gap-3">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-slate-900/50 border border-slate-800/40 rounded-lg p-3 hover:border-orange-500/30 transition-colors group"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-500/10 rounded-md border border-orange-500/30 flex items-center justify-center text-orange-400 group-hover:bg-orange-500/20 transition-colors shrink-0">
                {feature.icon}
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-semibold text-white mb-0.5 truncate">{feature.title}</h3>
                <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">{feature.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* BOTTOM SECTION: Code */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative rounded-xl border border-slate-800/50 bg-[#1e1e1e] overflow-hidden flex-1 min-h-[300px]"
      >
        {/* Code Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-black/20 bg-[#252526]">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
            </div>
            <span className="text-[10px] text-slate-500 font-mono">{section.label}.ts</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Code Tabs */}
            <div className="flex items-center gap-1">
              {(['basic', 'full', 'hook'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => onTabChange(tab)}
                  className={`px-2.5 py-1 text-[10px] font-mono rounded transition-colors ${
                    activeCodeTab === tab
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : 'text-slate-500 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {tab === 'basic' ? 'Basic' : tab === 'full' ? 'Full Config' : 'React Hook'}
                </button>
              ))}
            </div>

            {/* Copy Button */}
            <GlowButton
              variant="secondary"
              size="sm"
              onClick={onCopy}
              className="text-[10px] px-2 py-1"
            >
              {copied ? (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </span>
              )}
            </GlowButton>
          </div>
        </div>

        {/* Code Content */}
        <div className="overflow-auto max-h-[350px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${section.id}-${activeCodeTab}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <SyntaxHighlighter
                language="typescript"
                style={transparentDark}
                customStyle={{
                  background: 'transparent',
                  margin: 0,
                  padding: '1rem',
                  fontSize: '11px',
                }}
                showLineNumbers
                lineNumberStyle={{ color: '#6e7681', fontSize: '10px', minWidth: '2.5em', paddingRight: '1rem' }}
              >
                {code}
              </SyntaxHighlighter>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// ============ DEMO VIEW ============
interface DemoViewProps {
  disputes: any[];
  formData: DisputeFormData;
  isCreating: boolean;
  activeTab: 'open' | 'resolved';
  evaluatingId: string | null;
  terminalText: string;
  onFormChange: (data: DisputeFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onTabChange: (tab: 'open' | 'resolved') => void;
  onEvaluate: (id: string) => void;
}

function DemoView({
  disputes,
  formData,
  isCreating,
  activeTab,
  evaluatingId,
  terminalText,
  onFormChange,
  onSubmit,
  onTabChange,
  onEvaluate,
}: DemoViewProps) {
  return (
    <div className="relative rounded-xl border border-slate-800/50 bg-slate-900/30 overflow-hidden h-full flex flex-col">
      {/* Demo Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800/50 bg-slate-900/50 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Interactive Demo</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-400">
            94.2% Win Rate
          </span>
          <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 rounded text-blue-400">
            {disputes.length} Active
          </span>
        </div>
      </div>

      {/* Demo Content */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="grid grid-cols-12 gap-4 h-full">
          {/* Left Column: Form & List */}
          <div className="col-span-4 flex flex-col gap-4 h-full">
            <DisputeForm
              formData={formData}
              isCreating={isCreating}
              onFormChange={onFormChange}
              onSubmit={onSubmit}
            />
            <DisputeList
              disputes={disputes}
              activeTab={activeTab}
              onTabChange={onTabChange}
            />
          </div>

          {/* Right Column: AI Terminal */}
          <div className="col-span-8 flex flex-col h-full">
            <AITerminal
              disputes={disputes}
              evaluatingId={evaluatingId}
              terminalText={terminalText}
              onEvaluate={onEvaluate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ ICONS ============
const PackageIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const ToggleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
  </svg>
);

const ThresholdIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const AIIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const CategoryIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const AttachIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
  </svg>
);

const ResolutionIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ResponseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
  </svg>
);

const EvidenceIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const PartialIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
  </svg>
);

const ScoreIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ReasonIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);

const FactorsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const DecisionIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
  </svg>
);

const ShipIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
  </svg>
);

const DigitalIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
  </svg>
);

const ServiceIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const SubIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const WebhookIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const SecurityIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const EventsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const RetryIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);
