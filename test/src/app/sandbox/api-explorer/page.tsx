'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hooks, type HookName, type LogEntry } from './_lib';
import { HookExplorer } from './_components';
import { useNetwork } from '../_context';
import { staggerContainer, listItem, TabSwitcher, useTabValue } from '@/components/dashboard';

// Convert hooks to TabItem format
const hookTabs = hooks.map(h => ({ id: h.name, label: h.name }));

export default function APIExplorerPage() {
  // Use URL-synced tab value
  const selected = useTabValue('hook', hookTabs, 'useWallet') as HookName;
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const { network, config } = useNetwork();

  const addLog = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    setLogs(prev => [{ id: Date.now(), msg, type, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 9)]);
  };

  const selectedHook = hooks.find(h => h.name === selected);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1
            className="text-lg font-semibold text-white mb-1"
            style={{ textShadow: '0 0 20px rgba(6, 182, 212, 0.3)' }}
          >
            API Explorer
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Interactive playground to test SDK hooks on <span className={network === 'testnet' ? 'text-cyan-400' : 'text-emerald-400'}>{config.name}</span>.
          </p>
        </div>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center gap-2 text-[10px] text-cyan-400 font-mono"
        >
          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
          Live
        </motion.div>
      </motion.div>

      {/* Hook Tab Navigation */}
      <motion.div variants={listItem} className="mb-4">
        <TabSwitcher
          tabs={hookTabs}
          urlParamKey="hook"
          defaultTab="useWallet"
          layoutId="apiExplorerTab"
        />
      </motion.div>

      <div className="space-y-4">
          {/* Active Hook Workspace */}
          <motion.div
            variants={listItem}
            className="relative bg-slate-900/50 rounded-lg border border-slate-800/40 overflow-hidden"
          >
            {/* Corner markers */}
            <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-purple-500/30 rounded-tl" />
            <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-purple-500/30 rounded-tr" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-purple-500/30 rounded-bl" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-purple-500/30 rounded-br" />

            <div className="px-4 py-3 border-b border-slate-800/40 bg-slate-900/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span
                    className="text-base font-mono text-cyan-400 font-bold"
                    style={{ textShadow: '0 0 15px rgba(6, 182, 212, 0.5)' }}
                  >
                    {selected}()
                  </span>
                  <span className="text-slate-600 text-xs">// {selectedHook?.description}</span>
                </div>
                <div className="flex gap-1.5">
                  {selectedHook?.returns.map(r => (
                    <span key={r} className="px-2 py-0.5 bg-slate-800/80 rounded text-[10px] font-mono text-slate-400 border border-slate-700/50">{r}</span>
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-400 mb-1">{selectedHook?.details}</p>
              <div className="text-[10px]">
                <span className="text-slate-600">Best for: </span>
                <span className="text-cyan-400/70">{selectedHook?.useCase}</span>
              </div>
            </div>

            <div className="p-4">
              <HookExplorer hookName={selected} onLog={addLog} />
            </div>
          </motion.div>

          {/* Vertical Stack: Current State, Console Output, Example Usage */}
          <motion.div variants={staggerContainer} className="space-y-3">
            {/* 1. Current State Info */}
            <motion.div
              variants={listItem}
              className="relative bg-slate-900/50 rounded-lg border border-slate-800/40 p-4 overflow-hidden"
            >
              {/* Corner markers */}
              <div className="absolute top-0 left-0 w-2.5 h-2.5 border-l-2 border-t-2 border-blue-500/30 rounded-tl" />
              <div className="absolute top-0 right-0 w-2.5 h-2.5 border-r-2 border-t-2 border-blue-500/30 rounded-tr" />
              <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-l-2 border-b-2 border-blue-500/30 rounded-bl" />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-r-2 border-b-2 border-blue-500/30 rounded-br" />

              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-xs font-mono text-blue-400 font-medium">Current State</span>
                </div>
                <div className="flex-1 h-px bg-slate-800" />
                <span className={`text-[10px] font-mono ${network === 'testnet' ? 'text-cyan-400' : 'text-emerald-400'}`}>{config.name}</span>
              </div>

              <div className="text-xs text-slate-400">
                <p>The <code className="text-cyan-400 bg-slate-800/50 px-1 rounded">{selected}</code> hook provides real-time state management for {selectedHook?.description.toLowerCase()}. Connect your wallet to see live data from {config.name}.</p>
              </div>
            </motion.div>

            {/* 2. Console Output */}
            <motion.div
              variants={listItem}
              className="relative bg-black/40 rounded-lg border border-slate-800/40 p-4 overflow-hidden"
            >
              {/* Corner markers */}
              <div className="absolute top-0 left-0 w-2.5 h-2.5 border-l-2 border-t-2 border-emerald-500/30 rounded-tl" />
              <div className="absolute top-0 right-0 w-2.5 h-2.5 border-r-2 border-t-2 border-emerald-500/30 rounded-tr" />
              <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-l-2 border-b-2 border-emerald-500/30 rounded-bl" />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-r-2 border-b-2 border-emerald-500/30 rounded-br" />

              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs font-mono text-emerald-400 font-medium">Console Output</span>
                </div>
                <div className="flex-1 h-px bg-slate-800" />
                <button onClick={() => setLogs([])} className="text-[10px] text-slate-600 hover:text-white transition-colors font-mono">Clear</button>
              </div>

              <div className="h-32 overflow-y-auto space-y-1 font-mono text-[10px]">
                {logs.length === 0 && <span className="text-slate-600 italic">Execute actions above to see console output...</span>}
                <AnimatePresence>
                  {logs.map(log => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex gap-2"
                    >
                      <span className="text-slate-600">[{log.time}]</span>
                      <span className={`${log.type === 'error' ? 'text-red-400' :
                          log.type === 'success' ? 'text-green-400' :
                            'text-slate-300'
                        }`}>{log.msg}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* 3. Example Usage */}
            <motion.div
              variants={listItem}
              className="relative bg-slate-900/50 rounded-lg border border-slate-800/40 p-4 overflow-hidden"
            >
              {/* Corner markers */}
              <div className="absolute top-0 left-0 w-2.5 h-2.5 border-l-2 border-t-2 border-amber-500/30 rounded-tl" />
              <div className="absolute top-0 right-0 w-2.5 h-2.5 border-r-2 border-t-2 border-amber-500/30 rounded-tr" />
              <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-l-2 border-b-2 border-amber-500/30 rounded-bl" />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-r-2 border-b-2 border-amber-500/30 rounded-br" />

              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <span className="text-xs font-mono text-amber-400 font-medium">Example Usage</span>
                </div>
                <div className="flex-1 h-px bg-slate-800" />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`import { ${selected} } from '@arcpay/react'

function Component() {
  const {
    ${selectedHook?.returns.slice(0, 3).join(',\n    ')}
  } = ${selected}()

  // Your component logic here
}`);
                  }}
                  className="text-[10px] text-slate-600 hover:text-amber-400 transition-colors font-mono flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </button>
              </div>

              <div className="bg-slate-950 rounded-lg p-3 border border-slate-800/50">
                <pre className="text-[11px] font-mono text-slate-400 overflow-x-auto">
                  <span className="text-purple-400">import</span>{' '}
                  <span className="text-slate-300">{'{ '}</span>
                  <span className="text-cyan-400">{selected}</span>
                  <span className="text-slate-300">{' }'}</span>
                  <span className="text-purple-400"> from</span>{' '}
                  <span className="text-emerald-400">&apos;@arcpay/react&apos;</span>
                  {'\n\n'}
                  <span className="text-purple-400">function</span>{' '}
                  <span className="text-amber-400">Component</span>
                  <span className="text-slate-300">() {'{'}</span>
                  {'\n  '}
                  <span className="text-purple-400">const</span>{' '}
                  <span className="text-slate-300">{'{'}</span>
                  {'\n    '}
                  <span className="text-cyan-300">{selectedHook?.returns.slice(0, 3).join(',\n    ')}</span>
                  {'\n  '}
                  <span className="text-slate-300">{'}'}</span>
                  <span className="text-slate-500"> = </span>
                  <span className="text-cyan-400">{selected}</span>
                  <span className="text-slate-300">()</span>
                  {'\n\n  '}
                  <span className="text-slate-600">// Your component logic here</span>
                  {'\n'}
                  <span className="text-slate-300">{'}'}</span>
                </pre>
              </div>
            </motion.div>
          </motion.div>
        </div>
    </motion.div>
  );
}
