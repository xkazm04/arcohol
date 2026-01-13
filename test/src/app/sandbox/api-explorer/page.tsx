'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hooks, type HookName, type LogEntry } from './_lib';
import { HookExplorer } from './_components';
import { Card, CardHeader, GlowButton, staggerContainer, listItem } from '@/components/dashboard';

export default function APIExplorerPage() {
  const [selected, setSelected] = useState<HookName>('useWallet');
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    setLogs(prev => [{ id: Date.now(), msg, type, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 4)]);
  };

  const selectedHook = hooks.find(h => h.name === selected);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="h-[calc(100vh-100px)] flex flex-col gap-4"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between shrink-0"
      >
        <div>
          <h1
            className="text-lg font-semibold text-white mb-1"
            style={{ textShadow: '0 0 20px rgba(6, 182, 212, 0.3)' }}
          >
            API Explorer
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">Interactive playground to test SDK hooks in real-time.</p>
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

      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        {/* Sidebar */}
        <motion.div
          variants={listItem}
          className="col-span-3 flex flex-col gap-4 min-h-0"
        >
          <div className="relative bg-slate-900/50 rounded-lg border border-slate-800/40 flex flex-col overflow-hidden h-full">
            {/* Corner markers */}
            <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-cyan-500/30 rounded-tl" />
            <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-cyan-500/30 rounded-tr" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-cyan-500/30 rounded-bl" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-cyan-500/30 rounded-br" />

            <div className="p-2.5 border-b border-slate-800/40 bg-slate-900/50">
              <span className="text-[10px] font-mono text-slate-500 uppercase">Available Hooks</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {hooks.map((h, index) => (
                <motion.button
                  key={h.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  whileHover={{ x: 3 }}
                  onClick={() => setSelected(h.name)}
                  className={`w-full p-2.5 rounded-lg text-left transition-all group relative ${selected === h.name
                      ? 'bg-cyan-500/10 text-cyan-400'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                    }`}
                >
                  {selected === h.name && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-0 bottom-0 w-[2px] bg-cyan-500 rounded-l-lg"
                      style={{ boxShadow: '0 0 10px rgba(6, 182, 212, 0.5)' }}
                    />
                  )}
                  <div className="text-[11px] font-mono font-medium mb-0.5">{h.name}</div>
                  <div className="text-[9px] opacity-60 truncate">{h.description}</div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="col-span-9 flex flex-col gap-4 min-h-0 overflow-y-auto pr-2">
          {/* Active Hook Workspace */}
          <motion.div
            variants={listItem}
            className="relative bg-slate-900/50 rounded-lg border border-slate-800/40 flex flex-col overflow-hidden"
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

          {/* Bottom Area: Logs & Code Scan */}
          <motion.div variants={staggerContainer} className="grid grid-cols-2 gap-3">
            {/* Console Log */}
            <motion.div
              variants={listItem}
              className="relative bg-black/40 rounded-lg border border-slate-800/40 p-3 h-40 overflow-hidden flex flex-col"
            >
              {/* Corner markers */}
              <div className="absolute top-0 left-0 w-2.5 h-2.5 border-l-2 border-t-2 border-emerald-500/30 rounded-tl" />
              <div className="absolute top-0 right-0 w-2.5 h-2.5 border-r-2 border-t-2 border-emerald-500/30 rounded-tr" />
              <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-l-2 border-b-2 border-emerald-500/30 rounded-bl" />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-r-2 border-b-2 border-emerald-500/30 rounded-br" />

              <div className="text-[10px] font-mono text-slate-500 uppercase mb-2 flex justify-between">
                <span>Console Output</span>
                <button onClick={() => setLogs([])} className="text-slate-600 hover:text-white transition-colors">Clear</button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1 font-mono text-[10px]">
                {logs.length === 0 && <span className="text-slate-600 italic">No events yet...</span>}
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

            {/* Usage Snippet */}
            <motion.div
              variants={listItem}
              className="relative bg-slate-900/50 rounded-lg border border-slate-800/40 p-3 h-40 flex flex-col overflow-hidden"
            >
              {/* Corner markers */}
              <div className="absolute top-0 left-0 w-2.5 h-2.5 border-l-2 border-t-2 border-amber-500/30 rounded-tl" />
              <div className="absolute top-0 right-0 w-2.5 h-2.5 border-r-2 border-t-2 border-amber-500/30 rounded-tr" />
              <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-l-2 border-b-2 border-amber-500/30 rounded-bl" />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-r-2 border-b-2 border-amber-500/30 rounded-br" />

              <div className="text-[10px] font-mono text-slate-500 uppercase mb-2">Example Usage</div>
              <div className="flex-1 bg-slate-950 rounded-lg p-2.5 overflow-auto border border-slate-800/50">
                <pre className="text-[10px] font-mono text-slate-400">
                  {`import { ${selected} } from '@arcpay/react'

function Component() {
  const {
    ${selectedHook?.returns.slice(0, 2).join(',\n    ')}
  } = ${selected}()
}`}
                </pre>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
