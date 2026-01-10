'use client';

import { useState } from 'react';
import {
  useWallet,
  useBalance,
  useTransfer,
  useTransactionHistory,
} from '@/mocks/MockArcPayProvider';

type HookName = 'useWallet' | 'useBalance' | 'useTransfer' | 'useTransactionHistory';

interface HookInfo {
  name: HookName;
  description: string;
  returns: string[];
}

const hooks: HookInfo[] = [
  {
    name: 'useWallet',
    description: 'Manage wallet connection and state',
    returns: ['wallet', 'address', 'isConnected', 'isConnecting', 'connect()', 'disconnect()'],
  },
  {
    name: 'useBalance',
    description: 'Fetch and monitor USDC balance',
    returns: ['balance', 'balanceRaw', 'isLoading', 'refetch()'],
  },
  {
    name: 'useTransfer',
    description: 'Execute USDC transfers',
    returns: ['isTransferring', 'lastTransaction', 'transfer()', 'estimateFee()'],
  },
  {
    name: 'useTransactionHistory',
    description: 'Fetch transaction history',
    returns: ['transactions', 'isLoading', 'hasMore', 'loadMore()', 'refresh()'],
  },
];

function HookExplorer({ hookName }: { hookName: HookName }) {
  const walletHook = useWallet();
  const balanceHook = useBalance();
  const transferHook = useTransfer();
  const historyHook = useTransactionHistory();

  const [transferTo, setTransferTo] = useState('0x1234567890abcdef1234567890abcdef12345678');
  const [transferAmount, setTransferAmount] = useState('10.00');
  const [actionResult, setActionResult] = useState<string | null>(null);

  const executeAction = async (action: string) => {
    setActionResult(null);
    try {
      let result: unknown;
      switch (action) {
        case 'connect':
          await walletHook.connect();
          result = { success: true, message: 'Wallet connected' };
          break;
        case 'disconnect':
          walletHook.disconnect();
          result = { success: true, message: 'Wallet disconnected' };
          break;
        case 'transfer':
          result = await transferHook.transfer({ to: transferTo, amount: transferAmount });
          break;
        case 'refetch':
          await balanceHook.refetch();
          result = { success: true, message: 'Balance refetched' };
          break;
        default:
          result = { error: 'Unknown action' };
      }
      setActionResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setActionResult(JSON.stringify({ error: (error as Error).message }, null, 2));
    }
  };

  const renderHookState = () => {
    let state: Record<string, unknown>;
    switch (hookName) {
      case 'useWallet':
        state = {
          wallet: walletHook.wallet,
          address: walletHook.address,
          isConnected: walletHook.isConnected,
          isConnecting: walletHook.isConnecting,
        };
        break;
      case 'useBalance':
        state = {
          balance: balanceHook.balance,
          balanceRaw: balanceHook.balanceRaw.toString(),
          isLoading: balanceHook.isLoading,
        };
        break;
      case 'useTransfer':
        state = {
          isTransferring: transferHook.isTransferring,
          lastTransaction: transferHook.lastTransaction,
        };
        break;
      case 'useTransactionHistory':
        state = {
          transactions: historyHook.transactions,
          isLoading: historyHook.isLoading,
          hasMore: historyHook.hasMore,
        };
        break;
      default:
        state = {};
    }
    return JSON.stringify(state, null, 2);
  };

  const renderActions = () => {
    switch (hookName) {
      case 'useWallet':
        return (
          <div className="flex gap-3">
            <button
              onClick={() => executeAction('connect')}
              disabled={walletHook.isConnected || walletHook.isConnecting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {walletHook.isConnecting ? 'Connecting...' : 'connect()'}
            </button>
            <button
              onClick={() => executeAction('disconnect')}
              disabled={!walletHook.isConnected}
              className="px-4 py-2 bg-zinc-700 text-white rounded-lg font-medium hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              disconnect()
            </button>
          </div>
        );
      case 'useBalance':
        return (
          <button
            onClick={() => executeAction('refetch')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            refetch()
          </button>
        );
      case 'useTransfer':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Recipient Address</label>
                <input
                  type="text"
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Amount (USDC)</label>
                <input
                  type="text"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              onClick={() => executeAction('transfer')}
              disabled={!walletHook.isConnected || transferHook.isTransferring}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {transferHook.isTransferring ? 'Transferring...' : 'transfer()'}
            </button>
          </div>
        );
      case 'useTransactionHistory':
        return (
          <button
            onClick={() => historyHook.refresh()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            refresh()
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Current State */}
      <div>
        <h3 className="text-sm font-medium text-zinc-400 mb-2">Current State</h3>
        <pre className="bg-zinc-800 rounded-lg p-4 text-sm text-green-400 font-mono overflow-x-auto">
          {renderHookState()}
        </pre>
      </div>

      {/* Actions */}
      <div>
        <h3 className="text-sm font-medium text-zinc-400 mb-2">Actions</h3>
        {renderActions()}
      </div>

      {/* Action Result */}
      {actionResult && (
        <div>
          <h3 className="text-sm font-medium text-zinc-400 mb-2">Last Action Result</h3>
          <pre className="bg-zinc-800 rounded-lg p-4 text-sm text-blue-400 font-mono overflow-x-auto">
            {actionResult}
          </pre>
        </div>
      )}
    </div>
  );
}

export default function APIExplorerPage() {
  const [selectedHook, setSelectedHook] = useState<HookName>('useWallet');

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">API Explorer</h1>
        <p className="text-zinc-400">
          Interact with SDK hooks in real-time. Select a hook to see its state and available actions.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Hook Selector */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-semibold text-white mb-4">Available Hooks</h2>
          <div className="space-y-2">
            {hooks.map((hook) => (
              <button
                key={hook.name}
                onClick={() => setSelectedHook(hook.name)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedHook === hook.name
                    ? 'bg-blue-500/10 border-blue-500/30 text-white'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="font-mono text-sm text-blue-400 mb-1">{hook.name}</div>
                <div className="text-sm">{hook.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Hook Details */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white font-mono">{selectedHook}()</h2>
              <span className="px-3 py-1 text-xs font-medium bg-green-500/10 text-green-400 rounded-full">
                Active
              </span>
            </div>

            {/* Returns */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-zinc-400 mb-2">Returns</h3>
              <div className="flex flex-wrap gap-2">
                {hooks.find((h) => h.name === selectedHook)?.returns.map((ret) => (
                  <span
                    key={ret}
                    className="px-2 py-1 text-xs font-mono bg-zinc-800 text-zinc-300 rounded"
                  >
                    {ret}
                  </span>
                ))}
              </div>
            </div>

            {/* Interactive Explorer */}
            <HookExplorer hookName={selectedHook} />
          </div>
        </div>
      </div>

      {/* Code Example */}
      <div className="mt-8 bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
        <h2 className="text-lg font-semibold text-white mb-4">Usage Example</h2>
        <pre className="bg-zinc-800 rounded-lg p-4 text-sm overflow-x-auto">
          <code className="text-zinc-300">
            <span className="text-purple-400">import</span> {'{'}{' '}
            <span className="text-blue-400">{selectedHook}</span> {'}'}{' '}
            <span className="text-purple-400">from</span>{' '}
            <span className="text-green-400">&apos;@arcpay/react&apos;</span>;{'\n\n'}
            <span className="text-purple-400">function</span>{' '}
            <span className="text-yellow-400">MyComponent</span>() {'{\n'}
            {'  '}
            <span className="text-purple-400">const</span> {'{'}{' '}
            {hooks
              .find((h) => h.name === selectedHook)
              ?.returns.slice(0, 3)
              .join(', ')}{' '}
            {'}'} = <span className="text-blue-400">{selectedHook}</span>();{'\n\n'}
            {'  '}
            <span className="text-purple-400">return</span> ({'\n'}
            {'    '}&lt;<span className="text-blue-400">div</span>&gt;{'\n'}
            {'      '}&lt;<span className="text-blue-400">pre</span>&gt;{'{'}JSON.stringify({'{'}{' '}
            {hooks
              .find((h) => h.name === selectedHook)
              ?.returns.filter((r) => !r.includes('('))
              .slice(0, 2)
              .join(', ')}{' '}
            {'}'}, null, 2){'}'}&lt;/<span className="text-blue-400">pre</span>&gt;{'\n'}
            {'    '}&lt;/<span className="text-blue-400">div</span>&gt;{'\n'}
            {'  '});{'\n'}
            {'}'}
          </code>
        </pre>
      </div>
    </div>
  );
}
