'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// ==========================================================================
// Types
// ==========================================================================

interface Money {
  amount: string;
  currency: 'USDC' | 'USDY' | 'USD';
}

interface CreditAccount {
  id: string;
  name: string;
  organizationId: string;
  availableBalance: Money;
  yieldBalance: Money;
  yieldEarned: Money;
  status: 'active' | 'low_balance' | 'depleted';
}

interface UsageRecord {
  id: string;
  meter: string;
  count: number;
  cost: Money;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

interface UsageSummary {
  period: string;
  items: Array<{ meter: string; count: number; cost: Money }>;
  total: Money;
}

interface Invoice {
  id: string;
  reference: string;
  amount: Money;
  fee: Money;
  netAmount: Money;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'canceled';
  buyer: { company: string; email: string };
  paymentUrl: string;
  dueDate: Date;
  createdAt: Date;
}

interface Dispute {
  id: string;
  transactionId: string;
  amount: Money;
  category: 'not_received' | 'not_as_described' | 'duplicate_charge' | 'quality_issue';
  status: 'filed' | 'under_review' | 'resolved';
  claim: string;
  aiEvaluation?: {
    recommendation: 'approve' | 'deny' | 'escalate';
    confidence: number;
    reasoning: string;
  };
  createdAt: Date;
}

interface TreasuryOverview {
  operating: { balance: Money; currency: 'USDC' };
  reserve: { balance: Money; apy: number; earnedYTD: Money };
  total: Money;
  projectedAnnualYield: Money;
}

interface MockB2BContextValue {
  // Credit Account
  creditAccount: CreditAccount | null;
  isLoadingAccount: boolean;
  loadAccount: () => Promise<void>;
  deposit: (amount: number) => Promise<void>;

  // Usage
  usageRecords: UsageRecord[];
  usageSummary: UsageSummary | null;
  isRecordingUsage: boolean;
  recordUsage: (meter: string, count: number) => Promise<UsageRecord>;

  // Invoices
  invoices: Invoice[];
  isCreatingInvoice: boolean;
  createInvoice: (params: {
    amount: number;
    reference: string;
    buyerEmail: string;
    buyerCompany: string;
  }) => Promise<Invoice>;

  // Disputes
  disputes: Dispute[];
  isCreatingDispute: boolean;
  createDispute: (params: {
    transactionId: string;
    amount: number;
    category: Dispute['category'];
    claim: string;
  }) => Promise<Dispute>;
  evaluateDispute: (disputeId: string) => Promise<void>;

  // Treasury
  treasuryOverview: TreasuryOverview | null;
  isLoadingTreasury: boolean;
  loadTreasury: () => Promise<void>;
  transferToReserve: (amount: number) => Promise<void>;
  transferFromReserve: (amount: number) => Promise<void>;
}

// ==========================================================================
// Context
// ==========================================================================

const MockB2BContext = createContext<MockB2BContextValue | null>(null);

// ==========================================================================
// Helper Functions
// ==========================================================================

function createMoney(amount: number, currency: 'USDC' | 'USDY' | 'USD' = 'USDC'): Money {
  return { amount: amount.toFixed(2), currency };
}

function generateId(prefix: string): string {
  return `${prefix}_demo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ==========================================================================
// Provider
// ==========================================================================

export function MockB2BProvider({ children }: { children: ReactNode }) {
  // Credit Account State
  const [creditAccount, setCreditAccount] = useState<CreditAccount | null>(null);
  const [isLoadingAccount, setIsLoadingAccount] = useState(false);

  // Usage State
  const [usageRecords, setUsageRecords] = useState<UsageRecord[]>([]);
  const [usageSummary, setUsageSummary] = useState<UsageSummary | null>(null);
  const [isRecordingUsage, setIsRecordingUsage] = useState(false);

  // Invoice State
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);

  // Dispute State
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isCreatingDispute, setIsCreatingDispute] = useState(false);

  // Treasury State
  const [treasuryOverview, setTreasuryOverview] = useState<TreasuryOverview | null>(null);
  const [isLoadingTreasury, setIsLoadingTreasury] = useState(false);

  // ==========================================================================
  // Credit Account Actions
  // ==========================================================================

  const loadAccount = useCallback(async () => {
    setIsLoadingAccount(true);
    await delay(800);

    setCreditAccount({
      id: 'acc_demo_001',
      name: 'Demo Business Account',
      organizationId: 'org_demo_001',
      availableBalance: createMoney(12500),
      yieldBalance: createMoney(5000, 'USDY'),
      yieldEarned: createMoney(125.50, 'USDY'),
      status: 'active',
    });

    // Also set initial usage summary
    setUsageSummary({
      period: new Date().toISOString().slice(0, 7),
      items: [
        { meter: 'api_call', count: 15420, cost: createMoney(154.20) },
        { meter: 'data_export', count: 23, cost: createMoney(11.50) },
        { meter: 'premium_feature', count: 5, cost: createMoney(25.00) },
      ],
      total: createMoney(190.70),
    });

    setIsLoadingAccount(false);
  }, []);

  const deposit = useCallback(async (amount: number) => {
    await delay(1200);
    setCreditAccount((prev) => {
      if (!prev) return prev;
      const currentBalance = parseFloat(prev.availableBalance.amount);
      return {
        ...prev,
        availableBalance: createMoney(currentBalance + amount),
      };
    });
  }, []);

  // ==========================================================================
  // Usage Actions
  // ==========================================================================

  const recordUsage = useCallback(async (meter: string, count: number): Promise<UsageRecord> => {
    setIsRecordingUsage(true);
    await delay(500);

    const rates: Record<string, number> = {
      api_call: 0.01,
      data_export: 0.50,
      premium_feature: 5.00,
      storage_gb: 0.10,
    };

    const rate = rates[meter] || 0.01;
    const cost = rate * count;

    const record: UsageRecord = {
      id: generateId('usg'),
      meter,
      count,
      cost: createMoney(cost),
      createdAt: new Date(),
    };

    setUsageRecords((prev) => [record, ...prev]);

    // Update account balance
    setCreditAccount((prev) => {
      if (!prev) return prev;
      const currentBalance = parseFloat(prev.availableBalance.amount);
      return {
        ...prev,
        availableBalance: createMoney(Math.max(0, currentBalance - cost)),
        status: currentBalance - cost < 100 ? 'low_balance' : 'active',
      };
    });

    // Update summary
    setUsageSummary((prev) => {
      if (!prev) return prev;
      const existingItem = prev.items.find((i) => i.meter === meter);
      const items = existingItem
        ? prev.items.map((i) =>
            i.meter === meter
              ? { ...i, count: i.count + count, cost: createMoney(parseFloat(i.cost.amount) + cost) }
              : i
          )
        : [...prev.items, { meter, count, cost: createMoney(cost) }];

      const total = items.reduce((sum, i) => sum + parseFloat(i.cost.amount), 0);
      return { ...prev, items, total: createMoney(total) };
    });

    setIsRecordingUsage(false);
    return record;
  }, []);

  // ==========================================================================
  // Invoice Actions
  // ==========================================================================

  const createInvoice = useCallback(async (params: {
    amount: number;
    reference: string;
    buyerEmail: string;
    buyerCompany: string;
  }): Promise<Invoice> => {
    setIsCreatingInvoice(true);
    await delay(1000);

    const fee = params.amount * 0.001; // 0.1% fee
    const invoice: Invoice = {
      id: generateId('inv'),
      reference: params.reference,
      amount: createMoney(params.amount),
      fee: createMoney(fee),
      netAmount: createMoney(params.amount - fee),
      status: 'sent',
      buyer: { company: params.buyerCompany, email: params.buyerEmail },
      paymentUrl: `https://pay.arcpay.io/demo/${generateId('inv')}`,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    };

    setInvoices((prev) => [invoice, ...prev]);
    setIsCreatingInvoice(false);
    return invoice;
  }, []);

  // ==========================================================================
  // Dispute Actions
  // ==========================================================================

  const createDispute = useCallback(async (params: {
    transactionId: string;
    amount: number;
    category: Dispute['category'];
    claim: string;
  }): Promise<Dispute> => {
    setIsCreatingDispute(true);
    await delay(800);

    const dispute: Dispute = {
      id: generateId('dsp'),
      transactionId: params.transactionId,
      amount: createMoney(params.amount),
      category: params.category,
      status: 'filed',
      claim: params.claim,
      createdAt: new Date(),
    };

    setDisputes((prev) => [dispute, ...prev]);
    setIsCreatingDispute(false);
    return dispute;
  }, []);

  const evaluateDispute = useCallback(async (disputeId: string) => {
    await delay(2000);

    setDisputes((prev) =>
      prev.map((d) => {
        if (d.id !== disputeId) return d;

        // Simulate AI evaluation
        const recommendations = ['approve', 'deny', 'escalate'] as const;
        const recommendation = recommendations[Math.floor(Math.random() * 3)];
        const confidence = 0.75 + Math.random() * 0.20;

        const reasonings: Record<typeof recommendation, string> = {
          approve: 'Buyer has clean history, merchant failed to provide delivery proof.',
          deny: 'Merchant provided valid delivery confirmation and service records.',
          escalate: 'Evidence is inconclusive, requires human review.',
        };

        return {
          ...d,
          status: 'under_review',
          aiEvaluation: {
            recommendation,
            confidence,
            reasoning: reasonings[recommendation],
          },
        };
      })
    );
  }, []);

  // ==========================================================================
  // Treasury Actions
  // ==========================================================================

  const loadTreasury = useCallback(async () => {
    setIsLoadingTreasury(true);
    await delay(800);

    setTreasuryOverview({
      operating: { balance: createMoney(50000), currency: 'USDC' },
      reserve: {
        balance: createMoney(150000, 'USDY'),
        apy: 5.2,
        earnedYTD: createMoney(3875, 'USDY'),
      },
      total: createMoney(200000),
      projectedAnnualYield: createMoney(7800),
    });

    setIsLoadingTreasury(false);
  }, []);

  const transferToReserve = useCallback(async (amount: number) => {
    await delay(1500);

    setTreasuryOverview((prev) => {
      if (!prev) return prev;
      const operating = parseFloat(prev.operating.balance.amount) - amount;
      const reserve = parseFloat(prev.reserve.balance.amount) + amount;
      return {
        ...prev,
        operating: { ...prev.operating, balance: createMoney(operating) },
        reserve: { ...prev.reserve, balance: createMoney(reserve, 'USDY') },
      };
    });
  }, []);

  const transferFromReserve = useCallback(async (amount: number) => {
    await delay(1500);

    setTreasuryOverview((prev) => {
      if (!prev) return prev;
      const operating = parseFloat(prev.operating.balance.amount) + amount;
      const reserve = parseFloat(prev.reserve.balance.amount) - amount;
      return {
        ...prev,
        operating: { ...prev.operating, balance: createMoney(operating) },
        reserve: { ...prev.reserve, balance: createMoney(reserve, 'USDY') },
      };
    });
  }, []);

  // ==========================================================================
  // Context Value
  // ==========================================================================

  const value: MockB2BContextValue = {
    creditAccount,
    isLoadingAccount,
    loadAccount,
    deposit,

    usageRecords,
    usageSummary,
    isRecordingUsage,
    recordUsage,

    invoices,
    isCreatingInvoice,
    createInvoice,

    disputes,
    isCreatingDispute,
    createDispute,
    evaluateDispute,

    treasuryOverview,
    isLoadingTreasury,
    loadTreasury,
    transferToReserve,
    transferFromReserve,
  };

  return (
    <MockB2BContext.Provider value={value}>
      {children}
    </MockB2BContext.Provider>
  );
}

// ==========================================================================
// Hooks
// ==========================================================================

export function useB2B(): MockB2BContextValue {
  const context = useContext(MockB2BContext);
  if (!context) {
    throw new Error('useB2B must be used within a MockB2BProvider');
  }
  return context;
}

export function useCreditAccount() {
  const { creditAccount, isLoadingAccount, loadAccount, deposit } = useB2B();
  return { creditAccount, isLoading: isLoadingAccount, loadAccount, deposit };
}

export function useUsage() {
  const { usageRecords, usageSummary, isRecordingUsage, recordUsage } = useB2B();
  return { usageRecords, usageSummary, isRecording: isRecordingUsage, recordUsage };
}

export function useInvoices() {
  const { invoices, isCreatingInvoice, createInvoice } = useB2B();
  return { invoices, isCreating: isCreatingInvoice, createInvoice };
}

export function useDisputes() {
  const { disputes, isCreatingDispute, createDispute, evaluateDispute } = useB2B();
  return { disputes, isCreating: isCreatingDispute, createDispute, evaluateDispute };
}

export function useTreasury() {
  const {
    treasuryOverview,
    isLoadingTreasury,
    loadTreasury,
    transferToReserve,
    transferFromReserve,
  } = useB2B();
  return {
    overview: treasuryOverview,
    isLoading: isLoadingTreasury,
    loadTreasury,
    transferToReserve,
    transferFromReserve,
  };
}
