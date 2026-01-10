/**
 * Testing Utilities
 * Mock server, fixtures, and test helpers for the B2B SDK
 */

import type {
  CreditAccount,
  Deposit,
  BalanceSnapshot,
  UsageRecord,
  UsageSummary,
  Dispute,
  Invoice,
  BatchPayment,
  TreasuryAccount,
  TreasuryOverview,
  TreasuryTransaction,
  WebhookEvent,
  WebhookEventType,
  Money,
  PaginatedList,
} from '../types';

// ==========================================================================
// Fixtures - Factory Functions
// ==========================================================================

/**
 * Create a mock Money object
 */
export function createMoney(amount: number, currency: 'USDC' | 'USDY' | 'USD' = 'USDC'): Money {
  return {
    amount: amount.toFixed(2),
    currency,
  };
}

/**
 * Create a mock credit account
 */
export function createCreditAccount(overrides?: Partial<CreditAccount>): CreditAccount {
  const id = `acc_test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return {
    id,
    organizationId: 'org_test_123',
    name: 'Test Account',
    availableBalance: createMoney(1000),
    yieldBalance: createMoney(0, 'USDY'),
    yieldEarned: createMoney(0, 'USDY'),
    pendingBalance: createMoney(0),
    status: 'active',
    settings: {
      lowBalanceAlert: 100,
      yieldEnabled: false,
      yieldThreshold: 5000,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Create a mock deposit
 */
export function createDeposit(overrides?: Partial<Deposit>): Deposit {
  const id = `dep_test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return {
    id,
    accountId: 'acc_test_123',
    amount: createMoney(500),
    method: 'usdc_transfer',
    status: 'completed',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Create a mock balance snapshot
 */
export function createBalanceSnapshot(overrides?: Partial<BalanceSnapshot>): BalanceSnapshot {
  return {
    available: createMoney(1000),
    inYield: createMoney(0, 'USDY'),
    yieldEarned: createMoney(0, 'USDY'),
    pending: createMoney(0),
    total: createMoney(1000),
    asOf: new Date(),
    ...overrides,
  };
}

/**
 * Create a mock usage record
 */
export function createUsageRecord(overrides?: Partial<UsageRecord>): UsageRecord {
  const id = `usg_test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return {
    id,
    accountId: 'acc_test_123',
    meter: 'api_call',
    count: 1,
    cost: createMoney(0.01),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Create a mock usage summary
 */
export function createUsageSummary(overrides?: Partial<UsageSummary>): UsageSummary {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    accountId: 'acc_test_123',
    period: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
    periodStart,
    periodEnd,
    items: [
      {
        meter: 'api_call',
        count: 100,
        cost: createMoney(1.00),
        rate: { pricePerUnit: 0.01, currency: 'USDC', unitName: 'call' },
      },
    ],
    total: createMoney(1.00),
    deductedFromCredits: createMoney(1.00),
    ...overrides,
  };
}

/**
 * Create a mock dispute
 */
export function createDispute(overrides?: Partial<Dispute>): Dispute {
  const id = `dsp_test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date();
  return {
    id,
    transactionId: 'txn_test_123',
    buyerId: 'acc_test_buyer',
    merchantId: 'acc_test_merchant',
    amount: createMoney(100),
    category: 'not_received',
    status: 'filed',
    claim: 'Product was never delivered',
    buyerEvidence: [],
    desiredResolution: 'full_refund',
    merchantResponseDeadline: new Date(now.getTime() + 48 * 60 * 60 * 1000),
    estimatedResolution: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Create a mock invoice
 */
export function createInvoice(overrides?: Partial<Invoice>): Invoice {
  const id = `inv_test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return {
    id,
    merchantId: 'merch_test_123',
    reference: 'INV-001',
    amount: createMoney(1000),
    fee: createMoney(1),
    netAmount: createMoney(999),
    status: 'sent',
    paymentStatus: 'pending',
    settlementStatus: 'pending',
    buyer: {
      email: 'buyer@example.com',
      company: 'Acme Corp',
    },
    lineItems: [
      {
        description: 'Annual License',
        quantity: 1,
        unitPrice: createMoney(1000),
        total: createMoney(1000),
      },
    ],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    paymentUrl: `https://pay.arcpay.io/${id}`,
    qrCode: 'data:image/png;base64,test',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Create a mock batch payment
 */
export function createBatchPayment(overrides?: Partial<BatchPayment>): BatchPayment {
  const id = `batch_test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return {
    id,
    merchantId: 'merch_test_123',
    reference: 'BATCH-001',
    payments: [
      {
        recipient: '0x1234567890123456789012345678901234567890',
        amount: createMoney(500),
        memo: 'Payment 1',
        status: 'completed',
      },
    ],
    totalAmount: createMoney(500),
    totalFee: createMoney(0.25),
    status: 'completed',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Create a mock treasury account
 */
export function createTreasuryAccount(overrides?: Partial<TreasuryAccount>): TreasuryAccount {
  const id = `tres_test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return {
    id,
    organizationId: 'org_test_123',
    name: 'Main Treasury',
    operating: {
      balance: createMoney(50000),
      currency: 'USDC',
      earnedYTD: createMoney(0),
      available: createMoney(50000),
      pending: createMoney(0),
    },
    reserve: {
      balance: createMoney(100000, 'USDY'),
      currency: 'USDY',
      apy: 5.0,
      earnedYTD: createMoney(2500, 'USDY'),
      available: createMoney(100000, 'USDY'),
      pending: createMoney(0, 'USDY'),
    },
    totalBalance: createMoney(150000),
    projectedAnnualYield: createMoney(5000),
    strategy: {
      operating: { target: 50000, minimum: 25000, currency: 'USDC' },
      reserve: { enabled: true, targetPercentage: 60 },
      autoRebalance: true,
    },
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Create a mock treasury overview
 */
export function createTreasuryOverview(overrides?: Partial<TreasuryOverview>): TreasuryOverview {
  return {
    treasuryId: 'tres_test_123',
    operating: {
      balance: createMoney(50000),
      currency: 'USDC',
      earnedYTD: createMoney(0),
    },
    reserve: {
      balance: createMoney(100000, 'USDY'),
      currency: 'USDY',
      apy: 5.0,
      earnedYTD: createMoney(2500, 'USDY'),
    },
    total: createMoney(150000),
    projectedAnnualYield: createMoney(5000),
    earnedYTD: createMoney(2500),
    asOf: new Date(),
    ...overrides,
  };
}

/**
 * Create a mock treasury transaction
 */
export function createTreasuryTransaction(
  overrides?: Partial<TreasuryTransaction>
): TreasuryTransaction {
  const id = `ttx_test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return {
    id,
    treasuryId: 'tres_test_123',
    type: 'payment',
    amount: createMoney(5000),
    source: 'operating',
    status: 'completed',
    txHash: '0x' + '1'.repeat(64),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Create a mock webhook event
 */
export function createWebhookEvent<T = Record<string, unknown>>(
  type: WebhookEventType,
  data: T,
  overrides?: Partial<WebhookEvent<T>>
): WebhookEvent<T> {
  const id = `evt_test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return {
    id,
    type,
    apiVersion: '2024-01-01',
    createdAt: new Date(),
    data,
    ...overrides,
  };
}

/**
 * Create a mock paginated list
 */
export function createPaginatedList<T>(
  data: T[],
  overrides?: Partial<PaginatedList<T>>
): PaginatedList<T> {
  return {
    data,
    hasMore: false,
    totalCount: data.length,
    ...overrides,
  };
}

// ==========================================================================
// Mock Server
// ==========================================================================

type MockBehavior<T> = {
  returns?: T;
  throws?: Error;
  delays?: number;
  sequence?: T[];
  sequenceIndex?: number;
};

type CallRecord = {
  method: string;
  args: unknown[];
  timestamp: Date;
};

/**
 * Mock ArcPay B2B Server for testing
 *
 * @example
 * ```typescript
 * import { MockArcPayB2BServer } from '@arcpay/b2b/testing';
 *
 * const mock = new MockArcPayB2BServer();
 *
 * // Configure mock behavior
 * mock.credits.getBalance.returns(createBalanceSnapshot({ available: createMoney(500) }));
 *
 * // Use in tests
 * const balance = await mock.credits.getBalance('acc_123');
 * expect(balance.available.amount).toBe('500.00');
 *
 * // Check calls
 * expect(mock.credits.getBalance.getCalls()).toHaveLength(1);
 * ```
 */
export class MockArcPayB2BServer {
  private behaviors: Map<string, MockBehavior<unknown>> = new Map();
  private calls: CallRecord[] = [];

  /**
   * Credits resource mock
   */
  readonly credits = {
    createAccount: this.createMockMethod('credits.createAccount', createCreditAccount),
    getAccount: this.createMockMethod('credits.getAccount', createCreditAccount),
    updateAccount: this.createMockMethod('credits.updateAccount', createCreditAccount),
    listAccounts: this.createMockMethod('credits.listAccounts', () =>
      createPaginatedList([createCreditAccount()])
    ),
    getBalance: this.createMockMethod('credits.getBalance', createBalanceSnapshot),
    deposit: this.createMockMethod('credits.deposit', createDeposit),
    listDeposits: this.createMockMethod('credits.listDeposits', () =>
      createPaginatedList([createDeposit()])
    ),
    recordUsage: this.createMockMethod('credits.recordUsage', createUsageRecord),
    getUsageSummary: this.createMockMethod('credits.getUsageSummary', createUsageSummary),
    listUsage: this.createMockMethod('credits.listUsage', () =>
      createPaginatedList([createUsageRecord()])
    ),
  };

  /**
   * Disputes resource mock
   */
  readonly disputes = {
    create: this.createMockMethod('disputes.create', createDispute),
    get: this.createMockMethod('disputes.get', createDispute),
    list: this.createMockMethod('disputes.list', () =>
      createPaginatedList([createDispute()])
    ),
    respond: this.createMockMethod('disputes.respond', createDispute),
    escalate: this.createMockMethod('disputes.escalate', createDispute),
  };

  /**
   * Gateway resource mock
   */
  readonly gateway = {
    createInvoice: this.createMockMethod('gateway.createInvoice', createInvoice),
    getInvoice: this.createMockMethod('gateway.getInvoice', createInvoice),
    listInvoices: this.createMockMethod('gateway.listInvoices', () =>
      createPaginatedList([createInvoice()])
    ),
    sendInvoice: this.createMockMethod('gateway.sendInvoice', createInvoice),
    cancelInvoice: this.createMockMethod('gateway.cancelInvoice', createInvoice),
    createBatch: this.createMockMethod('gateway.createBatch', createBatchPayment),
    getBatch: this.createMockMethod('gateway.getBatch', createBatchPayment),
    listBatches: this.createMockMethod('gateway.listBatches', () =>
      createPaginatedList([createBatchPayment()])
    ),
  };

  /**
   * Treasury resource mock
   */
  readonly treasury = {
    create: this.createMockMethod('treasury.create', createTreasuryAccount),
    get: this.createMockMethod('treasury.get', createTreasuryAccount),
    update: this.createMockMethod('treasury.update', createTreasuryAccount),
    list: this.createMockMethod('treasury.list', () =>
      createPaginatedList([createTreasuryAccount()])
    ),
    getOverview: this.createMockMethod('treasury.getOverview', createTreasuryOverview),
    pay: this.createMockMethod('treasury.pay', () => ({
      transactionId: 'ttx_test_123',
      amount: createMoney(5000),
      sources: [],
      recipient: { address: '0x123', chain: 'arc' as const },
      txHash: '0x' + '1'.repeat(64),
      status: 'completed' as const,
    })),
    listTransactions: this.createMockMethod('treasury.listTransactions', () =>
      createPaginatedList([createTreasuryTransaction()])
    ),
  };

  private createMockMethod<T>(
    name: string,
    defaultFactory: () => T
  ) {
    const self = this;

    const method = async (...args: unknown[]): Promise<T> => {
      // Record call
      self.calls.push({
        method: name,
        args,
        timestamp: new Date(),
      });

      // Get behavior
      const behavior = self.behaviors.get(name) as MockBehavior<T> | undefined;

      // Handle delay
      if (behavior?.delays) {
        await new Promise((resolve) => setTimeout(resolve, behavior.delays));
      }

      // Handle throws
      if (behavior?.throws) {
        throw behavior.throws;
      }

      // Handle sequence
      if (behavior?.sequence) {
        const index = behavior.sequenceIndex ?? 0;
        behavior.sequenceIndex = (index + 1) % behavior.sequence.length;
        return behavior.sequence[index];
      }

      // Handle returns
      if (behavior?.returns !== undefined) {
        return behavior.returns;
      }

      // Default behavior
      return defaultFactory();
    };

    // Add configuration methods
    return Object.assign(method, {
      returns: (value: T) => {
        self.behaviors.set(name, { returns: value });
        return method;
      },
      throws: (error: Error) => {
        self.behaviors.set(name, { throws: error });
        return method;
      },
      delays: (ms: number) => {
        const existing = self.behaviors.get(name) || {};
        self.behaviors.set(name, { ...existing, delays: ms });
        return method;
      },
      sequence: (values: T[]) => {
        self.behaviors.set(name, { sequence: values, sequenceIndex: 0 });
        return method;
      },
      reset: () => {
        self.behaviors.delete(name);
        return method;
      },
      getCalls: () => self.calls.filter((c) => c.method === name),
    });
  }

  /**
   * Get all recorded calls
   */
  getCalls(): CallRecord[] {
    return [...this.calls];
  }

  /**
   * Reset all mock behaviors and calls
   */
  reset(): void {
    this.behaviors.clear();
    this.calls = [];
  }
}

// ==========================================================================
// Test Scenarios
// ==========================================================================

/**
 * Pre-built test scenarios
 */
export const scenarios = {
  /**
   * Simulate a successful payment flow
   */
  successfulPayment: (mock: MockArcPayB2BServer) => {
    const invoice = createInvoice({ status: 'paid', paymentStatus: 'completed' });
    mock.gateway.createInvoice.returns(invoice);
    mock.gateway.getInvoice.returns(invoice);
    return invoice;
  },

  /**
   * Simulate insufficient credits
   */
  insufficientCredits: (mock: MockArcPayB2BServer, available: number) => {
    mock.credits.getBalance.returns(
      createBalanceSnapshot({ available: createMoney(available) })
    );
  },

  /**
   * Simulate a dispute flow
   */
  disputeFlow: (mock: MockArcPayB2BServer) => {
    const dispute = createDispute();
    mock.disputes.create.returns(dispute);
    mock.disputes.get.sequence([
      { ...dispute, status: 'filed' },
      { ...dispute, status: 'under_review' },
      { ...dispute, status: 'resolved', resolution: { outcome: 'buyer_wins', resolvedBy: 'ai', resolvedAt: new Date(), reason: 'Merchant did not respond' } },
    ] as Dispute[]);
    return dispute;
  },
};

// ==========================================================================
// Exports
// ==========================================================================

export {
  generateTestSignature,
  generateTestEvent,
} from '../resources/webhooks';
