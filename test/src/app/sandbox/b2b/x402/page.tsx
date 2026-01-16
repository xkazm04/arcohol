'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  mockEndpoints,
  mockAccounts,
  mockTransactions,
  usageStats,
  codeExamples,
  sections,
  type SectionId,
  type CodeTab,
} from './_lib';
import { GlowButton, StatCard, staggerContainer, listItem } from '@/components/dashboard';

// Custom syntax theme
const syntaxTheme: { [key: string]: React.CSSProperties } = {
  'code[class*="language-"]': { color: '#9cdcfe', background: 'transparent' },
  'pre[class*="language-"]': { background: 'transparent' },
  comment: { color: '#6a9955' },
  string: { color: '#ce9178' },
  keyword: { color: '#569cd6' },
  function: { color: '#dcdcaa' },
  number: { color: '#b5cea8' },
  operator: { color: '#d4d4d4' },
  'class-name': { color: '#4ec9b0' },
  punctuation: { color: '#d4d4d4' },
  property: { color: '#9cdcfe' },
  builtin: { color: '#4ec9b0' },
};

export default function X402Page() {
  const [activeSection, setActiveSection] = useState<SectionId>('getting-started');
  const [activeCodeTab, setActiveCodeTab] = useState<CodeTab>('basic');

  const currentSection = sections.find((s) => s.id === activeSection)!;
  const currentCode = codeExamples[activeSection][activeCodeTab];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4 max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center"
              style={{ boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)' }}
            >
              <span className="text-white font-mono font-bold text-xs">402</span>
            </motion.div>
            <h1
              className="text-lg font-semibold text-white"
              style={{ textShadow: '0 0 20px rgba(6, 182, 212, 0.3)' }}
            >
              API Credits & Monetization
            </h1>
            <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-[9px] font-medium rounded border border-cyan-500/30">
              @arcpay/b2b
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Credit-based API access control with per-endpoint pricing and customer balance management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-emerald-500"
          />
          <span className="text-[10px] text-slate-400">API Connected</span>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={staggerContainer} className="grid grid-cols-4 gap-3">
        <StatCard
          label="Total Revenue (30d)"
          value={`$${usageStats.totalRevenue.toLocaleString()}`}
          accent="emerald"
          delay={0.1}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 1v8m0 0v1" />
            </svg>
          }
        />
        <StatCard
          label="API Requests (30d)"
          value={`${(usageStats.totalRequests / 1000).toFixed(0)}k`}
          accent="cyan"
          delay={0.15}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          }
        />
        <StatCard
          label="Active Accounts"
          value={usageStats.activeAccounts.toString()}
          subValue={`$${usageStats.totalBalance.toFixed(0)} total balance`}
          accent="purple"
          delay={0.2}
        />
        <StatCard
          label="Success Rate"
          value={`${usageStats.successRate}%`}
          subValue={`${usageStats.avgResponseTime}ms avg`}
          accent="emerald"
          delay={0.25}
        />
      </motion.div>

      {/* Section Navigation */}
      <motion.div variants={listItem} className="flex items-center gap-2 overflow-x-auto pb-2">
        {sections.map((section) => (
          <motion.button
            key={section.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setActiveSection(section.id);
              setActiveCodeTab('basic');
            }}
            className={`px-3 py-2 text-[11px] font-medium rounded-lg whitespace-nowrap transition-all ${
              activeSection === section.id
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-slate-800/50 text-slate-500 border border-transparent hover:border-slate-700/50 hover:text-slate-300'
            }`}
            style={
              activeSection === section.id
                ? { boxShadow: '0 0 15px rgba(6, 182, 212, 0.2)' }
                : undefined
            }
          >
            {section.title}
          </motion.button>
        ))}
      </motion.div>

      {/* Section Description */}
      <motion.div
        key={activeSection + '-desc'}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-slate-900/50 rounded-lg border border-slate-800/40 p-4"
      >
        <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-cyan-500/30 rounded-tl" />
        <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-cyan-500/30 rounded-tr" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-cyan-500/30 rounded-bl" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-cyan-500/30 rounded-br" />

        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white mb-1">{currentSection.title}</h2>
            <p className="text-xs text-slate-400">{currentSection.description}</p>
          </div>
          <div className="px-2 py-1 bg-emerald-500/10 rounded border border-emerald-500/20">
            <span className="text-[9px] text-emerald-400">Best for: {currentSection.bestFor}</span>
          </div>
        </div>
      </motion.div>

      {/* Main Content: Preview + Code */}
      <motion.div
        key={activeSection + '-content'}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        {/* Live Preview Panel */}
        <div className="relative bg-slate-900/50 rounded-lg border border-slate-800/40 overflow-hidden">
          <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-purple-500/30 rounded-tl" />
          <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-purple-500/30 rounded-tr" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-purple-500/30 rounded-bl" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-purple-500/30 rounded-br" />

          {/* MacOS-style header */}
          <div className="px-4 py-2 border-b border-slate-800/50 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-[10px] text-slate-500 ml-2">Live Preview</span>
          </div>

          {/* Preview Content */}
          <div className="p-4 max-h-[500px] overflow-y-auto">
            {activeSection === 'getting-started' && <GettingStartedPreview />}
            {activeSection === 'endpoints' && <EndpointsPreview />}
            {activeSection === 'accounts' && <AccountsPreview />}
            {activeSection === 'middleware' && <MiddlewarePreview />}
            {activeSection === 'usage' && <UsagePreview />}
            {activeSection === 'webhooks' && <WebhooksPreview />}
          </div>
        </div>

        {/* Code Panel */}
        <div className="relative bg-[#1e1e1e] rounded-lg border border-slate-800 overflow-hidden">
          <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-emerald-500/30 rounded-tl z-10" />
          <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-emerald-500/30 rounded-tr z-10" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-emerald-500/30 rounded-bl z-10" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-emerald-500/30 rounded-br z-10" />

          {/* Code header with tabs */}
          <div className="px-4 py-2.5 border-b border-black/20 bg-[#252526] flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Code Example</span>
            <div className="flex gap-1.5">
              {(['basic', 'full', 'hook'] as const).map((tab) => (
                <motion.button
                  key={tab}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveCodeTab(tab)}
                  className={`px-2 py-1 text-[10px] font-medium rounded transition-all ${
                    activeCodeTab === tab
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-500 hover:bg-slate-800'
                  }`}
                >
                  {tab === 'basic' ? 'Basic' : tab === 'full' ? 'Full Config' : 'React Hook'}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Code content */}
          <div className="max-h-[450px] overflow-y-auto">
            <SyntaxHighlighter
              language="typescript"
              style={syntaxTheme}
              customStyle={{
                margin: 0,
                padding: '1rem',
                background: 'transparent',
                fontSize: '11px',
                lineHeight: '1.6',
              }}
              showLineNumbers
              lineNumberStyle={{ color: '#4a5568', fontSize: '10px', minWidth: '2.5em' }}
            >
              {currentCode}
            </SyntaxHighlighter>
          </div>
        </div>
      </motion.div>

      {/* Quick Reference */}
      <motion.div variants={listItem}>
        <div className="relative bg-slate-900/50 rounded-lg border border-slate-800/40 p-4">
          <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-amber-500/30 rounded-tl" />
          <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-amber-500/30 rounded-tr" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-amber-500/30 rounded-bl" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-amber-500/30 rounded-br" />

          <div className="text-[10px] font-mono text-slate-500 uppercase mb-3">Quick Reference</div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="text-xs font-medium text-white">Customer Identification</div>
              <div className="text-[10px] text-slate-400">
                Pass customer ID via <code className="text-cyan-400 bg-slate-800/50 px-1 rounded">x-customer-id</code> header
                or link API keys to accounts in the dashboard.
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium text-white">HTTP 402 Response</div>
              <div className="text-[10px] text-slate-400">
                When credits are insufficient, the API returns <code className="text-amber-400 bg-slate-800/50 px-1 rounded">402 Payment Required</code> with
                balance info and top-up URL.
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium text-white">Webhook Events</div>
              <div className="text-[10px] text-slate-400">
                Monitor <code className="text-purple-400 bg-slate-800/50 px-1 rounded">credits.low_balance</code>,{' '}
                <code className="text-purple-400 bg-slate-800/50 px-1 rounded">credits.deposited</code>, and{' '}
                <code className="text-purple-400 bg-slate-800/50 px-1 rounded">credits.depleted</code>.
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Preview Components
function GettingStartedPreview() {
  return (
    <div className="space-y-4">
      <div className="text-[10px] font-mono text-slate-500 uppercase">Dashboard Overview</div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
          <div className="text-[10px] text-slate-500 mb-1">Revenue (30d)</div>
          <div className="text-lg font-mono font-bold text-emerald-400">$7,651.00</div>
        </div>
        <div className="p-3 bg-cyan-500/5 rounded-lg border border-cyan-500/20">
          <div className="text-[10px] text-slate-500 mb-1">API Calls (30d)</div>
          <div className="text-lg font-mono font-bold text-cyan-400">353.6k</div>
        </div>
      </div>

      <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
        <div className="text-[10px] text-slate-500 mb-2">How It Works</div>
        <div className="space-y-2">
          {[
            { step: '1', title: 'Configure Endpoints', desc: 'Set per-call pricing' },
            { step: '2', title: 'Customer Deposits', desc: 'Prepaid credit balance' },
            { step: '3', title: 'API Protection', desc: 'Middleware checks balance' },
            { step: '4', title: 'Auto Billing', desc: 'Credits deducted per call' },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-2">
              <div className="w-5 h-5 bg-cyan-500/10 rounded flex items-center justify-center">
                <span className="text-[9px] font-mono text-cyan-400">{item.step}</span>
              </div>
              <div>
                <span className="text-[10px] text-white">{item.title}</span>
                <span className="text-[10px] text-slate-500 ml-2">{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EndpointsPreview() {
  return (
    <div className="space-y-3">
      <div className="text-[10px] font-mono text-slate-500 uppercase">Monetized Endpoints</div>

      {mockEndpoints.slice(0, 4).map((endpoint) => (
        <div key={endpoint.id} className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`px-1.5 py-0.5 text-[9px] font-mono rounded ${
                endpoint.method === 'GET' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'
              }`}>
                {endpoint.method}
              </span>
              <span className="text-xs font-mono text-white">{endpoint.path}</span>
            </div>
            <span className={`text-[9px] px-1.5 py-0.5 rounded ${
              endpoint.status === 'active'
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-slate-500/10 text-slate-400'
            }`}>
              {endpoint.status}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400">{endpoint.name}</span>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-mono">${endpoint.price}/call</span>
              <span className="text-slate-500">{endpoint.calls30d.toLocaleString()} calls</span>
              <span className="text-emerald-400">${endpoint.revenue30d}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AccountsPreview() {
  return (
    <div className="space-y-3">
      <div className="text-[10px] font-mono text-slate-500 uppercase">Customer Credit Accounts</div>

      {mockAccounts.map((account) => (
        <div key={account.id} className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-[10px] font-mono text-purple-400">
                  {account.externalCustomerId.slice(5, 9).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="text-xs font-mono text-white">{account.externalCustomerId}</div>
                <div className="text-[10px] text-slate-500">{account.totalRequests.toLocaleString()} requests</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-sm font-mono font-bold ${
                account.balance < account.lowBalanceThreshold ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                ${account.balance.toFixed(2)}
              </div>
              <div className="text-[9px] text-slate-500">balance</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MiddlewarePreview() {
  return (
    <div className="space-y-4">
      <div className="text-[10px] font-mono text-slate-500 uppercase">API Protection Flow</div>

      <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
        <div className="space-y-3">
          {[
            { icon: '1', label: 'Request Received', desc: 'POST /api/v1/analyze', color: 'cyan' },
            { icon: '2', label: 'Customer Identified', desc: 'x-customer-id: cust_acme_corp', color: 'purple' },
            { icon: '3', label: 'Balance Checked', desc: '$245.50 available', color: 'blue' },
            { icon: '4', label: 'Credits Deducted', desc: '-$0.05 for this request', color: 'amber' },
            { icon: '5', label: 'Request Processed', desc: 'Handler executed, response sent', color: 'emerald' },
          ].map((step) => (
            <div key={step.icon} className="flex items-center gap-3">
              <div className={`w-6 h-6 bg-${step.color}-500/10 rounded-lg flex items-center justify-center border border-${step.color}-500/30`}>
                <span className={`text-[10px] font-mono text-${step.color}-400`}>{step.icon}</span>
              </div>
              <div className="flex-1">
                <div className="text-[11px] text-white">{step.label}</div>
                <div className="text-[10px] text-slate-500 font-mono">{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 bg-amber-500/5 rounded-lg border border-amber-500/20">
        <div className="text-[10px] text-amber-400 mb-1">HTTP 402 Response</div>
        <div className="text-[9px] text-slate-400 font-mono">
          When balance is insufficient, returns 402 with balance info and top-up URL.
        </div>
      </div>
    </div>
  );
}

function UsagePreview() {
  return (
    <div className="space-y-4">
      <div className="text-[10px] font-mono text-slate-500 uppercase">Usage Analytics</div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-slate-800/30 rounded-lg">
          <div className="text-[10px] text-slate-500 mb-1">Total Requests</div>
          <div className="text-lg font-mono font-bold text-white">353,620</div>
          <div className="text-[9px] text-emerald-400">+12.5% vs last month</div>
        </div>
        <div className="p-3 bg-slate-800/30 rounded-lg">
          <div className="text-[10px] text-slate-500 mb-1">Total Revenue</div>
          <div className="text-lg font-mono font-bold text-emerald-400">$7,651</div>
          <div className="text-[9px] text-emerald-400">+8.3% vs last month</div>
        </div>
      </div>

      <div className="p-3 bg-slate-800/30 rounded-lg">
        <div className="text-[10px] text-slate-500 mb-2">Top Endpoints by Revenue</div>
        <div className="space-y-2">
          {mockEndpoints.slice(0, 3).map((ep, i) => (
            <div key={ep.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500">#{i + 1}</span>
                <span className="text-[10px] font-mono text-white">{ep.path}</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">${ep.revenue30d}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WebhooksPreview() {
  return (
    <div className="space-y-4">
      <div className="text-[10px] font-mono text-slate-500 uppercase">Credit Events</div>

      <div className="space-y-2">
        {[
          { type: 'credits.deposited', desc: 'Customer added credits', time: '2 min ago', color: 'emerald' },
          { type: 'credits.low_balance', desc: 'Balance below threshold', time: '15 min ago', color: 'amber' },
          { type: 'credits.depleted', desc: 'Account balance zero', time: '1 hour ago', color: 'red' },
          { type: 'credits.auto_topup_triggered', desc: 'Auto top-up executed', time: '2 hours ago', color: 'blue' },
        ].map((event) => (
          <div key={event.type} className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[10px] font-mono text-${event.color}-400`}>{event.type}</span>
              <span className="text-[9px] text-slate-500">{event.time}</span>
            </div>
            <div className="text-[10px] text-slate-400">{event.desc}</div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-purple-500/5 rounded-lg border border-purple-500/20">
        <div className="text-[10px] text-purple-400 mb-1">Webhook Endpoint</div>
        <code className="text-[10px] text-slate-300 font-mono">POST /api/webhooks/credits</code>
      </div>
    </div>
  );
}
