import type {
  AgentWallet,
  AgentWalletConfig,
  AgentWalletCallbacks,
  AgentPaymentRequest,
  AgentPayment,
  AgentReceipt,
  AgentEarnings,
  AgentSpending,
  AgentActivityLog,
  ApprovalRequest,
  BudgetAlert,
  Money,
  AgentChain,
  AgentCurrency,
} from '../types';
import { BudgetController } from '../budget';

/**
 * Agent Wallet - Autonomous wallet for AI agents with budget controls
 *
 * @example
 * ```typescript
 * import { AgentWalletManager } from '@arcpay/agents';
 *
 * const wallet = await AgentWalletManager.create({
 *   name: 'research-agent-01',
 *   organizationId: 'org_xxx',
 *   budget: {
 *     daily: 500,
 *     perTransaction: 50,
 *     vendors: {
 *       'api.openai.com': { daily: 200 },
 *     },
 *   },
 * });
 *
 * // Make a payment
 * await wallet.pay({
 *   recipient: '0x...',
 *   amount: 10,
 *   memo: 'API call payment',
 * });
 * ```
 */
export class AgentWalletManager {
  private wallet: AgentWallet;
  private budgetController: BudgetController;
  private callbacks: AgentWalletCallbacks;
  private payments: AgentPayment[] = [];
  private receipts: AgentReceipt[] = [];
  private activityLog: AgentActivityLog[] = [];
  private pendingApprovals: Map<string, ApprovalRequest> = new Map();

  // Private key / signer (would be securely stored in production)
  private signer: WalletSigner | null = null;

  private constructor(
    wallet: AgentWallet,
    budgetController: BudgetController,
    callbacks: AgentWalletCallbacks = {}
  ) {
    this.wallet = wallet;
    this.budgetController = budgetController;
    this.callbacks = callbacks;

    // Subscribe to budget alerts
    this.budgetController.onAlert((alert) => {
      this.callbacks.onBudgetAlert?.(alert);
      this.logActivity('budget_alert', alert.message, undefined, { alert });
    });
  }

  /**
   * Create a new agent wallet
   */
  static async create(config: AgentWalletConfig): Promise<AgentWalletManager> {
    // Generate wallet address (in production, use proper key derivation)
    const address = generateWalletAddress();

    const wallet: AgentWallet = {
      id: `wallet_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: config.name,
      address,
      chain: config.preferredChain || 'base',
      organizationId: config.organizationId,
      status: 'active',
      balance: { amount: '0.00', currency: 'USDC' },
      budget: config.budget,
      createdAt: new Date(),
    };

    const budgetController = new BudgetController(config.budget);

    return new AgentWalletManager(wallet, budgetController);
  }

  /**
   * Load existing wallet by ID
   */
  static async load(walletId: string): Promise<AgentWalletManager> {
    // In production, load from database/API
    throw new Error('Not implemented - load from persistence layer');
  }

  // ===========================================================================
  // Wallet Properties
  // ===========================================================================

  get id(): string {
    return this.wallet.id;
  }

  get address(): string {
    return this.wallet.address;
  }

  get chain(): AgentChain {
    return this.wallet.chain;
  }

  get status(): AgentWallet['status'] {
    return this.wallet.status;
  }

  get balance(): Money {
    return this.wallet.balance;
  }

  // ===========================================================================
  // Payment Operations
  // ===========================================================================

  /**
   * Make a payment from the agent wallet
   */
  async pay(request: AgentPaymentRequest): Promise<AgentPayment> {
    // Check wallet status
    if (this.wallet.status !== 'active') {
      throw new WalletError(`Wallet is ${this.wallet.status}`);
    }

    // Check if payment operation is allowed
    const allowedOps = this.wallet.budget.autoRefill ? ['pay', 'receive'] : ['pay'];
    if (!allowedOps.includes('pay')) {
      throw new WalletError('Payment operations are not allowed for this wallet');
    }

    // Check budget
    const budgetCheck = this.budgetController.checkPayment(request);

    if (!budgetCheck.allowed) {
      if (budgetCheck.requiresApproval) {
        // Create approval request
        const approvalRequest = await this.createApprovalRequest(request, 'amount_threshold');
        throw new ApprovalRequiredError(approvalRequest);
      }
      throw new BudgetExceededError(budgetCheck.reason || 'Budget exceeded');
    }

    // Check if amount requires approval
    if (
      !request.requireApproval &&
      this.wallet.budget.autoRefill?.threshold &&
      request.amount > this.wallet.budget.autoRefill.threshold
    ) {
      const approvalRequest = await this.createApprovalRequest(request, 'amount_threshold');
      throw new ApprovalRequiredError(approvalRequest);
    }

    // Check balance
    const currentBalance = parseFloat(this.wallet.balance.amount);
    if (request.amount > currentBalance) {
      // Check auto-refill
      const refillCheck = this.budgetController.shouldAutoRefill(currentBalance);
      if (refillCheck.should) {
        await this.autoRefill(refillCheck.amount);
      } else {
        throw new InsufficientBalanceError(
          `Insufficient balance: ${currentBalance} < ${request.amount}`
        );
      }
    }

    // Execute payment
    const payment = await this.executePayment(request);

    // Record in budget
    this.budgetController.recordTransaction(request.amount, request.recipient);

    // Update balance
    this.wallet.balance = {
      amount: (parseFloat(this.wallet.balance.amount) - request.amount).toFixed(2),
      currency: this.wallet.balance.currency,
    };

    // Store payment
    this.payments.push(payment);

    // Log activity
    this.logActivity('payment', `Paid ${request.amount} to ${request.recipient}`, {
      amount: request.amount.toString(),
      currency: request.currency || 'USDC',
    });

    // Callback
    await this.callbacks.onPayment?.(payment);

    return payment;
  }

  /**
   * Execute the actual payment (would use blockchain in production)
   */
  private async executePayment(request: AgentPaymentRequest): Promise<AgentPayment> {
    // Simulate blockchain transaction
    await delay(500);

    const payment: AgentPayment = {
      id: `pmt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      walletId: this.wallet.id,
      recipient: request.recipient,
      amount: {
        amount: request.amount.toString(),
        currency: request.currency || 'USDC',
      },
      fee: {
        amount: (request.amount * 0.001).toFixed(4), // 0.1% fee
        currency: request.currency || 'USDC',
      },
      txHash: `0x${randomHex(64)}`,
      chain: request.recipientChain || this.wallet.chain,
      memo: request.memo,
      status: 'confirmed',
      timestamp: new Date(),
      metadata: request.metadata,
    };

    return payment;
  }

  // ===========================================================================
  // Receiving Payments
  // ===========================================================================

  /**
   * Process incoming payment (called by webhook handler)
   */
  async processReceipt(receipt: Omit<AgentReceipt, 'id' | 'walletId'>): Promise<AgentReceipt> {
    const fullReceipt: AgentReceipt = {
      id: `rcp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      walletId: this.wallet.id,
      ...receipt,
    };

    // Update balance
    this.wallet.balance = {
      amount: (
        parseFloat(this.wallet.balance.amount) + parseFloat(receipt.amount.amount)
      ).toFixed(2),
      currency: this.wallet.balance.currency,
    };

    // Store receipt
    this.receipts.push(fullReceipt);

    // Log activity
    this.logActivity('receipt', `Received ${receipt.amount.amount} from ${receipt.from}`, receipt.amount);

    // Callback
    await this.callbacks.onReceipt?.(fullReceipt);

    return fullReceipt;
  }

  // ===========================================================================
  // Earnings & Spending
  // ===========================================================================

  /**
   * Get earnings summary
   */
  getEarnings(period: AgentEarnings['period'] = 'this_month'): AgentEarnings {
    const filtered = this.filterByPeriod(this.receipts, period);
    const total = filtered.reduce((sum, r) => sum + parseFloat(r.amount.amount), 0);

    return {
      period,
      total: { amount: total.toFixed(2), currency: 'USDC' },
      receiptCount: filtered.length,
      receipts: filtered,
    };
  }

  /**
   * Get spending summary
   */
  getSpending(period: AgentSpending['period'] = 'this_month'): AgentSpending {
    const filtered = this.filterByPeriod(this.payments, period);
    const total = filtered.reduce((sum, p) => sum + parseFloat(p.amount.amount), 0);

    // Group by vendor (recipient)
    const byVendor: Record<string, Money> = {};
    for (const payment of filtered) {
      const vendor = payment.recipient.slice(0, 10);
      const current = parseFloat(byVendor[vendor]?.amount || '0');
      byVendor[vendor] = {
        amount: (current + parseFloat(payment.amount.amount)).toFixed(2),
        currency: 'USDC',
      };
    }

    return {
      period,
      total: { amount: total.toFixed(2), currency: 'USDC' },
      paymentCount: filtered.length,
      byVendor,
      payments: filtered,
    };
  }

  /**
   * Get budget usage
   */
  getBudgetUsage() {
    return this.budgetController.getAllUsage();
  }

  // ===========================================================================
  // Withdrawal
  // ===========================================================================

  /**
   * Withdraw funds to organization treasury
   */
  async withdraw(params: {
    amount: number;
    to: string;
    requireApproval?: boolean;
  }): Promise<AgentPayment> {
    // Withdrawals typically require approval
    if (params.requireApproval !== false) {
      const approvalRequest = await this.createApprovalRequest(
        {
          recipient: params.to,
          amount: params.amount,
          memo: 'Withdrawal to treasury',
        },
        'manual_request'
      );
      throw new ApprovalRequiredError(approvalRequest);
    }

    return this.pay({
      recipient: params.to,
      amount: params.amount,
      memo: 'Withdrawal to treasury',
      requireApproval: false,
    });
  }

  // ===========================================================================
  // Approval Flow
  // ===========================================================================

  /**
   * Create an approval request
   */
  private async createApprovalRequest(
    payment: AgentPaymentRequest,
    reason: ApprovalRequest['reason']
  ): Promise<ApprovalRequest> {
    const request: ApprovalRequest = {
      id: `apr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      walletId: this.wallet.id,
      payment,
      reason,
      status: 'pending',
      requestedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    this.pendingApprovals.set(request.id, request);

    // Callback
    await this.callbacks.onApprovalRequired?.(request);

    return request;
  }

  /**
   * Approve a pending payment
   */
  async approvePayment(approvalId: string, approvedBy: string): Promise<AgentPayment> {
    const approval = this.pendingApprovals.get(approvalId);
    if (!approval) {
      throw new WalletError('Approval request not found');
    }

    if (approval.status !== 'pending') {
      throw new WalletError(`Approval is ${approval.status}`);
    }

    if (new Date() > approval.expiresAt) {
      approval.status = 'expired';
      throw new WalletError('Approval request expired');
    }

    // Update approval
    approval.status = 'approved';
    approval.approvedBy = approvedBy;
    approval.resolvedAt = new Date();

    // Execute the payment
    const payment = await this.pay({
      ...approval.payment,
      requireApproval: false, // Already approved
    });

    this.pendingApprovals.delete(approvalId);

    return payment;
  }

  /**
   * Reject a pending payment
   */
  rejectPayment(approvalId: string, rejectedBy: string): void {
    const approval = this.pendingApprovals.get(approvalId);
    if (!approval) {
      throw new WalletError('Approval request not found');
    }

    approval.status = 'rejected';
    approval.approvedBy = rejectedBy;
    approval.resolvedAt = new Date();

    this.pendingApprovals.delete(approvalId);
  }

  /**
   * Get pending approvals
   */
  getPendingApprovals(): ApprovalRequest[] {
    return Array.from(this.pendingApprovals.values()).filter(
      (a) => a.status === 'pending'
    );
  }

  // ===========================================================================
  // Auto-refill
  // ===========================================================================

  /**
   * Trigger auto-refill from treasury
   */
  private async autoRefill(amount: number): Promise<void> {
    const config = this.wallet.budget.autoRefill;
    if (!config) return;

    // Simulate refill (in production, pull from treasury)
    await delay(300);

    this.wallet.balance = {
      amount: (parseFloat(this.wallet.balance.amount) + amount).toFixed(2),
      currency: this.wallet.balance.currency,
    };

    // Log activity
    this.logActivity('refill', `Auto-refilled ${amount} from ${config.source}`, {
      amount: amount.toString(),
      currency: 'USDC',
    });

    // Callback
    await this.callbacks.onRefill?.(amount, config.source);
  }

  // ===========================================================================
  // Activity Log
  // ===========================================================================

  private logActivity(
    type: AgentActivityLog['type'],
    description: string,
    amount?: Money,
    metadata?: Record<string, unknown>
  ): void {
    const entry: AgentActivityLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      walletId: this.wallet.id,
      type,
      description,
      amount,
      metadata,
      timestamp: new Date(),
    };

    this.activityLog.push(entry);

    // Keep only last 1000 entries
    if (this.activityLog.length > 1000) {
      this.activityLog = this.activityLog.slice(-1000);
    }
  }

  /**
   * Get activity log
   */
  getActivityLog(limit: number = 100): AgentActivityLog[] {
    return this.activityLog.slice(-limit);
  }

  // ===========================================================================
  // Callbacks
  // ===========================================================================

  /**
   * Set callbacks
   */
  setCallbacks(callbacks: AgentWalletCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // ===========================================================================
  // Helpers
  // ===========================================================================

  private filterByPeriod<T extends { timestamp: Date }>(
    items: T[],
    period: 'today' | 'this_week' | 'this_month' | 'all_time'
  ): T[] {
    if (period === 'all_time') return items;

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'this_week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    return items.filter((item) => item.timestamp >= startDate);
  }
}

// =============================================================================
// Errors
// =============================================================================

export class WalletError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WalletError';
  }
}

export class BudgetExceededError extends WalletError {
  constructor(message: string) {
    super(message);
    this.name = 'BudgetExceededError';
  }
}

export class InsufficientBalanceError extends WalletError {
  constructor(message: string) {
    super(message);
    this.name = 'InsufficientBalanceError';
  }
}

export class ApprovalRequiredError extends WalletError {
  public request: ApprovalRequest;

  constructor(request: ApprovalRequest) {
    super(`Approval required: ${request.reason}`);
    this.name = 'ApprovalRequiredError';
    this.request = request;
  }
}

// =============================================================================
// Helpers
// =============================================================================

interface WalletSigner {
  signMessage: (message: string) => Promise<string>;
  signTransaction: (tx: unknown) => Promise<string>;
}

function generateWalletAddress(): string {
  return `0x${randomHex(40)}`;
}

function randomHex(length: number): string {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export { AgentWalletManager };
