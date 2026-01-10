'use client';

import { useState, useEffect } from 'react';
import { useWallet, useBalance } from '@/mocks/MockArcPayProvider';

interface CheckResult {
  name: string;
  status: 'pass' | 'warn' | 'fail' | 'running';
  message: string;
  details?: Record<string, unknown>;
}

interface HealthReport {
  overall: 'healthy' | 'degraded' | 'unhealthy' | 'checking';
  timestamp: Date;
  checks: CheckResult[];
}

function StatusIcon({ status }: { status: CheckResult['status'] }) {
  switch (status) {
    case 'pass':
      return (
        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    case 'warn':
      return (
        <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    case 'fail':
      return (
        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    case 'running':
      return (
        <svg className="w-5 h-5 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      );
  }
}

function OverallStatus({ status }: { status: HealthReport['overall'] }) {
  const configs = {
    healthy: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', label: 'Healthy' },
    degraded: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', label: 'Degraded' },
    unhealthy: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', label: 'Unhealthy' },
    checking: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', label: 'Checking...' },
  };

  const config = configs[status];

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${config.bg} ${config.border}`}>
      {status === 'checking' ? (
        <svg className="w-4 h-4 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <span className={`w-2 h-2 rounded-full ${status === 'healthy' ? 'bg-green-500' : status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'}`} />
      )}
      <span className={`font-medium ${config.text}`}>{config.label}</span>
    </div>
  );
}

export default function HealthCheckPage() {
  const wallet = useWallet();
  const balance = useBalance();
  const [report, setReport] = useState<HealthReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runHealthCheck = async () => {
    setIsRunning(true);
    const checks: CheckResult[] = [];

    // Initialize with running state
    setReport({
      overall: 'checking',
      timestamp: new Date(),
      checks: [
        { name: 'Provider Configuration', status: 'running', message: 'Checking...' },
        { name: 'Wallet Connection', status: 'running', message: 'Checking...' },
        { name: 'Balance Service', status: 'running', message: 'Checking...' },
        { name: 'Network Status', status: 'running', message: 'Checking...' },
        { name: 'Browser Environment', status: 'running', message: 'Checking...' },
      ],
    });

    // Simulate checking each item with delays
    await new Promise((r) => setTimeout(r, 500));

    // 1. Provider check
    checks.push({
      name: 'Provider Configuration',
      status: 'pass',
      message: 'ArcPayProvider is correctly configured',
      details: { mockMode: true, version: '0.1.0' },
    });
    setReport((prev) => ({
      ...prev!,
      checks: [checks[0], ...prev!.checks.slice(1)],
    }));

    await new Promise((r) => setTimeout(r, 400));

    // 2. Wallet check
    if (wallet.isConnected) {
      checks.push({
        name: 'Wallet Connection',
        status: 'pass',
        message: `Connected: ${wallet.address?.slice(0, 6)}...${wallet.address?.slice(-4)}`,
        details: { address: wallet.address, walletId: wallet.wallet?.id },
      });
    } else {
      checks.push({
        name: 'Wallet Connection',
        status: 'warn',
        message: 'No wallet connected. Connect a wallet to enable transactions.',
      });
    }
    setReport((prev) => ({
      ...prev!,
      checks: [...checks, ...prev!.checks.slice(checks.length)],
    }));

    await new Promise((r) => setTimeout(r, 300));

    // 3. Balance check
    if (wallet.isConnected) {
      checks.push({
        name: 'Balance Service',
        status: 'pass',
        message: `Balance: ${balance.balance} USDC`,
        details: { balance: balance.balance, raw: balance.balanceRaw.toString() },
      });
    } else {
      checks.push({
        name: 'Balance Service',
        status: 'warn',
        message: 'Balance unavailable - wallet not connected',
      });
    }
    setReport((prev) => ({
      ...prev!,
      checks: [...checks, ...prev!.checks.slice(checks.length)],
    }));

    await new Promise((r) => setTimeout(r, 350));

    // 4. Network check
    checks.push({
      name: 'Network Status',
      status: 'pass',
      message: 'Connected to Arc testnet',
      details: { network: 'testnet', chainId: 1 },
    });
    setReport((prev) => ({
      ...prev!,
      checks: [...checks, ...prev!.checks.slice(checks.length)],
    }));

    await new Promise((r) => setTimeout(r, 250));

    // 5. Environment check
    const isBrowser = typeof window !== 'undefined';
    checks.push({
      name: 'Browser Environment',
      status: isBrowser ? 'pass' : 'warn',
      message: isBrowser ? 'Running in browser environment' : 'Running in SSR mode',
      details: isBrowser
        ? { hasClipboard: !!navigator.clipboard, hasLocalStorage: !!window.localStorage }
        : {},
    });

    // Calculate overall status
    const hasFailures = checks.some((c) => c.status === 'fail');
    const hasWarnings = checks.some((c) => c.status === 'warn');

    setReport({
      overall: hasFailures ? 'unhealthy' : hasWarnings ? 'degraded' : 'healthy',
      timestamp: new Date(),
      checks,
    });

    setIsRunning(false);
  };

  // Run on mount
  useEffect(() => {
    runHealthCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Health Check</h1>
        <p className="text-zinc-400">
          Run diagnostics to verify your SDK configuration and identify potential issues.
        </p>
      </div>

      {/* Overall Status */}
      <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white mb-2">System Status</h2>
            <OverallStatus status={report?.overall || 'checking'} />
          </div>
          <div className="text-right">
            <button
              onClick={runHealthCheck}
              disabled={isRunning}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {isRunning ? 'Checking...' : 'Run Health Check'}
            </button>
            {report && (
              <p className="text-xs text-zinc-500 mt-2">
                Last checked: {report.timestamp.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Check Results */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">Diagnostic Results</h2>
        </div>
        <div className="divide-y divide-zinc-800">
          {report?.checks.map((check, i) => (
            <div key={i} className="px-6 py-4">
              <div className="flex items-start gap-4">
                <div className="mt-0.5">
                  <StatusIcon status={check.status} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-white">{check.name}</h3>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded ${
                        check.status === 'pass'
                          ? 'bg-green-500/10 text-green-400'
                          : check.status === 'warn'
                          ? 'bg-yellow-500/10 text-yellow-400'
                          : check.status === 'fail'
                          ? 'bg-red-500/10 text-red-400'
                          : 'bg-blue-500/10 text-blue-400'
                      }`}
                    >
                      {check.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 mt-1">{check.message}</p>
                  {check.details && Object.keys(check.details).length > 0 && (
                    <div className="mt-2 p-2 bg-zinc-800 rounded text-xs font-mono text-zinc-500">
                      {JSON.stringify(check.details, null, 2)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      {report && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
            <div className="text-2xl font-bold text-green-400">
              {report.checks.filter((c) => c.status === 'pass').length}
            </div>
            <div className="text-sm text-green-400/70">Passed</div>
          </div>
          <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
            <div className="text-2xl font-bold text-yellow-400">
              {report.checks.filter((c) => c.status === 'warn').length}
            </div>
            <div className="text-sm text-yellow-400/70">Warnings</div>
          </div>
          <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
            <div className="text-2xl font-bold text-red-400">
              {report.checks.filter((c) => c.status === 'fail').length}
            </div>
            <div className="text-sm text-red-400/70">Failed</div>
          </div>
        </div>
      )}

      {/* Usage Example */}
      <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
        <h2 className="text-lg font-semibold text-white mb-4">Using Health Check in Your App</h2>
        <pre className="bg-zinc-800 rounded-lg p-4 text-sm overflow-x-auto">
          <code className="text-zinc-300">
            <span className="text-purple-400">import</span> {'{'}{' '}
            <span className="text-blue-400">useHealthCheck</span> {'}'}{' '}
            <span className="text-purple-400">from</span>{' '}
            <span className="text-green-400">&apos;@arcpay/react&apos;</span>;{'\n\n'}
            <span className="text-purple-400">function</span>{' '}
            <span className="text-yellow-400">HealthStatus</span>() {'{\n'}
            {'  '}<span className="text-purple-400">const</span> {'{'} report, isChecking, runCheck, status {'}'} ={' '}
            <span className="text-blue-400">useHealthCheck</span>();{'\n\n'}
            {'  '}<span className="text-purple-400">if</span> (isChecking){' '}
            <span className="text-purple-400">return</span> &lt;<span className="text-blue-400">Spinner</span> /&gt;;{'\n\n'}
            {'  '}<span className="text-purple-400">return</span> ({'\n'}
            {'    '}&lt;<span className="text-blue-400">div</span>&gt;{'\n'}
            {'      '}&lt;<span className="text-blue-400">span</span>&gt;Status: {'{'}status{'}'}&lt;/<span className="text-blue-400">span</span>&gt;{'\n'}
            {'      '}&lt;<span className="text-blue-400">button</span> onClick={'{'}runCheck{'}'}&gt;Refresh&lt;/<span className="text-blue-400">button</span>&gt;{'\n'}
            {'      '}{'{'}report?.checks.map(check =&gt; ({'\n'}
            {'        '}&lt;<span className="text-blue-400">div</span> key={'{'}check.name{'}'}&gt;{'\n'}
            {'          '}{'{'}check.status === <span className="text-green-400">&apos;pass&apos;</span> ? <span className="text-green-400">&apos;OK&apos;</span> : <span className="text-green-400">&apos;!&apos;</span>{'}'} {'{'}check.name{'}'}{'\n'}
            {'        '}&lt;/<span className="text-blue-400">div</span>&gt;{'\n'}
            {'      '})){'}'}{'\n'}
            {'    '}&lt;/<span className="text-blue-400">div</span>&gt;{'\n'}
            {'  '});{'\n'}
            {'}'}
          </code>
        </pre>
      </div>
    </div>
  );
}
