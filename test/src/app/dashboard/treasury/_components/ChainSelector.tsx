'use client';

import { useState, useRef, useEffect } from 'react';
import type { ChainEnvironment } from '@/features/treasury';
import { CHAIN_CONFIGS } from '@/features/treasury';

interface ChainSelectorProps {
  chain: ChainEnvironment;
  onChange: (chain: ChainEnvironment) => void;
}

const chains: { id: ChainEnvironment; name: string; color: string }[] = [
  { id: 'arc-testnet', name: 'Arc Testnet', color: 'cyan' },
  { id: 'arc-mainnet', name: 'Arc Mainnet', color: 'emerald' },
];

export function ChainSelector({ chain, onChange }: ChainSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const config = CHAIN_CONFIGS[chain];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 bg-slate-900/50 rounded-lg border transition-all ${
          isOpen ? 'border-cyan-500/50' : 'border-slate-800/50 hover:border-slate-700'
        }`}
      >
        <div className={`w-2 h-2 rounded-full ${chain === 'arc-testnet' ? 'bg-cyan-500' : 'bg-emerald-500'}`} />
        <span className="text-sm font-mono text-slate-300">{config.name}</span>
        <span className="text-xs text-slate-600">ID:{config.chainId}</span>
        <svg
          className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 right-0 bg-slate-900 border border-slate-800 rounded-lg shadow-xl z-50 min-w-[200px] overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Select Network</span>
          </div>
          {chains.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                onChange(c.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${
                chain === c.id
                  ? 'bg-cyan-500/10 text-cyan-400'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${c.color === 'cyan' ? 'bg-cyan-500' : 'bg-emerald-500'}`} />
              <span className="text-sm font-mono">{c.name}</span>
              {chain === c.id && (
                <svg className="w-4 h-4 ml-auto text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
