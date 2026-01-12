'use client';

import { useState, useRef, useEffect } from 'react';
import { useWallet } from '@/mocks/MockArcPayProvider';

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
    <div className="h-[calc(100vh-100px)] flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Webhooks</h1>
          <p className="text-sm text-slate-400 max-w-xl">Simulate payment events, test your webhook endpoints, and verify payload signatures. Essential for building reliable server-side integrations that respond to transactions in real-time.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setEvents([])}
            className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Clear Logs
          </button>
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${isLive
                ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                : 'bg-green-500 hover:bg-green-400 text-black shadow-lg shadow-green-500/20'
              }`}
          >
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-black'}`} />
            {isLive ? 'STOP LISTENING' : 'START LISTENING'}
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        {/* Left Panel: Event Stream */}
        <div className="col-span-4 flex flex-col gap-4">
          <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-800/60 flex flex-col overflow-hidden h-full">
            <div className="p-3 border-b border-slate-800/60 bg-slate-900/40 flex justify-between items-center">
              <span className="text-xs font-medium text-slate-500">Incoming Events</span>
              <span className="text-xs text-slate-600">{events.length} Events</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2 scroller" ref={scrollRef}>
              {events.length === 0 && (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 bg-slate-800 rounded-full mx-auto mb-3 flex items-center justify-center text-slate-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <p className="text-sm text-slate-500">Waiting for events...</p>
                </div>
              )}
              {events.map((e) => (
                <button
                  key={e.id}
                  onClick={() => setSelectedId(e.id)}
                  className={`w-full p-3 rounded-lg text-left transition-all border group relative overflow-hidden ${selectedEvent?.id === e.id
                      ? 'bg-slate-800 border-slate-700 shadow-md'
                      : 'bg-transparent border-transparent hover:bg-slate-800/50'
                    }`}
                >
                  {/* Status Bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${e.status >= 400 ? 'bg-red-500' : 'bg-emerald-500'
                    }`} />

                  <div className="pl-3 flex justify-between items-start mb-1">
                    <span className="text-xs font-mono font-medium text-white truncate">{e.type}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${e.status >= 400
                        ? 'bg-red-500/10 text-red-400'
                        : 'bg-emerald-500/10 text-emerald-400'
                      }`}>{e.status}</span>
                  </div>
                  <div className="pl-3 flex justify-between items-center">
                    <span className="text-[10px] text-slate-500 font-mono">{e.id}</span>
                    <span className="text-[10px] text-slate-600">{new Date(e.timestamp).toLocaleTimeString()}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Inspector */}
        <div className="col-span-8 flex flex-col gap-4">
          {selectedEvent ? (
            <div className="bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-800/60 overflow-hidden h-full flex flex-col">
              {/* Inspector Header */}
              <div className="px-6 py-4 border-b border-slate-800/60 bg-slate-900/20 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-lg font-bold text-white font-mono">{selectedEvent.type}</h2>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${selectedEvent.status >= 400
                        ? 'bg-red-500/10 text-red-500 border-red-500/20'
                        : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      }`}>{selectedEvent.status} OK</span>
                  </div>
                  <p className="text-xs font-mono text-slate-500">ID: {selectedEvent.id} • {new Date(selectedEvent.timestamp).toLocaleString()}</p>
                </div>
                <button className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  Replay Event
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Payload */}
                <div>
                  <h3 className="text-xs font-mono text-slate-500 uppercase mb-2">Request Payload</h3>
                  <div className="bg-[#1e1e1e] rounded-lg border border-slate-800 p-4 shadow-inner">
                    <pre className="text-xs font-mono text-blue-300 leading-relaxed">
                      {JSON.stringify(selectedEvent.payload, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Headers */}
                <div>
                  <h3 className="text-xs font-mono text-slate-500 uppercase mb-2">Headers</h3>
                  <div className="bg-slate-950 rounded-lg border border-slate-800 p-4">
                    <div className="space-y-1">
                      <div className="flex gap-4">
                        <span className="text-xs font-mono text-slate-500 w-32 shrink-0">Content-Type</span>
                        <span className="text-xs font-mono text-slate-300">application/json</span>
                      </div>
                      <div className="flex gap-4">
                        <span className="text-xs font-mono text-slate-500 w-32 shrink-0">X-ArcPay-Event-ID</span>
                        <span className="text-xs font-mono text-slate-300">{selectedEvent.id}</span>
                      </div>
                      <div className="flex gap-4">
                        <span className="text-xs font-mono text-slate-500 w-32 shrink-0">X-ArcPay-Signature</span>
                        <span className="text-xs font-mono text-slate-300 truncate">t=167890123,v1=5257a869e7cf...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-900/20 backdrop-blur-sm rounded-xl border border-slate-800/60 border-dashed">
              <span className="text-slate-500 text-sm">Select an event to inspect details</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
