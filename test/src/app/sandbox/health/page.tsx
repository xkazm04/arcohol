'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@/hooks/useWallet';
import { useNetwork } from '../_context';
import { initialChecks, type Check, type OverallStatus } from './_lib';
import { HealthStats, DiagnosticConsole } from './_components';
import { GlowButton, staggerContainer, listItem } from '@/components/dashboard';

export default function HealthCheckPage() {
  const wallet = useWallet();
  const { config, rpcCall, network } = useNetwork();
  const [checks, setChecks] = useState<Check[]>([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const runChecks = useCallback(async () => {
    setRunning(true);
    setProgress(0);
    const startTime = Date.now();

    setChecks(initialChecks);

    const update = (id: string, status: Check['status'], message: string) => {
      setChecks(prev => prev.map(c => c.id === id ? { ...c, status, message, duration: Date.now() - startTime } : c));
    };

    // 1. Provider Initialization - Check if network config is valid
    update('c1', 'running', 'Verifying SDK configuration...');
    await new Promise(r => setTimeout(r, 200));
    try {
      if (config.rpcUrl && config.chainId) {
        update('c1', 'pass', `SDK configured for ${config.name}`);
      } else {
        update('c1', 'fail', 'Invalid network configuration');
      }
    } catch {
      update('c1', 'fail', 'SDK configuration error');
    }
    setProgress(20);

    // 2. Network Connectivity - Real RPC call
    update('c2', 'running', `Pinging ${config.name}...`);
    try {
      const blockNumber = await rpcCall<string>('eth_blockNumber');
      const blockNum = parseInt(blockNumber, 16);
      update('c2', 'pass', `Connected - Block #${blockNum.toLocaleString()}`);
    } catch (err) {
      update('c2', 'fail', `Failed to connect: ${(err as Error).message}`);
    }
    setProgress(40);

    // 3. RPC Latency - Measure actual response time
    update('c3', 'running', 'Measuring latency...');
    try {
      const latencyStart = performance.now();
      await rpcCall<string>('eth_chainId');
      const latency = Math.round(performance.now() - latencyStart);

      if (latency > 500) {
        update('c3', 'fail', `${latency}ms - High latency detected`);
      } else if (latency > 200) {
        update('c3', 'warn', `${latency}ms - Elevated latency`);
      } else {
        update('c3', 'pass', `${latency}ms response time`);
      }
    } catch (err) {
      update('c3', 'fail', `Latency check failed: ${(err as Error).message}`);
    }
    setProgress(60);

    // 4. Wallet Connection - Real wallet state
    update('c4', 'running', 'Checking wallet state...');
    await new Promise(r => setTimeout(r, 150));
    if (wallet.isConnected && wallet.address) {
      const shortAddr = `${wallet.address.slice(0, 8)}...${wallet.address.slice(-6)}`;
      if (wallet.isCorrectNetwork) {
        update('c4', 'pass', `Connected: ${shortAddr}`);
      } else {
        update('c4', 'warn', `Connected but wrong network: ${shortAddr}`);
      }
    } else {
      update('c4', 'warn', 'No wallet connected. Some features unavailable.');
    }
    setProgress(80);

    // 5. Balance Fetch - Real balance check
    update('c5', 'running', 'Fetching balance...');
    if (wallet.isConnected && wallet.address) {
      try {
        const balance = await rpcCall<string>('eth_getBalance', [wallet.address, 'latest']);
        const balanceNum = parseInt(balance, 16) / 1e18;
        update('c5', 'pass', `Balance: ${balanceNum.toFixed(4)} ${config.nativeCurrency.symbol}`);
      } catch (err) {
        update('c5', 'fail', `Balance fetch failed: ${(err as Error).message}`);
      }
    } else {
      update('c5', 'pending', 'Skipped (No Wallet)');
    }
    setProgress(100);

    setLastRun(new Date());
    setRunning(false);
  }, [wallet, config, rpcCall]);

  useEffect(() => {
    runChecks();
  }, [network]); // Re-run when network changes

  const overall: OverallStatus = checks.some(c => c.status === 'fail') ? 'critical'
    : checks.some(c => c.status === 'warn') ? 'degraded'
      : running ? 'optimizing' : 'healthy';

  const stats = {
    passed: checks.filter(c => c.status === 'pass').length,
    warning: checks.filter(c => c.status === 'warn').length,
    failed: checks.filter(c => c.status === 'fail').length
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4 max-w-5xl"
    >
      {/* Header & Controls */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1
            className="text-lg font-semibold text-white mb-1"
            style={{ textShadow: '0 0 20px rgba(16, 185, 129, 0.3)' }}
          >
            Health Monitor
          </h1>
          <p className="text-xs text-slate-400 max-w-lg">
            Real-time diagnostics for SDK configuration, network connectivity, and RPC latency on <span className={network === 'testnet' ? 'text-cyan-400' : 'text-emerald-400'}>{config.name}</span>.
          </p>
        </div>
        <div className="flex items-center gap-4">
          {lastRun && (
            <div className="text-right">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Last Verification</div>
              <div className="text-xs text-slate-300">{lastRun.toLocaleTimeString()}</div>
            </div>
          )}
          <GlowButton
            onClick={runChecks}
            disabled={running}
            variant={running ? 'secondary' : 'primary'}
            icon={
              running ? (
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )
            }
          >
            {running ? 'Running...' : 'Run Diagnostics'}
          </GlowButton>
        </div>
      </motion.div>

      {/* Hero Stats */}
      <motion.div variants={listItem}>
        <HealthStats
          overall={overall}
          running={running}
          stats={stats}
          totalChecks={checks.length}
        />
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        variants={listItem}
        className={`relative h-1.5 w-full bg-slate-800 rounded-full overflow-hidden transition-opacity duration-300 ${running ? 'opacity-100' : 'opacity-0'}`}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
          className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
          style={{ boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)' }}
        />
      </motion.div>

      {/* Diagnostic Console */}
      <motion.div variants={listItem} className="space-y-4">
        <DiagnosticConsole checks={checks} />
      </motion.div>
    </motion.div>
  );
}
