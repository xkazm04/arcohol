'use client';

import { useState, useEffect } from 'react';
import {
  useWallet,
  useBalance,
  useTransfer,
  useTransactionHistory,
} from '@/mocks/MockArcPayProvider';
import type { HookName } from '../_lib';
import { SyntaxHighlighter } from './SyntaxHighlighter';

interface HookExplorerProps {
  hookName: HookName;
  onLog: (msg: string, type?: 'success' | 'error') => void;
}

export function HookExplorer({ hookName, onLog }: HookExplorerProps) {
  const walletHook = useWallet();
  const balanceHook = useBalance();
  const transferHook = useTransfer();
  const historyHook = useTransactionHistory();

  const [transferTo, setTransferTo] = useState('0x1234567890abcdef1234567890abcdef12345678');
  const [transferAmount, setTransferAmount] = useState('10.00');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setResult(null);
    setError(null);
  }, [hookName]);

  const execute = async (action: string) => {
    setResult(null);
    setError(null);
    onLog(`Executing ${action}...`);
    try {
      let res: unknown;
      switch (action) {
        case 'connect': await walletHook.connect(); res = { success: true, status: 'Connected' }; break;
        case 'disconnect': walletHook.disconnect(); res = { success: true, status: 'Disconnected' }; break;
        case 'transfer':
          if (!walletHook.isConnected) throw new Error('Wallet not connected');
          res = await transferHook.transfer({ to: transferTo, amount: transferAmount });
          break;
        case 'refetch': await balanceHook.refetch(); res = { success: true, balance: balanceHook.balance }; break;
        case 'refresh': await historyHook.refresh(); res = { success: true, count: historyHook.transactions.length }; break;
        default: res = { error: 'Unknown action' };
      }
      setResult(JSON.stringify(res, null, 2));
      onLog(`${action} completed successfully`, 'success');
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      setResult(JSON.stringify({ error: msg }, null, 2));
      onLog(`${action} failed: ${msg}`, 'error');
    }
  };

  const getState = () => {
    switch (hookName) {
      case 'useWallet': return { address: walletHook.address, isConnected: walletHook.isConnected, isConnecting: walletHook.isConnecting };
      case 'useBalance': return { balance: balanceHook.balance, isLoading: balanceHook.isLoading };
      case 'useTransfer': return { isTransferring: transferHook.isTransferring, lastTransaction: transferHook.lastTransaction };
      case 'useTransactionHistory': return { count: historyHook.transactions.length, isLoading: historyHook.isLoading };
    }
  };

  const renderActions = () => {
    switch (hookName) {
      case 'useWallet':
        return (
          <div className="flex gap-2">
            <button onClick={() => execute('connect')} disabled={walletHook.isConnected} className="px-3 py-2 text-xs font-medium bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors shadow-lg shadow-cyan-500/20 disabled:shadow-none">connect()</button>
            <button onClick={() => execute('disconnect')} disabled={!walletHook.isConnected} className="px-3 py-2 text-xs font-medium bg-slate-700 text-white rounded hover:bg-slate-600 disabled:opacity-50 transition-colors">disconnect()</button>
          </div>
        );
      case 'useBalance':
        return <button onClick={() => execute('refetch')} className="px-3 py-2 text-xs font-medium bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors shadow-lg shadow-cyan-500/20">refetch()</button>;
      case 'useTransfer':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500">RECIPIENT</label>
                <input value={transferTo} onChange={(e) => setTransferTo(e.target.value)} placeholder="0x..." className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500">AMOUNT</label>
                <input value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} placeholder="0.00" className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors" />
              </div>
            </div>
            <button onClick={() => execute('transfer')} disabled={!walletHook.isConnected || transferHook.isTransferring} className="w-full px-3 py-2 text-xs font-medium bg-green-600 text-white rounded hover:bg-green-500 disabled:opacity-50 transition-colors shadow-lg shadow-green-600/20 disabled:shadow-none">transfer()</button>
          </div>
        );
      case 'useTransactionHistory':
        return <button onClick={() => execute('refresh')} className="px-3 py-2 text-xs font-medium bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors shadow-lg shadow-cyan-500/20">refresh()</button>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* State Viewer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-slate-500">Current State</div>
            <div className="flex gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs text-green-500 font-medium">LIVE</span>
            </div>
          </div>
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/50 overflow-hidden relative group">
            <SyntaxHighlighter code={JSON.stringify(getState(), null, 2)} />
          </div>
        </div>

        {/* Action Panel */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-slate-500">Methods</div>
          <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800/60">
            {renderActions()}
          </div>
        </div>
      </div>

      {/* Result Viewer */}
      {(result || error) && (
        <div className={`space-y-2 animate-in fade-in slide-in-from-top-2 duration-300`}>
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-slate-500">Execute Result</div>
            {error ? (
              <span className="text-xs px-2 py-0.5 bg-red-500/10 text-red-400 rounded border border-red-500/20">ERROR</span>
            ) : (
              <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-400 rounded border border-green-500/20">SUCCESS</span>
            )}
          </div>
          <div className={`p-4 rounded-xl border overflow-x-auto ${error ? 'bg-red-500/5 border-red-500/20' : 'bg-blue-500/5 border-blue-500/20'}`}>
            <SyntaxHighlighter code={result || '{}'} />
          </div>
        </div>
      )}
    </div>
  );
}
