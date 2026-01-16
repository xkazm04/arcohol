'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useNetwork } from '../../_context';
import type { HookName } from '../_lib';
import { SyntaxHighlighter } from './SyntaxHighlighter';

interface HookExplorerProps {
  hookName: HookName;
  onLog: (msg: string, type?: 'success' | 'error') => void;
}

export function HookExplorer({ hookName, onLog }: HookExplorerProps) {
  const wallet = useWallet();
  const { config, rpcCall, network } = useNetwork();

  const [transferTo, setTransferTo] = useState('0x1234567890abcdef1234567890abcdef12345678');
  const [transferAmount, setTransferAmount] = useState('0.001');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Live state for different hooks
  const [balance, setBalance] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<unknown[]>([]);
  const [isTransferring, setIsTransferring] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<string | null>(null);

  useEffect(() => {
    setResult(null);
    setError(null);
  }, [hookName]);

  // Fetch balance when wallet is connected
  useEffect(() => {
    if (wallet.isConnected && wallet.address) {
      fetchBalance();
    }
  }, [wallet.isConnected, wallet.address, network]);

  const fetchBalance = async () => {
    if (!wallet.address) return;
    try {
      const bal = await rpcCall<string>('eth_getBalance', [wallet.address, 'latest']);
      const balNum = parseInt(bal, 16) / 1e18;
      setBalance(balNum.toFixed(6));
    } catch {
      setBalance('0');
    }
  };

  const execute = async (action: string) => {
    setResult(null);
    setError(null);
    setIsLoading(true);
    onLog(`Executing ${action}...`);

    try {
      let res: unknown;

      switch (action) {
        case 'connect':
          await wallet.connect();
          res = { success: true, status: 'Connected', address: wallet.address };
          break;

        case 'disconnect':
          wallet.disconnect();
          res = { success: true, status: 'Disconnected' };
          break;

        case 'refetch':
          await fetchBalance();
          res = { success: true, balance: balance, network: config.name };
          break;

        case 'transfer':
          if (!wallet.isConnected) throw new Error('Wallet not connected');
          setIsTransferring(true);
          // Note: This would need MetaMask signing in production
          // For demo, we simulate the transfer request
          const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
          setLastTransaction(txHash);
          res = {
            success: true,
            txHash,
            to: transferTo,
            amount: transferAmount,
            network: config.name
          };
          setIsTransferring(false);
          break;

        case 'refresh':
          // Fetch recent transactions from the blockchain
          if (!wallet.address) throw new Error('Wallet not connected');
          const blockNum = await rpcCall<string>('eth_blockNumber');
          const block = parseInt(blockNum, 16);
          setTransactions([
            { blockNumber: block, type: 'latest_block' }
          ]);
          res = { success: true, latestBlock: block, network: config.name };
          break;

        default:
          res = { error: 'Unknown action' };
      }

      setResult(JSON.stringify(res, null, 2));
      onLog(`${action} completed successfully`, 'success');
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      setResult(JSON.stringify({ error: msg }, null, 2));
      onLog(`${action} failed: ${msg}`, 'error');
    } finally {
      setIsLoading(false);
      setIsTransferring(false);
    }
  };

  const getState = () => {
    switch (hookName) {
      case 'useWallet':
        return {
          address: wallet.address,
          isConnected: wallet.isConnected,
          isConnecting: wallet.isConnecting,
          chainId: wallet.chainId,
          isCorrectNetwork: wallet.isCorrectNetwork,
          network: config.name
        };
      case 'useBalance':
        return {
          balance: balance || '0',
          balanceRaw: balance ? (parseFloat(balance) * 1e18).toString() : '0',
          isLoading,
          symbol: config.nativeCurrency.symbol,
          network: config.name
        };
      case 'useTransfer':
        return {
          isTransferring,
          lastTransaction,
          network: config.name
        };
      case 'useTransactionHistory':
        return {
          count: transactions.length,
          isLoading,
          network: config.name
        };
    }
  };

  const renderActions = () => {
    switch (hookName) {
      case 'useWallet':
        return (
          <div className="flex gap-2">
            <button
              onClick={() => execute('connect')}
              disabled={wallet.isConnected || wallet.isConnecting}
              className="px-3 py-2 text-xs font-medium bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors shadow-lg shadow-cyan-500/20 disabled:shadow-none"
            >
              connect()
            </button>
            <button
              onClick={() => execute('disconnect')}
              disabled={!wallet.isConnected}
              className="px-3 py-2 text-xs font-medium bg-slate-700 text-white rounded hover:bg-slate-600 disabled:opacity-50 transition-colors"
            >
              disconnect()
            </button>
          </div>
        );

      case 'useBalance':
        return (
          <button
            onClick={() => execute('refetch')}
            disabled={!wallet.isConnected || isLoading}
            className="px-3 py-2 text-xs font-medium bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors shadow-lg shadow-cyan-500/20 disabled:shadow-none"
          >
            {isLoading ? 'Loading...' : 'refetch()'}
          </button>
        );

      case 'useTransfer':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500">RECIPIENT</label>
                <input
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500">AMOUNT ({config.nativeCurrency.symbol})</label>
                <input
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>
            </div>
            <button
              onClick={() => execute('transfer')}
              disabled={!wallet.isConnected || isTransferring}
              className="w-full px-3 py-2 text-xs font-medium bg-green-600 text-white rounded hover:bg-green-500 disabled:opacity-50 transition-colors shadow-lg shadow-green-600/20 disabled:shadow-none"
            >
              {isTransferring ? 'Transferring...' : 'transfer()'}
            </button>
          </div>
        );

      case 'useTransactionHistory':
        return (
          <button
            onClick={() => execute('refresh')}
            disabled={!wallet.isConnected || isLoading}
            className="px-3 py-2 text-xs font-medium bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50 transition-colors shadow-lg shadow-cyan-500/20 disabled:shadow-none"
          >
            {isLoading ? 'Loading...' : 'refresh()'}
          </button>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* State Viewer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-slate-500">Current State</div>
            <div className="flex gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs text-green-500 font-medium">LIVE</span>
            </div>
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/50 overflow-hidden relative group">
            <SyntaxHighlighter code={JSON.stringify(getState(), null, 2)} />
          </div>
        </div>

        {/* Action Panel */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-slate-500">Methods</div>
          <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800/60">
            {renderActions()}
          </div>
        </div>
      </div>

      {/* Result Viewer */}
      {(result || error) && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-slate-500">Execute Result</div>
            {error ? (
              <span className="text-xs px-2 py-0.5 bg-red-500/10 text-red-400 rounded border border-red-500/20">ERROR</span>
            ) : (
              <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-400 rounded border border-green-500/20">SUCCESS</span>
            )}
          </div>
          <div className={`p-3 rounded-lg border overflow-x-auto ${error ? 'bg-red-500/5 border-red-500/20' : 'bg-blue-500/5 border-blue-500/20'}`}>
            <SyntaxHighlighter code={result || '{}'} />
          </div>
        </div>
      )}
    </div>
  );
}
