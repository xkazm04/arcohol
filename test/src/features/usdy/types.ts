export interface UsdyStats {
  totalBalance: number;
  currentApy: number;
  earnedThisMonth: number;
  earnedAllTime: number;
  dailyYield: number;
  projectedMonthlyYield: number;
  automatedDeposits: number;
  activeRulesCount: number;
  pendingDeposits: number;
  chain: string;
  currency: string;
}

export interface UsdyTransaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'yield';
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  description?: string;
  createdAt: string;
  completedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  type: 'percentage' | 'threshold' | 'scheduled';
  enabled: boolean;
  config: AutomationRuleConfig;
  percentage?: number;
  threshold?: number;
  schedule?: string;
  sourceAccount?: string;
  totalDeposited: number;
  executionCount: number;
  lastTriggeredAt?: string;
  nextScheduledAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AutomationRuleConfig {
  percentage?: number;
  threshold?: number;
  targetBalance?: number;
  schedule?: string;
  fixedAmount?: number;
  sourceAccount?: string;
  minAmount?: number;
}

export interface AutomationLog {
  id: string;
  ruleId: string;
  ruleName: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  triggerType: 'manual' | 'scheduled' | 'threshold' | 'webhook' | 'percentage';
  newReserveBalance?: number;
  timestamp: string;
}

export interface CreateAutomationRuleParams {
  name: string;
  description?: string;
  type: 'percentage' | 'threshold' | 'scheduled';
  config: AutomationRuleConfig;
}

export interface UpdateAutomationRuleParams {
  name?: string;
  description?: string;
  type?: 'percentage' | 'threshold' | 'scheduled';
  config?: AutomationRuleConfig;
  enabled?: boolean;
}

export interface DepositParams {
  amount: number;
  source?: string;
}

export interface WithdrawParams {
  amount: number;
  destination?: string;
}

export interface TransactionListParams {
  limit?: number;
  offset?: number;
  type?: 'deposit' | 'withdraw' | 'yield';
}
