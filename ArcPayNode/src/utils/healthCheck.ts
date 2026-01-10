/**
 * Health Check Utilities for ArcPay SDK
 *
 * Provides diagnostic tools to verify SDK configuration
 * and API connectivity.
 */

import type { ArcPayConfig } from '../types';

/**
 * Health check result for a single check
 */
export interface CheckResult {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
  details?: Record<string, unknown>;
  duration?: number;
}

/**
 * Complete health check report
 */
export interface HealthCheckReport {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  version: string;
  environment: 'test' | 'live';
  checks: CheckResult[];
  summary: {
    passed: number;
    warnings: number;
    failed: number;
    total: number;
  };
}

/**
 * Options for health check
 */
export interface HealthCheckOptions {
  /** Timeout for API calls in ms (default: 5000) */
  timeout?: number;
  /** Whether to verify webhook endpoint */
  verifyWebhook?: boolean;
  /** Webhook secret for verification */
  webhookSecret?: string;
  /** Whether to include detailed diagnostics */
  verbose?: boolean;
}

/**
 * Run all health checks
 */
export async function runHealthCheck(
  config: ArcPayConfig,
  options: HealthCheckOptions = {}
): Promise<HealthCheckReport> {
  const {
    timeout = 5000,
    verifyWebhook = false,
    webhookSecret,
    verbose = false,
  } = options;

  const checks: CheckResult[] = [];
  const startTime = Date.now();

  // 1. Configuration check
  checks.push(checkConfiguration(config));

  // 2. API Key format check
  checks.push(checkApiKeyFormat(config.secretKey));

  // 3. API connectivity check
  checks.push(await checkApiConnectivity(config, timeout));

  // 4. Webhook check (if enabled)
  if (verifyWebhook && webhookSecret) {
    checks.push(checkWebhookSecret(webhookSecret));
  }

  // 5. Environment check
  checks.push(checkEnvironment(config.secretKey));

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

  return {
    overall,
    timestamp: new Date(),
    version: '0.1.0',
    environment: config.secretKey.startsWith('sk_test_') ? 'test' : 'live',
    checks: verbose ? checks : checks.filter((c) => c.status !== 'pass'),
    summary,
  };
}

/**
 * Check SDK configuration
 */
function checkConfiguration(config: ArcPayConfig): CheckResult {
  const issues: string[] = [];

  if (!config.secretKey) {
    issues.push('Secret key is missing');
  }

  if (config.baseUrl && !config.baseUrl.startsWith('https://')) {
    issues.push('Base URL should use HTTPS');
  }

  if (issues.length > 0) {
    return {
      name: 'Configuration',
      status: 'fail',
      message: issues.join('; '),
    };
  }

  return {
    name: 'Configuration',
    status: 'pass',
    message: 'Configuration is valid',
    details: {
      hasCustomBaseUrl: !!config.baseUrl,
      hasCustomTimeout: !!config.timeout,
    },
  };
}

/**
 * Check API key format
 */
function checkApiKeyFormat(secretKey: string): CheckResult {
  if (!secretKey.startsWith('sk_')) {
    return {
      name: 'API Key Format',
      status: 'fail',
      message: 'Secret key must start with "sk_"',
    };
  }

  const isTestKey = secretKey.startsWith('sk_test_');
  const isLiveKey = secretKey.startsWith('sk_live_');

  if (!isTestKey && !isLiveKey) {
    return {
      name: 'API Key Format',
      status: 'warn',
      message: 'Secret key format not recognized as test or live key',
    };
  }

  return {
    name: 'API Key Format',
    status: 'pass',
    message: `Valid ${isTestKey ? 'test' : 'live'} API key format`,
    details: {
      keyType: isTestKey ? 'test' : 'live',
      keyPrefix: secretKey.substring(0, 8) + '...',
    },
  };
}

/**
 * Check API connectivity
 */
async function checkApiConnectivity(
  config: ArcPayConfig,
  timeout: number
): Promise<CheckResult> {
  const startTime = Date.now();
  const baseUrl = config.baseUrl || 'https://api.arcpay.io/v1';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Try to fetch a simple endpoint that should always respond
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${config.secretKey}`,
        'User-Agent': `ArcPay-Node/0.1.0`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;

    if (response.ok) {
      return {
        name: 'API Connectivity',
        status: 'pass',
        message: 'Successfully connected to ArcPay API',
        duration,
        details: {
          statusCode: response.status,
          latency: `${duration}ms`,
        },
      };
    }

    if (response.status === 401) {
      return {
        name: 'API Connectivity',
        status: 'fail',
        message: 'Invalid API key - authentication failed',
        duration,
        details: {
          statusCode: response.status,
        },
      };
    }

    return {
      name: 'API Connectivity',
      status: 'warn',
      message: `API returned status ${response.status}`,
      duration,
      details: {
        statusCode: response.status,
      },
    };
  } catch (error) {
    const duration = Date.now() - startTime;

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          name: 'API Connectivity',
          status: 'fail',
          message: `Request timed out after ${timeout}ms`,
          duration,
        };
      }

      return {
        name: 'API Connectivity',
        status: 'fail',
        message: `Connection failed: ${error.message}`,
        duration,
      };
    }

    return {
      name: 'API Connectivity',
      status: 'fail',
      message: 'Unknown connection error',
      duration,
    };
  }
}

/**
 * Check webhook secret format
 */
function checkWebhookSecret(secret: string): CheckResult {
  if (!secret.startsWith('whsec_')) {
    return {
      name: 'Webhook Secret',
      status: 'fail',
      message: 'Webhook secret must start with "whsec_"',
    };
  }

  if (secret.length < 20) {
    return {
      name: 'Webhook Secret',
      status: 'warn',
      message: 'Webhook secret seems too short',
    };
  }

  return {
    name: 'Webhook Secret',
    status: 'pass',
    message: 'Webhook secret format is valid',
    details: {
      secretPrefix: secret.substring(0, 10) + '...',
    },
  };
}

/**
 * Check environment consistency
 */
function checkEnvironment(secretKey: string): CheckResult {
  const isTestKey = secretKey.startsWith('sk_test_');
  const nodeEnv = process.env.NODE_ENV;

  // Warn if using test keys in production
  if (!isTestKey && nodeEnv === 'development') {
    return {
      name: 'Environment',
      status: 'warn',
      message: 'Using live API key in development environment',
      details: {
        nodeEnv,
        keyType: 'live',
      },
    };
  }

  if (isTestKey && nodeEnv === 'production') {
    return {
      name: 'Environment',
      status: 'fail',
      message: 'Using test API key in production environment',
      details: {
        nodeEnv,
        keyType: 'test',
      },
    };
  }

  return {
    name: 'Environment',
    status: 'pass',
    message: `Environment configuration is consistent (${nodeEnv || 'default'})`,
    details: {
      nodeEnv: nodeEnv || 'not set',
      keyType: isTestKey ? 'test' : 'live',
    },
  };
}

/**
 * Format health check report for console output
 */
export function formatHealthReport(report: HealthCheckReport): string {
  const lines: string[] = [];

  // Header
  lines.push('╔════════════════════════════════════════════╗');
  lines.push('║         ArcPay SDK Health Check            ║');
  lines.push('╚════════════════════════════════════════════╝');
  lines.push('');

  // Overall status
  const statusEmoji = {
    healthy: '✅',
    degraded: '⚠️',
    unhealthy: '❌',
  };
  lines.push(
    `Status: ${statusEmoji[report.overall]} ${report.overall.toUpperCase()}`
  );
  lines.push(`Environment: ${report.environment}`);
  lines.push(`SDK Version: ${report.version}`);
  lines.push(`Timestamp: ${report.timestamp.toISOString()}`);
  lines.push('');

  // Summary
  lines.push('Summary:');
  lines.push(`  ✅ Passed: ${report.summary.passed}`);
  lines.push(`  ⚠️ Warnings: ${report.summary.warnings}`);
  lines.push(`  ❌ Failed: ${report.summary.failed}`);
  lines.push('');

  // Individual checks
  if (report.checks.length > 0) {
    lines.push('Checks:');
    for (const check of report.checks) {
      const icon = check.status === 'pass' ? '✅' : check.status === 'warn' ? '⚠️' : '❌';
      const duration = check.duration ? ` (${check.duration}ms)` : '';
      lines.push(`  ${icon} ${check.name}: ${check.message}${duration}`);
    }
  }

  return lines.join('\n');
}
