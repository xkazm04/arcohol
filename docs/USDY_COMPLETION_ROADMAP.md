# USDY Feature Completion Roadmap

> This document outlines the remaining work needed to make the USDY yield management feature production-ready. Current implementation uses mocked data and simulated operations.

---

## Table of Contents

1. [Current State Summary](#current-state-summary)
2. [Ondo Finance Integration](#ondo-finance-integration)
3. [Automation Engine](#automation-engine)
4. [Yield Tracking & Accruals](#yield-tracking--accruals)
5. [Multi-Chain Support](#multi-chain-support)
6. [Webhook Events](#webhook-events)
7. [Account & Credential Requirements](#account--credential-requirements)
8. [Implementation Priority](#implementation-priority)

---

## Current State Summary

### What's Working (MVP)
| Feature | Status | Notes |
|---------|--------|-------|
| UI Components | ✅ Complete | Stats, deposit/withdraw panel, rules list |
| API Routes | ✅ Complete | All CRUD endpoints functional |
| React Hooks | ✅ Complete | Data fetching with loading states |
| B2B SDK | ✅ Complete | UsdyResource with all methods |
| Database Schema | ✅ Complete | Tables, RLS, triggers ready |

### What's Mocked
| Feature | Current State | Production Requirement |
|---------|---------------|------------------------|
| USDC → USDY Swap | Simulated (instant) | Real Ondo mint operation |
| USDY → USDC Swap | Simulated (instant) | Real Ondo redeem operation |
| APY Rate | Static 5.2% | Live from Ondo oracle |
| Yield Accruals | Not calculated | Daily cron job calculation |
| Automation Triggers | Manual only | Scheduled + event-driven |
| Balance Verification | Database only | On-chain verification |

---

## Ondo Finance Integration

### Overview
Ondo Finance provides USDY (US Dollar Yield) - a tokenized note backed by US Treasuries. Integration requires:
- Minting USDY from USDC
- Redeeming USDY back to USDC
- Fetching real-time APY

### Required Accounts

| Account | Purpose | How to Obtain |
|---------|---------|---------------|
| Ondo KYB Account | Business verification for minting/redeeming | Apply at [ondo.finance](https://ondo.finance) |
| Ondo API Key | Programmatic access (if available) | Contact Ondo team |
| Whitelisted Wallet | Only whitelisted addresses can hold USDY | Submit wallet during KYB |

### Contract Addresses

```typescript
// src/config/usdy-contracts.ts

export const USDY_CONTRACTS = {
  ethereum: {
    usdy: '0x96F6eF951840721AdBF46Ac996b59E0235CB985C',
    usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    ondoMinter: '0x...', // Ondo's minting contract
  },
  polygon: {
    usdy: '0x...', // Polygon USDY address
    usdc: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  },
  arbitrum: {
    usdy: '0x...', // Arbitrum USDY address
    usdc: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
  },
} as const;
```

### Implementation Steps

#### Step 1: Create USDY Contract Service

```typescript
// test/src/services/usdy-contract.ts

import { ethers } from 'ethers';
import { USDY_CONTRACTS } from '@/config/usdy-contracts';

// USDY ABI (simplified - get full ABI from Ondo)
const USDY_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
];

// Ondo Minter ABI (need from Ondo documentation)
const MINTER_ABI = [
  'function mint(uint256 usdcAmount) returns (uint256 usdyAmount)',
  'function redeem(uint256 usdyAmount) returns (uint256 usdcAmount)',
  'function getExchangeRate() view returns (uint256)',
];

export class UsdyContractService {
  private provider: ethers.Provider;
  private signer: ethers.Signer;
  private chain: keyof typeof USDY_CONTRACTS;

  constructor(options: {
    rpcUrl: string;
    privateKey: string;
    chain: keyof typeof USDY_CONTRACTS;
  }) {
    this.provider = new ethers.JsonRpcProvider(options.rpcUrl);
    this.signer = new ethers.Wallet(options.privateKey, this.provider);
    this.chain = options.chain;
  }

  /**
   * Mint USDY from USDC
   * 1. Approve USDC spending
   * 2. Call mint on Ondo minter
   */
  async mint(usdcAmount: bigint): Promise<{
    txHash: string;
    usdyReceived: bigint;
  }> {
    const contracts = USDY_CONTRACTS[this.chain];

    // Approve USDC
    const usdc = new ethers.Contract(contracts.usdc, [
      'function approve(address, uint256) returns (bool)',
    ], this.signer);

    const approveTx = await usdc.approve(contracts.ondoMinter, usdcAmount);
    await approveTx.wait();

    // Mint USDY
    const minter = new ethers.Contract(contracts.ondoMinter, MINTER_ABI, this.signer);
    const mintTx = await minter.mint(usdcAmount);
    const receipt = await mintTx.wait();

    // Parse events to get USDY amount received
    // ... parse logs

    return {
      txHash: receipt.hash,
      usdyReceived: BigInt(0), // Parse from logs
    };
  }

  /**
   * Redeem USDY back to USDC
   */
  async redeem(usdyAmount: bigint): Promise<{
    txHash: string;
    usdcReceived: bigint;
  }> {
    // Similar to mint but in reverse
    // ...
  }

  /**
   * Get current exchange rate
   */
  async getExchangeRate(): Promise<number> {
    const contracts = USDY_CONTRACTS[this.chain];
    const minter = new ethers.Contract(contracts.ondoMinter, MINTER_ABI, this.provider);
    const rate = await minter.getExchangeRate();
    return Number(rate) / 1e18;
  }

  /**
   * Get USDY balance for an address
   */
  async getBalance(address: string): Promise<bigint> {
    const contracts = USDY_CONTRACTS[this.chain];
    const usdy = new ethers.Contract(contracts.usdy, USDY_ABI, this.provider);
    return usdy.balanceOf(address);
  }
}
```

#### Step 2: Create APY Oracle Service

```typescript
// test/src/services/usdy-apy-oracle.ts

export class UsdyApyOracle {
  private readonly ONDO_API_URL = 'https://api.ondo.finance'; // Placeholder

  /**
   * Fetch current APY from Ondo
   * Options:
   * 1. Ondo API (if available)
   * 2. On-chain oracle
   * 3. Scrape from ondo.finance website
   */
  async getCurrentApy(): Promise<number> {
    // Option 1: API call
    try {
      const response = await fetch(`${this.ONDO_API_URL}/v1/usdy/apy`);
      const data = await response.json();
      return data.apy;
    } catch {
      // Fallback to on-chain or default
      return 5.2; // Current approximate APY
    }
  }

  /**
   * Calculate daily yield based on APY
   */
  calculateDailyYield(balance: number, apy: number): number {
    // APY to daily rate
    const dailyRate = Math.pow(1 + apy / 100, 1 / 365) - 1;
    return balance * dailyRate;
  }
}
```

#### Step 3: Update API Routes for Real Operations

```typescript
// test/src/app/api/usdy/deposit/route.ts (updated)

import { UsdyContractService } from '@/services/usdy-contract';

export async function POST(request: NextRequest) {
  // ... existing validation ...

  // Check if we're in production mode
  const isProduction = process.env.USDY_MODE === 'production';

  if (isProduction) {
    // Real Ondo integration
    const contractService = new UsdyContractService({
      rpcUrl: process.env.RPC_URL!,
      privateKey: process.env.TREASURY_PRIVATE_KEY!,
      chain: 'ethereum',
    });

    // Execute real mint
    const result = await contractService.mint(BigInt(amount * 1e6)); // USDC has 6 decimals

    // Update database with real tx hash
    await supabase.from('treasury_transactions').insert({
      // ... include txHash: result.txHash
    });
  } else {
    // Mock operation (current implementation)
    // ...
  }
}
```

---

## Automation Engine

### Overview
The automation engine executes rules based on triggers:
- **Percentage**: Execute when revenue is received
- **Threshold**: Execute when balance exceeds threshold
- **Scheduled**: Execute on cron schedule

### Architecture Options

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **Bull Queue + Redis** | Battle-tested, good for scheduling | Requires Redis infrastructure | ✅ Recommended for MVP |
| **Temporal.io** | Durable workflows, retries | Complex setup, learning curve | Good for scale |
| **Vercel Cron** | Simple, serverless | Limited to scheduled only | For scheduled rules only |
| **Chainlink Keepers** | Decentralized, on-chain | Cost, complexity | Future consideration |

### Implementation with Bull Queue

#### Step 1: Setup Bull Queue

```bash
npm install bullmq ioredis
```

#### Step 2: Create Queue Workers

```typescript
// test/src/workers/automation-worker.ts

import { Worker, Queue } from 'bullmq';
import { createClient } from '@supabase/supabase-js';
import { UsdyContractService } from '@/services/usdy-contract';

const connection = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

// Queue for automation jobs
export const automationQueue = new Queue('usdy-automation', { connection });

// Worker to process jobs
const worker = new Worker('usdy-automation', async (job) => {
  const { ruleId, organizationId, amount, triggerType } = job.data;

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  // Get rule details
  const { data: rule } = await supabase
    .from('usdy_automation_rules')
    .select('*')
    .eq('id', ruleId)
    .single();

  if (!rule || !rule.enabled) {
    throw new Error('Rule not found or disabled');
  }

  // Calculate amount based on rule type
  let depositAmount = amount;
  if (!depositAmount) {
    if (rule.type === 'percentage') {
      // Get source balance and calculate percentage
      const sourceBalance = await getSourceBalance(organizationId, rule.config.sourceAccount);
      depositAmount = sourceBalance * (rule.config.percentage / 100);
    } else if (rule.type === 'threshold') {
      const sourceBalance = await getSourceBalance(organizationId, rule.config.sourceAccount);
      depositAmount = sourceBalance - (rule.config.targetBalance || 0);
    }
  }

  if (depositAmount <= 0) {
    return { skipped: true, reason: 'No amount to deposit' };
  }

  // Execute deposit (real or mock based on env)
  const contractService = new UsdyContractService({
    rpcUrl: process.env.RPC_URL!,
    privateKey: process.env.TREASURY_PRIVATE_KEY!,
    chain: 'ethereum',
  });

  const result = await contractService.mint(BigInt(depositAmount * 1e6));

  // Log execution
  await supabase.from('usdy_automation_logs').insert({
    rule_id: ruleId,
    organization_id: organizationId,
    amount: depositAmount,
    status: 'completed',
    trigger_type: triggerType,
    metadata: { txHash: result.txHash },
  });

  // Update rule stats
  await supabase.rpc('increment_rule_stats', {
    p_rule_id: ruleId,
    p_amount: depositAmount,
  });

  return { success: true, txHash: result.txHash, amount: depositAmount };
}, { connection });

worker.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed:`, result);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});
```

#### Step 3: Schedule Processor

```typescript
// test/src/workers/schedule-processor.ts

import cron from 'node-cron';
import { automationQueue } from './automation-worker';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Run every minute to check scheduled rules
cron.schedule('* * * * *', async () => {
  const now = new Date();

  // Find scheduled rules that are due
  const { data: dueRules } = await supabase
    .from('usdy_automation_rules')
    .select('*')
    .eq('type', 'scheduled')
    .eq('enabled', true)
    .lte('next_scheduled_at', now.toISOString());

  for (const rule of dueRules || []) {
    // Add job to queue
    await automationQueue.add('execute-rule', {
      ruleId: rule.id,
      organizationId: rule.organization_id,
      triggerType: 'scheduled',
    });

    // Calculate next execution time
    const nextRun = calculateNextRun(rule.config.schedule);
    await supabase
      .from('usdy_automation_rules')
      .update({ next_scheduled_at: nextRun })
      .eq('id', rule.id);
  }
});

function calculateNextRun(cronExpression: string): string {
  // Use cron-parser to calculate next run
  // npm install cron-parser
  const parser = require('cron-parser');
  const interval = parser.parseExpression(cronExpression);
  return interval.next().toISOString();
}
```

#### Step 4: Threshold Monitor

```typescript
// test/src/workers/threshold-monitor.ts

import { automationQueue } from './automation-worker';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

/**
 * Subscribe to balance changes and trigger threshold rules
 */
export function startThresholdMonitor() {
  // Option 1: Supabase realtime subscription
  const channel = supabase
    .channel('treasury-balances')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'treasury_accounts',
        filter: 'operating_balance=gt.0',
      },
      async (payload) => {
        const { id: treasuryId, organization_id, operating_balance } = payload.new;

        // Find threshold rules for this org
        const { data: rules } = await supabase
          .from('usdy_automation_rules')
          .select('*')
          .eq('organization_id', organization_id)
          .eq('type', 'threshold')
          .eq('enabled', true);

        for (const rule of rules || []) {
          if (operating_balance > rule.config.threshold) {
            await automationQueue.add('execute-rule', {
              ruleId: rule.id,
              organizationId: organization_id,
              triggerType: 'threshold',
            });
          }
        }
      }
    )
    .subscribe();

  return channel;
}
```

#### Step 5: Webhook Handler for Percentage Rules

```typescript
// test/src/app/api/webhooks/revenue/route.ts

import { automationQueue } from '@/workers/automation-worker';
import { createClient } from '@supabase/supabase-js';

/**
 * Webhook endpoint that external systems call when revenue is received
 * This triggers percentage-based automation rules
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { organizationId, amount, source, eventType } = body;

  // Verify webhook signature
  // ...

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  // Find percentage rules matching this source
  const { data: rules } = await supabase
    .from('usdy_automation_rules')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('type', 'percentage')
    .eq('enabled', true)
    .eq('config->>sourceAccount', source);

  for (const rule of rules || []) {
    const depositAmount = amount * (rule.config.percentage / 100);

    if (depositAmount >= (rule.config.minAmount || 0)) {
      await automationQueue.add('execute-rule', {
        ruleId: rule.id,
        organizationId,
        amount: depositAmount,
        triggerType: 'percentage',
      });
    }
  }

  return NextResponse.json({ received: true });
}
```

---

## Yield Tracking & Accruals

### Daily Yield Calculation

```typescript
// test/src/workers/yield-accrual.ts

import cron from 'node-cron';
import { createClient } from '@supabase/supabase-js';
import { UsdyApyOracle } from '@/services/usdy-apy-oracle';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const apyOracle = new UsdyApyOracle();

// Run daily at midnight UTC
cron.schedule('0 0 * * *', async () => {
  console.log('Starting daily yield accrual calculation...');

  // Get current APY
  const currentApy = await apyOracle.getCurrentApy();

  // Get all treasury accounts with USDY balance
  const { data: accounts } = await supabase
    .from('treasury_accounts')
    .select('id, organization_id, reserve_balance')
    .gt('reserve_balance', 0);

  const today = new Date().toISOString().split('T')[0];

  for (const account of accounts || []) {
    const openingBalance = account.reserve_balance;
    const yieldAmount = apyOracle.calculateDailyYield(openingBalance, currentApy);
    const closingBalance = openingBalance + yieldAmount;

    // Record accrual
    await supabase.from('usdy_yield_accruals').insert({
      organization_id: account.organization_id,
      treasury_id: account.id,
      date: today,
      opening_balance: openingBalance,
      apy_rate: currentApy,
      yield_amount: yieldAmount,
      closing_balance: closingBalance,
    });

    // Update treasury balance
    await supabase
      .from('treasury_accounts')
      .update({
        reserve_balance: closingBalance,
        yield_earned_total: supabase.rpc('increment', { x: yieldAmount }),
      })
      .eq('id', account.id);

    // Create yield transaction
    await supabase.from('treasury_transactions').insert({
      organization_id: account.organization_id,
      treasury_id: account.id,
      type: 'yield',
      amount: yieldAmount,
      currency: 'USDY',
      status: 'completed',
      description: `Daily yield accrual (${currentApy}% APY)`,
    });

    // Dispatch webhook event
    await dispatchWebhook(account.organization_id, 'usdy.yield.accrued', {
      date: today,
      amount: yieldAmount,
      apyRate: currentApy,
      newBalance: closingBalance,
    });
  }

  // Record APY in history if changed
  await recordApyHistory(currentApy);
});

async function recordApyHistory(apy: number) {
  const { data: lastEntry } = await supabase
    .from('usdy_apy_history')
    .select('apy_rate')
    .order('effective_date', { ascending: false })
    .limit(1)
    .single();

  if (!lastEntry || Math.abs(lastEntry.apy_rate - apy) > 0.01) {
    await supabase.from('usdy_apy_history').insert({
      effective_date: new Date().toISOString().split('T')[0],
      apy_rate: apy,
      source: 'oracle',
      chain: 'ethereum',
    });
  }
}
```

---

## Multi-Chain Support

### Chain Configuration

```typescript
// test/src/config/chains.ts

export const SUPPORTED_CHAINS = {
  ethereum: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: process.env.ETHEREUM_RPC_URL,
    usdy: '0x96F6eF951840721AdBF46Ac996b59E0235CB985C',
    usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    explorer: 'https://etherscan.io',
  },
  polygon: {
    chainId: 137,
    name: 'Polygon',
    rpcUrl: process.env.POLYGON_RPC_URL,
    usdy: '0x...', // TBD
    usdc: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    explorer: 'https://polygonscan.com',
  },
  arbitrum: {
    chainId: 42161,
    name: 'Arbitrum One',
    rpcUrl: process.env.ARBITRUM_RPC_URL,
    usdy: '0x...', // TBD
    usdc: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
    explorer: 'https://arbiscan.io',
  },
  arc: {
    chainId: 0, // TBD - Arc chain ID
    name: 'Arc',
    rpcUrl: process.env.ARC_RPC_URL,
    usdy: '0x...', // TBD
    usdc: '0x...', // TBD
    explorer: 'https://explorer.arc.xyz',
  },
} as const;

export type SupportedChain = keyof typeof SUPPORTED_CHAINS;
```

### Database Schema Update

```sql
-- Add chain column to existing tables

ALTER TABLE treasury_accounts
ADD COLUMN IF NOT EXISTS chain TEXT DEFAULT 'arc';

ALTER TABLE usdy_automation_rules
ADD COLUMN IF NOT EXISTS chain TEXT DEFAULT 'arc';

ALTER TABLE usdy_yield_accruals
ADD COLUMN IF NOT EXISTS chain TEXT DEFAULT 'arc';

-- Update indexes
CREATE INDEX IF NOT EXISTS idx_treasury_accounts_chain ON treasury_accounts(chain);
CREATE INDEX IF NOT EXISTS idx_automation_rules_chain ON usdy_automation_rules(chain);
```

---

## Webhook Events

### Event Types to Implement

```typescript
// test/src/types/webhook-events.ts

export const USDY_WEBHOOK_EVENTS = {
  // Deposit events
  'usdy.deposit.initiated': {
    description: 'USDY deposit has been initiated',
    payload: {
      transactionId: 'string',
      amount: 'number',
      txHash: 'string?',
    },
  },
  'usdy.deposit.completed': {
    description: 'USDY deposit has been completed',
    payload: {
      transactionId: 'string',
      amount: 'number',
      usdyReceived: 'number',
      txHash: 'string',
    },
  },
  'usdy.deposit.failed': {
    description: 'USDY deposit has failed',
    payload: {
      transactionId: 'string',
      amount: 'number',
      error: 'string',
    },
  },

  // Withdrawal events
  'usdy.withdraw.initiated': { /* ... */ },
  'usdy.withdraw.completed': { /* ... */ },
  'usdy.withdraw.failed': { /* ... */ },

  // Automation events
  'usdy.automation.triggered': {
    description: 'Automation rule was triggered',
    payload: {
      ruleId: 'string',
      ruleName: 'string',
      triggerType: 'manual | scheduled | threshold | percentage',
      amount: 'number',
    },
  },
  'usdy.automation.completed': { /* ... */ },
  'usdy.automation.failed': { /* ... */ },

  // Yield events
  'usdy.yield.accrued': {
    description: 'Daily yield has been accrued',
    payload: {
      date: 'string',
      amount: 'number',
      apyRate: 'number',
      newBalance: 'number',
    },
  },
  'usdy.apy.changed': {
    description: 'APY rate has changed',
    payload: {
      previousRate: 'number',
      newRate: 'number',
      effectiveDate: 'string',
    },
  },
} as const;
```

### Webhook Dispatcher

```typescript
// test/src/services/webhook-dispatcher.ts

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export async function dispatchWebhook(
  organizationId: string,
  eventType: string,
  payload: Record<string, unknown>
) {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  // Get active webhook endpoints for this org
  const { data: endpoints } = await supabase
    .from('webhook_endpoints')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('status', 'active')
    .contains('events', [eventType]);

  for (const endpoint of endpoints || []) {
    const event = {
      id: crypto.randomUUID(),
      type: eventType,
      created: new Date().toISOString(),
      data: payload,
    };

    // Generate signature
    const signature = crypto
      .createHmac('sha256', endpoint.secret)
      .update(JSON.stringify(event))
      .digest('hex');

    // Send webhook
    try {
      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-ArcPay-Signature': signature,
          'X-ArcPay-Event': eventType,
        },
        body: JSON.stringify(event),
      });

      // Log delivery
      await supabase.from('webhook_deliveries').insert({
        endpoint_id: endpoint.id,
        event_type: eventType,
        payload: event,
        status: response.ok ? 'delivered' : 'failed',
        response_code: response.status,
      });
    } catch (error) {
      await supabase.from('webhook_deliveries').insert({
        endpoint_id: endpoint.id,
        event_type: eventType,
        payload: event,
        status: 'failed',
        error_message: (error as Error).message,
      });
    }
  }
}
```

---

## Account & Credential Requirements

### External Accounts Needed

| Service | Account Type | Purpose | Priority |
|---------|-------------|---------|----------|
| **Ondo Finance** | Business (KYB) | Mint/redeem USDY | 🔴 High |
| **Circle** | Business | USDC custody (already have) | ✅ Done |
| **Infura/Alchemy** | API | Ethereum RPC access | 🔴 High |
| **Redis Cloud** | Database | Queue processing | 🟡 Medium |
| **Vercel** | Hosting | Cron jobs (alternative) | 🟢 Low |

### Environment Variables

```bash
# .env.production (to be added)

# Ondo Finance
ONDO_API_KEY=
USDY_MODE=production  # 'mock' | 'production'

# Blockchain RPCs
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
POLYGON_RPC_URL=https://polygon-mainnet.infura.io/v3/YOUR_KEY
ARBITRUM_RPC_URL=https://arbitrum-mainnet.infura.io/v3/YOUR_KEY
ARC_RPC_URL=

# Treasury Wallet (for signing transactions)
TREASURY_PRIVATE_KEY=  # ⚠️ Use KMS in production!
TREASURY_ADDRESS=

# Redis (for Bull Queue)
REDIS_HOST=
REDIS_PORT=6379
REDIS_PASSWORD=

# Feature Flags
ENABLE_AUTOMATION_ENGINE=false
ENABLE_YIELD_ACCRUAL=false
ENABLE_MULTI_CHAIN=false
```

### Security Considerations

1. **Private Key Management**
   - Never store raw private keys in env vars for production
   - Use AWS KMS, HashiCorp Vault, or similar
   - Consider multi-sig for treasury operations

2. **Webhook Security**
   - Always verify signatures
   - Use HTTPS only
   - Implement retry with exponential backoff

3. **Rate Limiting**
   - Limit automation rule executions per org
   - Throttle Ondo API calls if applicable

---

## Implementation Priority

### Phase 1: Core Integration (Week 1-2)
1. ✅ Set up Ondo KYB account
2. Create `UsdyContractService` with mock mode
3. Add environment variable support for switching modes
4. Test deposit/withdraw with Ondo testnet (if available)

### Phase 2: Automation Engine (Week 2-3)
1. Set up Redis infrastructure
2. Implement Bull Queue workers
3. Add scheduled rule processor
4. Add threshold monitor
5. Test automation end-to-end

### Phase 3: Yield Tracking (Week 3-4)
1. Implement APY oracle
2. Create daily yield accrual job
3. Update stats API with real calculations
4. Add yield history chart to UI

### Phase 4: Multi-Chain (Week 4-5)
1. Deploy USDY support on additional chains
2. Update database schema
3. Add chain selector to UI
4. Test cross-chain operations

### Phase 5: Production Hardening (Week 5-6)
1. Security audit
2. KMS integration for private keys
3. Monitoring and alerting
4. Load testing
5. Documentation

---

## Files to Create/Modify

### New Files

| File | Purpose |
|------|---------|
| `test/src/config/usdy-contracts.ts` | Contract addresses |
| `test/src/config/chains.ts` | Multi-chain config |
| `test/src/services/usdy-contract.ts` | Ondo contract interaction |
| `test/src/services/usdy-apy-oracle.ts` | APY fetching |
| `test/src/services/webhook-dispatcher.ts` | Webhook sending |
| `test/src/workers/automation-worker.ts` | Bull Queue worker |
| `test/src/workers/schedule-processor.ts` | Cron scheduler |
| `test/src/workers/threshold-monitor.ts` | Balance monitor |
| `test/src/workers/yield-accrual.ts` | Daily yield job |

### Modified Files

| File | Changes |
|------|---------|
| `test/src/app/api/usdy/deposit/route.ts` | Add real Ondo integration |
| `test/src/app/api/usdy/withdraw/route.ts` | Add real Ondo integration |
| `test/src/app/api/usdy/stats/route.ts` | Calculate real yield |
| `test/db/013_usdy.sql` | Add chain column |

---

## Questions to Resolve

1. **Ondo Access**: Do we have business relationship with Ondo? Can we get API access?
2. **Treasury Custody**: Who holds the treasury wallet keys? Circle W3S or self-custody?
3. **Multi-Chain Priority**: Which chains besides Arc are most important to customers?
4. **Automation SLA**: What's the acceptable latency for automation execution?
5. **Yield Frequency**: Daily accrual is standard, but should we support real-time yield display?

---

*Last updated: January 2026*
*Next review: After Ondo KYB completion*
