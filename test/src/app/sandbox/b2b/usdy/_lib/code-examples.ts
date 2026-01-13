import type { SectionId, CodeTab } from './types';

export const codeExamples: Record<SectionId, Record<CodeTab, string>> = {
  'getting-started': {
    basic: `// Initialize USDY yield integration
import { ArcPayB2B } from '@arcpay/b2b'

const arcpay = new ArcPayB2B({
  apiKey: process.env.ARCPAY_API_KEY!,
  environment: 'sandbox',
})

// Get current yield stats
const yieldStats = await arcpay.usdy.getStats()

console.log('Balance:', yieldStats.balance)
console.log('Current APY:', yieldStats.apy + '%')
console.log('Earned this month:', yieldStats.earnedThisMonth)`,
    full: `// Full USDY configuration
import { ArcPayB2B } from '@arcpay/b2b'

const arcpay = new ArcPayB2B({
  apiKey: process.env.ARCPAY_API_KEY!,
  environment: 'production',
  webhookSecret: process.env.ARCPAY_WEBHOOK_SECRET,
})

// Initialize USDY account with settings
const account = await arcpay.usdy.initialize({
  // Auto-compound settings
  autoCompound: true,
  compoundFrequency: 'daily',

  // Notification preferences
  notifications: {
    yieldAccrual: true,
    apyChanges: true,
    largeDeposits: { enabled: true, threshold: 10000 },
  },

  // Withdrawal settings
  withdrawalSettings: {
    defaultDestination: 'acc_operating',
    requireApproval: { enabled: true, threshold: 50000 },
  },

  // Metadata
  metadata: {
    department: 'Treasury',
    costCenter: 'CC-001',
  },
})

// Get comprehensive stats
const stats = await arcpay.usdy.getStats({
  includeProjections: true,
  includeTaxInfo: true,
})

console.log('Total Balance:', stats.balance)
console.log('Projected Monthly Yield:', stats.projectedMonthlyYield)
console.log('Tax Basis:', stats.taxInfo.costBasis)`,
    hook: `// React hook for USDY integration
'use client'

import { useUSDY } from '@arcpay/b2b/react'

export function TreasuryDashboard() {
  const {
    stats,
    transactions,
    isLoading,
    deposit,
    withdraw,
    isDepositing,
    isWithdrawing,
    refetch,
  } = useUSDY()

  if (isLoading) return <div>Loading treasury...</div>

  return (
    <div className="treasury-dashboard">
      <div className="stats-grid">
        <div className="stat">
          <span className="label">USDY Balance</span>
          <span className="value">\${stats.balance.toLocaleString()}</span>
        </div>
        <div className="stat">
          <span className="label">Current APY</span>
          <span className="value">{stats.apy}%</span>
        </div>
        <div className="stat">
          <span className="label">Earned (MTD)</span>
          <span className="value">\${stats.earnedThisMonth.toFixed(2)}</span>
        </div>
      </div>

      <div className="actions">
        <button
          onClick={() => deposit({ amount: 10000 })}
          disabled={isDepositing}
        >
          {isDepositing ? 'Depositing...' : 'Deposit $10,000'}
        </button>
      </div>
    </div>
  )
}`,
  },
  'deposit-withdraw': {
    basic: `// Deposit funds to USDY
const deposit = await arcpay.usdy.deposit({
  amount: 10000,
  currency: 'USDC',
})

console.log('Deposited:', deposit.amount)
console.log('New balance:', deposit.newBalance)

// Withdraw funds from USDY
const withdrawal = await arcpay.usdy.withdraw({
  amount: 5000,
  currency: 'USDC',
})

console.log('Withdrawn:', withdrawal.amount)`,
    full: `// Full deposit/withdraw with options
// Deposit with metadata and notifications
const deposit = await arcpay.usdy.deposit({
  amount: 25000,
  currency: 'USDC',

  // Source tracking
  source: {
    type: 'manual',
    reference: 'Q1-Treasury-Allocation',
  },

  // Notification settings
  notify: {
    email: 'treasury@company.com',
    slack: '#finance-alerts',
  },

  // Metadata
  metadata: {
    approvedBy: 'CFO',
    budgetCode: 'TREAS-2024-Q1',
  },

  // Idempotency
  idempotencyKey: 'deposit_2024_01_15_001',
})

console.log('Deposit ID:', deposit.id)
console.log('Status:', deposit.status)
console.log('Settlement:', deposit.settlementDate)

// Withdraw with approval workflow
const withdrawal = await arcpay.usdy.withdraw({
  amount: 50000,
  currency: 'USDC',
  destination: 'acc_operating',

  // Reason tracking
  reason: 'Quarterly vendor payments',

  // Priority (affects settlement)
  priority: 'standard', // 'instant' | 'standard' | 'scheduled'

  // Schedule for later
  scheduledFor: new Date('2024-02-01'),

  // Approval workflow (auto-triggered for amounts > threshold)
  approvalWorkflow: {
    requiredApprovers: ['user_cfo', 'user_controller'],
    expiresIn: '48h',
  },
})`,
    hook: `// React hook for deposits and withdrawals
'use client'

import { useState } from 'react'
import { useUSDYOperations } from '@arcpay/b2b/react'

export function DepositWithdrawForm() {
  const [amount, setAmount] = useState('')
  const [operation, setOperation] = useState<'deposit' | 'withdraw'>('deposit')

  const {
    deposit,
    withdraw,
    isDepositing,
    isWithdrawing,
    depositResult,
    withdrawResult,
    error,
  } = useUSDYOperations({
    onDepositSuccess: (result) => {
      console.log('Deposited:', result.amount)
      setAmount('')
    },
    onWithdrawSuccess: (result) => {
      console.log('Withdrawn:', result.amount)
      setAmount('')
    },
    onError: (err) => {
      console.error('Operation failed:', err.message)
    },
  })

  const handleSubmit = async () => {
    const value = parseFloat(amount)
    if (isNaN(value) || value <= 0) return

    if (operation === 'deposit') {
      await deposit({ amount: value, currency: 'USDC' })
    } else {
      await withdraw({ amount: value, currency: 'USDC' })
    }
  }

  const isProcessing = isDepositing || isWithdrawing

  return (
    <div className="operation-form">
      <div className="tabs">
        <button
          className={operation === 'deposit' ? 'active' : ''}
          onClick={() => setOperation('deposit')}
        >
          Deposit
        </button>
        <button
          className={operation === 'withdraw' ? 'active' : ''}
          onClick={() => setOperation('withdraw')}
        >
          Withdraw
        </button>
      </div>

      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount"
        disabled={isProcessing}
      />

      <button onClick={handleSubmit} disabled={isProcessing}>
        {isProcessing
          ? 'Processing...'
          : operation === 'deposit'
          ? 'Deposit to USDY'
          : 'Withdraw from USDY'}
      </button>

      {error && <p className="error">{error.message}</p>}
    </div>
  )
}`,
  },
  'yield-tracking': {
    basic: `// Get yield information
const yieldInfo = await arcpay.usdy.getYield()

console.log('Daily yield:', yieldInfo.dailyYield)
console.log('Monthly yield:', yieldInfo.monthlyYield)
console.log('APY:', yieldInfo.apy + '%')

// Get yield history
const history = await arcpay.usdy.getYieldHistory({
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31'),
})

console.log('Total earned:', history.totalEarned)`,
    full: `// Comprehensive yield tracking
// Get detailed yield breakdown
const yieldInfo = await arcpay.usdy.getYield({
  includeProjections: true,
  includeHistory: true,
  historyDays: 30,
})

console.log('Current APY:', yieldInfo.currentApy)
console.log('7-day average APY:', yieldInfo.averageApy7d)
console.log('30-day average APY:', yieldInfo.averageApy30d)

// Projections
console.log('Projected daily:', yieldInfo.projections.daily)
console.log('Projected monthly:', yieldInfo.projections.monthly)
console.log('Projected annual:', yieldInfo.projections.annual)

// Get APY history for charting
const apyHistory = await arcpay.usdy.getApyHistory({
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31'),
  granularity: 'daily', // 'hourly' | 'daily' | 'weekly'
})

// Returns array of { date, apy, yieldEarned }
apyHistory.dataPoints.forEach((point) => {
  console.log(\`\${point.date}: \${point.apy}% - Earned: $\${point.yieldEarned}\`)
})

// Get tax reporting data
const taxReport = await arcpay.usdy.getTaxReport({
  year: 2024,
  format: 'detailed', // 'summary' | 'detailed'
})

console.log('Total yield:', taxReport.totalYield)
console.log('Cost basis:', taxReport.costBasis)
console.log('Unrealized gains:', taxReport.unrealizedGains)`,
    hook: `// React hook for yield tracking
'use client'

import { useYieldTracking } from '@arcpay/b2b/react'

export function YieldDashboard() {
  const {
    currentYield,
    history,
    projections,
    isLoading,
    refetch,
  } = useYieldTracking({
    historyDays: 30,
    includeProjections: true,
    refreshInterval: 60000, // Refresh every minute
  })

  if (isLoading) return <div>Loading yield data...</div>

  return (
    <div className="yield-dashboard">
      {/* Current Stats */}
      <div className="current-yield">
        <h3>Current Yield</h3>
        <div className="apy">
          <span className="value">{currentYield.apy}%</span>
          <span className="label">APY</span>
        </div>
        <div className="earnings">
          <div>Today: \${currentYield.dailyEarnings.toFixed(2)}</div>
          <div>This Month: \${currentYield.monthlyEarnings.toFixed(2)}</div>
        </div>
      </div>

      {/* Projections */}
      <div className="projections">
        <h3>Projected Earnings</h3>
        <div>Next 30 days: \${projections.next30Days.toFixed(2)}</div>
        <div>Next 12 months: \${projections.next12Months.toFixed(2)}</div>
      </div>

      {/* History Chart */}
      <div className="history-chart">
        <h3>Yield History (30 Days)</h3>
        {history.map((day) => (
          <div key={day.date} className="day-bar">
            <span>{new Date(day.date).toLocaleDateString()}</span>
            <span>{day.apy}%</span>
            <span>\${day.earned.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <button onClick={refetch}>Refresh</button>
    </div>
  )
}`,
  },
  'automation-rules': {
    basic: `// Create an automation rule
const rule = await arcpay.usdy.createAutomationRule({
  name: 'Revenue Split',
  type: 'percentage',
  percentage: 30,
  sourceAccount: 'subscription_revenue',
})

console.log('Rule created:', rule.id)
console.log('Will deposit', rule.percentage + '% automatically')

// List all rules
const rules = await arcpay.usdy.listAutomationRules()
rules.forEach(r => console.log(r.name, r.enabled ? '(active)' : '(paused)'))`,
    full: `// Full automation rule management
// Create percentage-based rule
const percentageRule = await arcpay.usdy.createAutomationRule({
  name: 'Subscription Revenue Split',
  type: 'percentage',
  percentage: 30,

  // Source configuration
  source: {
    account: 'subscription_revenue',
    filter: {
      minAmount: 100, // Only trigger for payments > $100
      planTypes: ['enterprise', 'pro'], // Only specific plans
    },
  },

  // Execution settings
  execution: {
    immediate: true, // Process immediately vs batch
    maxDaily: 50000, // Cap at $50k/day
  },

  // Notifications
  notifications: {
    onTrigger: { email: 'treasury@company.com' },
    dailySummary: true,
  },

  metadata: {
    department: 'Treasury',
    approvedBy: 'CFO',
  },
})

// Create threshold-based sweep rule
const thresholdRule = await arcpay.usdy.createAutomationRule({
  name: 'Balance Threshold Sweep',
  type: 'threshold',

  threshold: {
    trigger: 100000, // Sweep when balance exceeds $100k
    target: 50000,   // Leave $50k in operating account
  },

  source: {
    account: 'operating_balance',
  },

  // Schedule check frequency
  checkFrequency: 'hourly',

  // Cool-down period between sweeps
  cooldown: '24h',
})

// Create scheduled rule
const scheduledRule = await arcpay.usdy.createAutomationRule({
  name: 'Weekly Treasury Transfer',
  type: 'scheduled',

  schedule: {
    cron: '0 9 * * MON', // Every Monday at 9 AM
    timezone: 'America/New_York',
  },

  amount: {
    type: 'percentage',
    value: 20, // 20% of balance
    minimum: 1000, // At least $1k
    maximum: 25000, // Cap at $25k
  },

  source: {
    account: 'operating_balance',
  },
})

// Update rule
await arcpay.usdy.updateAutomationRule('rule_123', {
  enabled: false,
  percentage: 25,
})

// Delete rule
await arcpay.usdy.deleteAutomationRule('rule_123')`,
    hook: `// React hook for automation rules
'use client'

import { useState } from 'react'
import { useAutomationRules } from '@arcpay/b2b/react'

export function AutomationManager() {
  const {
    rules,
    isLoading,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    isCreating,
    isUpdating,
  } = useAutomationRules()

  const [showCreateModal, setShowCreateModal] = useState(false)

  if (isLoading) return <div>Loading rules...</div>

  const handleCreatePercentageRule = async () => {
    await createRule({
      name: 'New Revenue Split',
      type: 'percentage',
      percentage: 25,
      sourceAccount: 'subscription_revenue',
    })
    setShowCreateModal(false)
  }

  return (
    <div className="automation-manager">
      <div className="header">
        <h2>Automation Rules</h2>
        <button onClick={() => setShowCreateModal(true)}>
          Create Rule
        </button>
      </div>

      <div className="rules-list">
        {rules.map((rule) => (
          <div key={rule.id} className="rule-card">
            <div className="rule-info">
              <h3>{rule.name}</h3>
              <p>{rule.description}</p>
              <div className="stats">
                <span>Type: {rule.type}</span>
                {rule.percentage && <span>{rule.percentage}%</span>}
                {rule.threshold && <span>Threshold: \${rule.threshold}</span>}
                <span>Total deposited: \${rule.totalDeposited}</span>
              </div>
            </div>

            <div className="rule-actions">
              <button
                onClick={() => toggleRule(rule.id, !rule.enabled)}
                className={rule.enabled ? 'active' : 'inactive'}
              >
                {rule.enabled ? 'Enabled' : 'Disabled'}
              </button>
              <button onClick={() => deleteRule(rule.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {rules.length === 0 && (
        <div className="empty-state">
          <p>No automation rules configured</p>
          <button onClick={() => setShowCreateModal(true)}>
            Create your first rule
          </button>
        </div>
      )}
    </div>
  )
}`,
  },
  webhooks: {
    basic: `// Webhook endpoint for USDY events
// app/api/webhooks/usdy/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { ArcPayB2B } from '@arcpay/b2b'

const arcpay = new ArcPayB2B({ apiKey: process.env.ARCPAY_API_KEY! })

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('x-arcpay-signature')!

  const event = arcpay.webhooks.verify(body, signature)

  switch (event.type) {
    case 'usdy.yield.accrued':
      console.log('Yield earned:', event.data.amount)
      break
    case 'usdy.deposit.completed':
      console.log('Deposit completed:', event.data.amount)
      break
  }

  return NextResponse.json({ received: true })
}`,
    full: `// Full webhook handling for USDY
// app/api/webhooks/usdy/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { ArcPayB2B, USDYEvent } from '@arcpay/b2b'

const arcpay = new ArcPayB2B({ apiKey: process.env.ARCPAY_API_KEY! })
const WEBHOOK_SECRET = process.env.ARCPAY_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('x-arcpay-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: USDYEvent

  try {
    event = arcpay.webhooks.verify(body, signature, WEBHOOK_SECRET)
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'usdy.yield.accrued':
        await handleYieldAccrued(event.data)
        break

      case 'usdy.deposit.completed':
        await handleDepositCompleted(event.data)
        break

      case 'usdy.deposit.failed':
        await handleDepositFailed(event.data)
        break

      case 'usdy.withdrawal.completed':
        await handleWithdrawalCompleted(event.data)
        break

      case 'usdy.automation.triggered':
        await handleAutomationTriggered(event.data)
        break

      case 'usdy.apy.changed':
        await handleApyChanged(event.data)
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}

async function handleYieldAccrued(data) {
  // Update accounting records
  await db.yieldTransactions.create({
    amount: data.amount,
    date: data.accrualDate,
    apy: data.apy,
    balance: data.balanceAfter,
  })

  // Send daily digest if configured
  if (shouldSendDigest()) {
    await sendYieldDigest(data)
  }
}

async function handleAutomationTriggered(data) {
  // Log automation execution
  await db.automationLogs.create({
    ruleId: data.ruleId,
    ruleName: data.ruleName,
    amount: data.amount,
    source: data.sourceAccount,
    triggeredAt: data.timestamp,
  })

  // Notify treasury team
  await notifyTreasury({
    type: 'automation_triggered',
    rule: data.ruleName,
    amount: data.amount,
  })
}`,
    hook: `// React hook for real-time USDY events
'use client'

import { useUSDYEvents } from '@arcpay/b2b/react'

export function USDYActivityFeed() {
  const {
    events,
    isConnected,
    lastEvent,
  } = useUSDYEvents({
    types: [
      'usdy.yield.accrued',
      'usdy.deposit.completed',
      'usdy.automation.triggered',
    ],
    onEvent: (event) => {
      console.log('New event:', event.type)
    },
    onYieldAccrued: (data) => {
      showNotification(\`Yield earned: $\${data.amount.toFixed(2)}\`)
    },
    onDepositCompleted: (data) => {
      showNotification(\`Deposit completed: $\${data.amount}\`)
    },
    onAutomationTriggered: (data) => {
      showNotification(\`\${data.ruleName} triggered: $\${data.amount}\`)
    },
  })

  return (
    <div className="activity-feed">
      <div className="status">
        {isConnected ? 'Connected' : 'Disconnected'}
      </div>

      <ul>
        {events.map((event) => (
          <li key={event.id}>
            <span className="type">{event.type}</span>
            <span className="time">
              {new Date(event.timestamp).toLocaleTimeString()}
            </span>
            <span className="details">
              {event.type === 'usdy.yield.accrued' && (
                <>Yield: \${event.data.amount.toFixed(2)}</>
              )}
              {event.type === 'usdy.deposit.completed' && (
                <>Deposited: \${event.data.amount}</>
              )}
              {event.type === 'usdy.automation.triggered' && (
                <>{event.data.ruleName}: \${event.data.amount}</>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}`,
  },
};
