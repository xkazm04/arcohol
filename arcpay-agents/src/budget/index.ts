import type {
  AgentBudgetConfig,
  BudgetUsage,
  BudgetAlert,
  BudgetPeriod,
  AgentPaymentRequest,
  VendorBudget,
} from '../types';

/**
 * Budget controller for managing agent spending limits
 */
export class BudgetController {
  private config: AgentBudgetConfig;
  private spending: Map<BudgetPeriod, SpendingTracker> = new Map();
  private vendorSpending: Map<string, number> = new Map();
  private transactionHistory: TransactionRecord[] = [];
  private alertCallbacks: ((alert: BudgetAlert) => void)[] = [];

  constructor(config: AgentBudgetConfig) {
    this.config = config;
    this.initializeTrackers();
  }

  /**
   * Initialize spending trackers for each period
   */
  private initializeTrackers(): void {
    const periods: BudgetPeriod[] = ['hourly', 'daily', 'weekly', 'monthly'];
    for (const period of periods) {
      this.spending.set(period, new SpendingTracker(period));
    }
  }

  /**
   * Check if a payment is allowed within budget
   */
  checkPayment(request: AgentPaymentRequest): BudgetCheckResult {
    const alerts: BudgetAlert[] = [];

    // Check per-transaction limit
    if (this.config.perTransaction && request.amount > this.config.perTransaction) {
      return {
        allowed: false,
        reason: `Amount ${request.amount} exceeds per-transaction limit of ${this.config.perTransaction}`,
        requiresApproval: true,
        alerts: [{
          type: 'large_transaction',
          severity: 'warning',
          message: `Transaction of ${request.amount} exceeds limit`,
          metadata: { amount: request.amount, limit: this.config.perTransaction },
          timestamp: new Date(),
        }],
      };
    }

    // Check daily limit
    if (this.config.daily) {
      const dailyTracker = this.spending.get('daily')!;
      const projectedDaily = dailyTracker.getSpent() + request.amount;

      if (projectedDaily > this.config.daily) {
        return {
          allowed: false,
          reason: `Would exceed daily limit of ${this.config.daily}`,
          alerts: [{
            type: 'limit_reached',
            severity: 'critical',
            message: `Daily budget exhausted`,
            metadata: { spent: dailyTracker.getSpent(), limit: this.config.daily },
            timestamp: new Date(),
          }],
        };
      }

      // Warn at 80%
      if (projectedDaily > this.config.daily * 0.8) {
        alerts.push({
          type: 'threshold_warning',
          severity: 'warning',
          message: `Daily spending at ${((projectedDaily / this.config.daily) * 100).toFixed(0)}%`,
          metadata: { spent: projectedDaily, limit: this.config.daily },
          timestamp: new Date(),
        });
      }
    }

    // Check weekly limit
    if (this.config.weekly) {
      const weeklyTracker = this.spending.get('weekly')!;
      if (weeklyTracker.getSpent() + request.amount > this.config.weekly) {
        return {
          allowed: false,
          reason: `Would exceed weekly limit of ${this.config.weekly}`,
        };
      }
    }

    // Check vendor limits
    const vendor = this.extractVendor(request.recipient);
    if (this.config.vendors) {
      const vendorConfig = this.config.vendors[vendor];

      // Check if vendor is explicitly blocked
      if (vendorConfig?.allowed === false) {
        return {
          allowed: false,
          reason: `Vendor ${vendor} is not in allowlist`,
          alerts: [{
            type: 'vendor_blocked',
            severity: 'critical',
            message: `Payment to blocked vendor: ${vendor}`,
            metadata: { vendor },
            timestamp: new Date(),
          }],
        };
      }

      // Check vendor daily limit
      if (vendorConfig?.daily) {
        const vendorSpent = this.vendorSpending.get(vendor) || 0;
        if (vendorSpent + request.amount > vendorConfig.daily) {
          return {
            allowed: false,
            reason: `Would exceed daily limit for vendor ${vendor}`,
          };
        }
      }
    }

    // Check velocity (transactions per hour)
    if (this.config.maxTransactionsPerHour) {
      const hourlyCount = this.getTransactionsInLastHour();
      if (hourlyCount >= this.config.maxTransactionsPerHour) {
        alerts.push({
          type: 'velocity_warning',
          severity: 'warning',
          message: `Transaction velocity limit approaching`,
          metadata: { count: hourlyCount, limit: this.config.maxTransactionsPerHour },
          timestamp: new Date(),
        });
      }
    }

    // Run anomaly detection
    const anomaly = this.detectAnomaly(request);
    if (anomaly.detected && anomaly.recommendation === 'block') {
      return {
        allowed: false,
        reason: anomaly.description || 'Anomaly detected',
        requiresApproval: true,
        anomaly,
      };
    }

    // Emit any alerts
    for (const alert of alerts) {
      this.emitAlert(alert);
    }

    return {
      allowed: true,
      alerts,
      anomaly: anomaly.detected ? anomaly : undefined,
    };
  }

  /**
   * Record a completed transaction
   */
  recordTransaction(amount: number, recipient: string): void {
    // Update period trackers
    for (const tracker of this.spending.values()) {
      tracker.addSpending(amount);
    }

    // Update vendor spending
    const vendor = this.extractVendor(recipient);
    const current = this.vendorSpending.get(vendor) || 0;
    this.vendorSpending.set(vendor, current + amount);

    // Add to history
    this.transactionHistory.push({
      amount,
      recipient,
      vendor,
      timestamp: new Date(),
    });

    // Keep only last 1000 transactions
    if (this.transactionHistory.length > 1000) {
      this.transactionHistory = this.transactionHistory.slice(-1000);
    }
  }

  /**
   * Get current budget usage for a period
   */
  getUsage(period: BudgetPeriod): BudgetUsage {
    const tracker = this.spending.get(period)!;
    const limit = this.getLimitForPeriod(period);

    return {
      period,
      periodStart: tracker.getPeriodStart(),
      spent: tracker.getSpent(),
      limit,
      percentUsed: limit > 0 ? (tracker.getSpent() / limit) * 100 : 0,
      transactionCount: tracker.getTransactionCount(),
    };
  }

  /**
   * Get all usage summaries
   */
  getAllUsage(): Record<BudgetPeriod, BudgetUsage> {
    return {
      hourly: this.getUsage('hourly'),
      daily: this.getUsage('daily'),
      weekly: this.getUsage('weekly'),
      monthly: this.getUsage('monthly'),
    };
  }

  /**
   * Check if auto-refill should trigger
   */
  shouldAutoRefill(currentBalance: number): { should: boolean; amount: number } {
    if (!this.config.autoRefill?.enabled) {
      return { should: false, amount: 0 };
    }

    if (currentBalance < this.config.autoRefill.threshold) {
      return {
        should: true,
        amount: this.config.autoRefill.amount,
      };
    }

    return { should: false, amount: 0 };
  }

  /**
   * Subscribe to budget alerts
   */
  onAlert(callback: (alert: BudgetAlert) => void): () => void {
    this.alertCallbacks.push(callback);
    return () => {
      const index = this.alertCallbacks.indexOf(callback);
      if (index >= 0) this.alertCallbacks.splice(index, 1);
    };
  }

  /**
   * Update budget configuration
   */
  updateConfig(config: Partial<AgentBudgetConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // ==========================================================================
  // Private Methods
  // ==========================================================================

  private getLimitForPeriod(period: BudgetPeriod): number {
    switch (period) {
      case 'hourly':
        return (this.config.daily || 0) / 24;
      case 'daily':
        return this.config.daily || 0;
      case 'weekly':
        return this.config.weekly || 0;
      case 'monthly':
        return this.config.monthly || 0;
    }
  }

  private extractVendor(recipient: string): string {
    // For addresses, use first 10 chars
    if (recipient.startsWith('0x')) {
      return recipient.slice(0, 10).toLowerCase();
    }
    // For domains, use full domain
    try {
      return new URL(recipient).hostname;
    } catch {
      return recipient;
    }
  }

  private getTransactionsInLastHour(): number {
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return this.transactionHistory.filter((t) => t.timestamp > hourAgo).length;
  }

  private detectAnomaly(request: AgentPaymentRequest): AnomalyResult {
    // Simple anomaly detection based on historical patterns
    if (this.transactionHistory.length < 10) {
      // Not enough history
      return { detected: false, confidence: 0 };
    }

    const recentAmounts = this.transactionHistory.slice(-50).map((t) => t.amount);
    const avgAmount = recentAmounts.reduce((a, b) => a + b, 0) / recentAmounts.length;
    const stdDev = Math.sqrt(
      recentAmounts.reduce((sum, a) => sum + Math.pow(a - avgAmount, 2), 0) / recentAmounts.length
    );

    // Flag if amount is more than 3 standard deviations from mean
    if (request.amount > avgAmount + 3 * stdDev) {
      return {
        detected: true,
        confidence: 0.8,
        type: 'unusual_amount',
        description: `Amount ${request.amount} is unusually large (avg: ${avgAmount.toFixed(2)})`,
        recommendation: 'require_approval',
      };
    }

    return { detected: false, confidence: 0 };
  }

  private emitAlert(alert: BudgetAlert): void {
    for (const callback of this.alertCallbacks) {
      try {
        callback(alert);
      } catch (error) {
        console.error('[BudgetController] Alert callback error:', error);
      }
    }
  }
}

/**
 * Tracks spending for a specific time period
 */
class SpendingTracker {
  private period: BudgetPeriod;
  private periodStart: Date;
  private spent: number = 0;
  private transactionCount: number = 0;

  constructor(period: BudgetPeriod) {
    this.period = period;
    this.periodStart = this.calculatePeriodStart();
  }

  addSpending(amount: number): void {
    this.checkReset();
    this.spent += amount;
    this.transactionCount++;
  }

  getSpent(): number {
    this.checkReset();
    return this.spent;
  }

  getTransactionCount(): number {
    this.checkReset();
    return this.transactionCount;
  }

  getPeriodStart(): Date {
    this.checkReset();
    return this.periodStart;
  }

  private checkReset(): void {
    const currentPeriodStart = this.calculatePeriodStart();
    if (currentPeriodStart.getTime() !== this.periodStart.getTime()) {
      this.periodStart = currentPeriodStart;
      this.spent = 0;
      this.transactionCount = 0;
    }
  }

  private calculatePeriodStart(): Date {
    const now = new Date();
    switch (this.period) {
      case 'hourly':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
      case 'daily':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case 'weekly': {
        const dayOfWeek = now.getDay();
        const start = new Date(now);
        start.setDate(now.getDate() - dayOfWeek);
        start.setHours(0, 0, 0, 0);
        return start;
      }
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
  }
}

// =============================================================================
// Types
// =============================================================================

interface BudgetCheckResult {
  allowed: boolean;
  reason?: string;
  requiresApproval?: boolean;
  alerts?: BudgetAlert[];
  anomaly?: AnomalyResult;
}

interface AnomalyResult {
  detected: boolean;
  confidence: number;
  type?: string;
  description?: string;
  recommendation?: 'allow' | 'require_approval' | 'block';
}

interface TransactionRecord {
  amount: number;
  recipient: string;
  vendor: string;
  timestamp: Date;
}

export { BudgetController };
export type { BudgetCheckResult, AnomalyResult };
