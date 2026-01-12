'use client';

import { useState } from 'react';
import { hooks, type HookName, type LogEntry } from './_lib';
import { HookExplorer } from './_components';

export default function APIExplorerPage() {
  const [selected, setSelected] = useState<HookName>('useWallet');
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    setLogs(prev => [{ id: Date.now(), msg, type, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 4)]);
  };

  const selectedHook = hooks.find(h => h.name === selected);

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">API Explorer</h1>
          <p className="text-sm text-slate-400 max-w-xl">Interactive playground to test SDK hooks in real-time. Execute methods, inspect state changes, and understand return values before integrating into your application.</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        {/* Sidebar */}
        <div className="col-span-3 flex flex-col gap-4 min-h-0">
          <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-800/60 flex flex-col overflow-hidden h-full">
            <div className="p-3 border-b border-slate-800/60 bg-slate-900/40">
              <span className="text-xs font-medium text-slate-500">Available Hooks</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {hooks.map((h) => (
                <button
                  key={h.name}
                  onClick={() => setSelected(h.name)}
                  className={`w-full p-3 rounded-lg text-left transition-all group relative ${selected === h.name
                      ? 'bg-cyan-500/10 text-cyan-400'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                    }`}
                >
                  {selected === h.name && (
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-cyan-500 rounded-l-lg" />
                  )}
                  <div className="text-xs font-mono font-medium mb-1">{h.name}</div>
                  <div className="text-[10px] opacity-60 truncate">{h.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-9 flex flex-col gap-4 min-h-0 overflow-y-auto pr-2">
          {/* Active Hook Workspace */}
          <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-800/60 flex flex-col">
            <div className="px-6 py-4 border-b border-slate-800/60 bg-slate-900/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-mono text-cyan-400 font-bold">{selected}()</span>
                  <span className="text-slate-600 text-sm">// {selectedHook?.description}</span>
                </div>
                <div className="flex gap-2">
                  {selectedHook?.returns.map(r => (
                    <span key={r} className="px-2 py-1 bg-slate-800 rounded text-xs font-mono text-slate-400 border border-slate-700">{r}</span>
                  ))}
                </div>
              </div>
              <p className="text-sm text-slate-400 mb-2">{selectedHook?.details}</p>
              <div className="text-xs">
                <span className="text-slate-600">Best for: </span>
                <span className="text-cyan-400/70">{selectedHook?.useCase}</span>
              </div>
            </div>

            <div className="p-6">
              <HookExplorer hookName={selected} onLog={addLog} />
            </div>
          </div>

          {/* Bottom Area: Logs & Code Scan */}
          <div className="grid grid-cols-2 gap-4">
            {/* Simple Console Log */}
            <div className="bg-black/40 rounded-xl border border-slate-800/60 p-4 h-48 overflow-hidden flex flex-col">
              <div className="text-xs font-medium text-slate-500 mb-2 flex justify-between">
                <span>Console Output</span>
                <button onClick={() => setLogs([])} className="hover:text-white transition-colors">Clear</button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1.5 font-mono text-[11px]">
                {logs.length === 0 && <span className="text-slate-600 italic">No events yet...</span>}
                {logs.map(log => (
                  <div key={log.id} className="flex gap-2">
                    <span className="text-slate-600">[{log.time}]</span>
                    <span className={`${log.type === 'error' ? 'text-red-400' :
                        log.type === 'success' ? 'text-green-400' :
                          'text-slate-300'
                      }`}>{log.msg}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Usage Snippet */}
            <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-4 h-48 flex flex-col">
              <div className="text-xs font-medium text-slate-500 mb-2">Example Usage</div>
              <div className="flex-1 bg-slate-950 rounded-lg p-3 overflow-auto border border-slate-800/50">
                <pre className="text-[11px] font-mono text-slate-400">
                  {`import { ${selected} } from '@arcpay/react'

function Component() {
  const {
    ${selectedHook?.returns.slice(0, 2).join(',\n    ')}
  } = ${selected}()
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
