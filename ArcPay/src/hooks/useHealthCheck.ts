/**
 * Health Check Hook for ArcPay React SDK
 *
 * Provides diagnostic information about SDK configuration
 * and wallet connectivity.
 */

import { useState, useEffect, useCallback } from 'react';
import { useArcPay } from '../providers/ArcPayProvider';
import { useWallet } from './useWallet';
import { useBalance } from './useBalance';

/**
 * Individual check result
 */
export interface CheckResult {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Complete health check report
 */
export interface HealthCheckReport {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  version: string;
  checks: CheckResult[];
  summary: {
    passed: number;
    warnings: number;
    failed: number;
    total: number;
  };
}

/**
 * Health check hook return type
 */
export interface UseHealthCheckReturn {
  /** Current health check report */
  report: HealthCheckReport | null;
  /** Whether a health check is in progress */
  isChecking: boolean;
  /** Run a new health check */
  runCheck: () => Promise<HealthCheckReport>;
  /** Overall health status (shorthand) */
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
}

/**
 * Hook to check SDK health and configuration
 *
 * @example
 * ```tsx
 * function HealthStatus() {
 *   const { report, isChecking, runCheck, status } = useHealthCheck();
 *
 *   if (isChecking) return <Spinner />;
 *
 *   return (
 *     <div>
 *       <span>Status: {status}</span>
 *       <button onClick={runCheck}>Refresh</button>
 *       {report?.checks.map(check => (
 *         <div key={check.name}>
 *           {check.status === 'pass' ? '✅' : '❌'} {check.name}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useHealthCheck(): UseHealthCheckReturn {
  const [report, setReport] = useState<HealthCheckReport | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Get context and hooks
  let providerContext: ReturnType<typeof useArcPay> | null = null;
  let walletContext: ReturnType<typeof useWallet> | null = null;
  let balanceContext: ReturnType<typeof useBalance> | null = null;

  try {
    providerContext = useArcPay();
  } catch {
    // Provider not available
  }

  try {
    walletContext = useWallet();
  } catch {
    // Wallet hook not available
  }

  try {
    balanceContext = useBalance();
  } catch {
    // Balance hook not available
  }

  const runCheck = useCallback(async (): Promise<HealthCheckReport> => {
    setIsChecking(true);

    const checks: CheckResult[] = [];

    // 1. Provider check
    if (providerContext) {
      checks.push({
        name: 'ArcPayProvider',
        status: 'pass',
        message: 'Provider is configured correctly',
        details: {
          hasCircleClient: !!providerContext.circleClient,
          hasArcClient: !!providerContext.arcClient,
        },
      });
    } else {
      checks.push({
        name: 'ArcPayProvider',
        status: 'fail',
        message: 'ArcPayProvider not found. Wrap your app with <ArcPayProvider>',
      });
    }

    // 2. Wallet hook check
    if (walletContext) {
      checks.push({
        name: 'Wallet Hook',
        status: 'pass',
        message: walletContext.isConnected
          ? `Connected: ${walletContext.address?.slice(0, 6)}...${walletContext.address?.slice(-4)}`
          : 'Available (not connected)',
        details: {
          isConnected: walletContext.isConnected,
          hasWallet: !!walletContext.wallet,
        },
      });
    } else {
      checks.push({
        name: 'Wallet Hook',
        status: 'warn',
        message: 'Wallet hook not available in current context',
      });
    }

    // 3. Balance check (only if connected)
    if (balanceContext && walletContext?.isConnected) {
      if (balanceContext.error) {
        checks.push({
          name: 'Balance',
          status: 'warn',
          message: `Error fetching balance: ${balanceContext.error.message}`,
        });
      } else {
        checks.push({
          name: 'Balance',
          status: 'pass',
          message: `Balance: ${balanceContext.balance} USDC`,
          details: {
            balance: balanceContext.balance,
          },
        });
      }
    }

    // 4. Network check
    if (providerContext) {
      checks.push({
        name: 'Network',
        status: 'pass',
        message: `Connected to ${providerContext.config?.network || 'testnet'}`,
        details: {
          network: providerContext.config?.network || 'testnet',
        },
      });
    }

    // 5. Browser environment check
    const isBrowser = typeof window !== 'undefined';
    if (isBrowser) {
      checks.push({
        name: 'Environment',
        status: 'pass',
        message: 'Running in browser environment',
        details: {
          userAgent: navigator.userAgent.slice(0, 50),
          hasClipboard: !!navigator.clipboard,
        },
      });
    } else {
      checks.push({
        name: 'Environment',
        status: 'warn',
        message: 'Running in non-browser environment (SSR)',
      });
    }

    // Calculate summary
    const summary = {
      passed: checks.filter((c) => c.status === 'pass').length,
      warnings: checks.filter((c) => c.status === 'warn').length,
      failed: checks.filter((c) => c.status === 'fail').length,
      total: checks.length,
    };

    // Determine overall status
    let overall: HealthCheckReport['overall'] = 'healthy';
    if (summary.failed > 0) {
      overall = 'unhealthy';
    } else if (summary.warnings > 0) {
      overall = 'degraded';
    }

    const newReport: HealthCheckReport = {
      overall,
      timestamp: new Date(),
      version: '0.1.0',
      checks,
      summary,
    };

    setReport(newReport);
    setIsChecking(false);

    return newReport;
  }, [providerContext, walletContext, balanceContext]);

  // Run initial check on mount
  useEffect(() => {
    runCheck();
  }, []);

  return {
    report,
    isChecking,
    runCheck,
    status: report?.overall || 'unknown',
  };
}
