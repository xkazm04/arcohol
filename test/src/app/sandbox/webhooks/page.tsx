'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@/mocks/MockArcPayProvider';
import { GlowButton, StatusBadge, staggerContainer, listItem } from '@/components/dashboard';

interface Event {
  id: string;
  type: string;
  timestamp: string;
  status: number;
  payload: Record<string, any>;
}

export default function WebhooksPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Simulation logic
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      const types = ['payment.created', 'payment.succeeded', 'subscription.updated', 'transfer.completed'];
      const newEvent: Event = {
        id: Math.random().toString(36).substring(7),
        type: types[Math.floor(Math.random() * types.length)],
        timestamp: new Date().toISOString(),
        status: Math.random() > 0.9 ? 400 : 200,
        payload: { amount: Math.floor(Math.random() * 1000), currency: 'USD' }
      };
      setEvents(prev => [newEvent, ...prev].slice(0, 50));
    }, 2500);
    return () => clearInterval(interval);
  }, [isLive]);

  const selectedEvent = events.find(e => e.id === selectedId) || events[0];

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
            style={{ textShadow: '0 0 20px rgba(245, 158, 11, 0.3)' }}
          >
            Webhooks
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">Simulate payment events, test endpoints, and verify payload signatures.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setEvents([])}
            className="px-2.5 py-1 text-[10px] font-medium text-slate-400 hover:text-white transition-colors"
          >
            Clear Logs
          </button>
          <GlowButton
            onClick={() => setIsLive(!isLive)}
            variant={isLive ? 'danger' : 'primary'}
            icon={
              <motion.div
                animate={isLive ? { scale: [1, 1.2, 1] } : undefined}
                transition={{ duration: 1, repeat: Infinity }}
                className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-400' : 'bg-current'}`}
              />
            }
          >
            {isLive ? 'STOP LISTENING' : 'START LISTENING'}
          </GlowButton>
        </div>
      </motion.div>

      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        {/* Left Panel: Event Stream */}
        <motion.div variants={listItem} className="col-span-4 flex flex-col gap-4">
          <div className="relative bg-slate-900/50 rounded-lg border border-slate-800/40 flex flex-col overflow-hidden h-full">
            {/* Corner markers */}
            <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-amber-500/30 rounded-tl" />
            <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-amber-500/30 rounded-tr" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-amber-500/30 rounded-bl" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-amber-500/30 rounded-br" />

            <div className="p-2.5 border-b border-slate-800/40 bg-slate-900/50 flex justify-between items-center">
              <span className="text-[10px] font-mono text-slate-500 uppercase">Incoming Events</span>
              <span className="text-[10px] text-slate-600">{events.length} Events</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5" ref={scrollRef}>
              {events.length === 0 && (
                <div className="p-8 text-center">
                  <motion.div
                    animate={isLive ? { opacity: [0.5, 1, 0.5] } : undefined}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-10 h-10 bg-slate-800 rounded-full mx-auto mb-3 flex items-center justify-center text-slate-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </motion.div>
                  <p className="text-xs text-slate-500">Waiting for events...</p>
                </div>
              )}
              <AnimatePresence>
                {events.map((e) => (
                  <motion.button
                    key={e.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    whileHover={{ x: 3 }}
                    onClick={() => setSelectedId(e.id)}
                    className={`w-full p-2.5 rounded-lg text-left transition-all border group relative overflow-hidden ${selectedEvent?.id === e.id
                        ? 'bg-slate-800/80 border-slate-700/50'
                        : 'bg-transparent border-transparent hover:bg-slate-800/50'
                      }`}
                  >
                    {/* Status Bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-[2px] ${e.status >= 400 ? 'bg-red-500' : 'bg-emerald-500'}`}
                      style={{ boxShadow: e.status >= 400 ? '0 0 8px rgba(239, 68, 68, 0.5)' : '0 0 8px rgba(16, 185, 129, 0.5)' }}
                    />

                    <div className="pl-2.5 flex justify-between items-start mb-0.5">
                      <span className="text-[11px] font-mono font-medium text-white truncate">{e.type}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${e.status >= 400
                          ? 'bg-red-500/10 text-red-400'
                          : 'bg-emerald-500/10 text-emerald-400'
                        }`}>{e.status}</span>
                    </div>
                    <div className="pl-2.5 flex justify-between items-center">
                      <span className="text-[9px] text-slate-500 font-mono">{e.id}</span>
                      <span className="text-[9px] text-slate-600">{new Date(e.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Right Panel: Inspector */}
        <motion.div variants={listItem} className="col-span-8 flex flex-col gap-4">
          {selectedEvent ? (
            <div className="relative bg-slate-900/50 rounded-lg border border-slate-800/40 overflow-hidden h-full flex flex-col">
              {/* Corner markers */}
              <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-cyan-500/30 rounded-tl z-10" />
              <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-cyan-500/30 rounded-tr z-10" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-cyan-500/30 rounded-bl z-10" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-cyan-500/30 rounded-br z-10" />

              {/* Inspector Header */}
              <div className="px-4 py-3 border-b border-slate-800/40 bg-slate-900/30 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2
                      className="text-sm font-bold text-white font-mono"
                      style={{ textShadow: '0 0 10px rgba(6, 182, 212, 0.4)' }}
                    >
                      {selectedEvent.type}
                    </h2>
                    <StatusBadge
                      status={selectedEvent.status >= 400 ? 'failed' : 'paid'}
                      label={`${selectedEvent.status} OK`}
                    />
                  </div>
                  <p className="text-[10px] font-mono text-slate-500">
                    ID: {selectedEvent.id} • {new Date(selectedEvent.timestamp).toLocaleString()}
                  </p>
                </div>
                <GlowButton
                  size="sm"
                  variant="secondary"
                  icon={
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  }
                >
                  Replay
                </GlowButton>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Payload */}
                <div>
                  <h3 className="text-[10px] font-mono text-slate-500 uppercase mb-2">Request Payload</h3>
                  <div className="relative bg-[#1e1e1e] rounded-lg border border-slate-800 p-3 shadow-inner overflow-hidden">
                    {/* Corner markers */}
                    <div className="absolute top-0 left-0 w-2.5 h-2.5 border-l-2 border-t-2 border-blue-500/30 rounded-tl" />
                    <div className="absolute top-0 right-0 w-2.5 h-2.5 border-r-2 border-t-2 border-blue-500/30 rounded-tr" />

                    <pre className="text-[10px] font-mono text-blue-300 leading-relaxed">
                      {JSON.stringify(selectedEvent.payload, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Headers */}
                <div>
                  <h3 className="text-[10px] font-mono text-slate-500 uppercase mb-2">Headers</h3>
                  <div className="bg-slate-950 rounded-lg border border-slate-800 p-3">
                    <div className="space-y-1.5">
                      {[
                        { key: 'Content-Type', value: 'application/json' },
                        { key: 'X-ArcPay-Event-ID', value: selectedEvent.id },
                        { key: 'X-ArcPay-Signature', value: 't=167890123,v1=5257a869e7cf...' },
                      ].map((header) => (
                        <div key={header.key} className="flex gap-4">
                          <span className="text-[10px] font-mono text-slate-500 w-32 shrink-0">{header.key}</span>
                          <span className="text-[10px] font-mono text-slate-300 truncate">{header.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-900/20 rounded-lg border border-slate-800/40 border-dashed">
              <span className="text-slate-500 text-xs">Select an event to inspect details</span>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
