import type { SectionId, CodeTab } from './types';

export const codeExamples: Record<SectionId, Record<CodeTab, string>> = {
  'getting-started': {
    basic: `// Initialize API Credits
import { ArcPayCredits } from '@arcpay/credits'

const credits = new ArcPayCredits({
  apiKey: process.env.ARCPAY_API_KEY!,
  organizationId: 'org_your_org_id',
})

// Check a customer's balance
const account = await credits.accounts.get('cust_acme_corp')

console.log('Balance:', account.balance, account.currency)
console.log('Total spent:', account.totalSpent)`,
    full: `// Full credits configuration
import { ArcPayCredits } from '@arcpay/credits'

const credits = new ArcPayCredits({
  apiKey: process.env.ARCPAY_API_KEY!,
  organizationId: 'org_your_org_id',
  environment: 'production',

  // Default settings
  defaults: {
    currency: 'USDC',
    lowBalanceThreshold: 10,
    autoCreateAccounts: true,
  },

  // Webhook configuration
  webhooks: {
    secret: process.env.ARCPAY_WEBHOOK_SECRET,
    events: [
      'credits.low_balance',
      'credits.deposited',
      'credits.depleted',
    ],
  },

  // Rate limiting
  rateLimit: {
    requestsPerMinute: 1000,
    burstLimit: 100,
  },

  // Logging
  logging: {
    level: 'info',
    logRequests: true,
    logTransactions: true,
  },
})

// Initialize and verify connection
await credits.initialize()
console.log('Credits system initialized')`,
    hook: `// React hook for credits dashboard
'use client'

import { useCreditsOverview } from '@arcpay/credits/react'

export function CreditsDashboard() {
  const {
    stats,
    accounts,
    endpoints,
    recentTransactions,
    isLoading,
    error,
    refetch,
  } = useCreditsOverview()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div className="credits-dashboard">
      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat">
          <span className="label">Total Revenue (30d)</span>
          <span className="value">\${stats.totalRevenue.toLocaleString()}</span>
        </div>
        <div className="stat">
          <span className="label">API Requests (30d)</span>
          <span className="value">{stats.totalRequests.toLocaleString()}</span>
        </div>
        <div className="stat">
          <span className="label">Active Accounts</span>
          <span className="value">{stats.activeAccounts}</span>
        </div>
        <div className="stat">
          <span className="label">Success Rate</span>
          <span className="value">{stats.successRate}%</span>
        </div>
      </div>

      {/* Endpoints List */}
      <div className="endpoints-list">
        <h3>Monetized Endpoints</h3>
        {endpoints.map((ep) => (
          <div key={ep.id} className="endpoint">
            <span className="method">{ep.method}</span>
            <span className="path">{ep.path}</span>
            <span className="price">\${ep.pricePerCall}</span>
          </div>
        ))}
      </div>
    </div>
  )
}`,
  },
  endpoints: {
    basic: `// Create a monetized endpoint
const endpoint = await credits.endpoints.create({
  path: '/api/v1/analyze',
  method: 'POST',
  pricePerCall: 0.05,
  currency: 'USDC',
  name: 'Content Analysis',
})

console.log('Endpoint created:', endpoint.id)

// List all endpoints
const endpoints = await credits.endpoints.list()
endpoints.forEach(ep => {
  console.log(\`\${ep.method} \${ep.path}: $\${ep.pricePerCall}\`)
})`,
    full: `// Full endpoint configuration
// Create endpoint with rate limiting
const endpoint = await credits.endpoints.create({
  path: '/api/v1/generate',
  method: 'POST',
  pricePerCall: 0.10,
  currency: 'USDC',
  name: 'AI Generation',
  description: 'Generate content using AI models',

  // Rate limiting per customer
  rateLimit: {
    perMinute: 30,
    perHour: 500,
    perDay: 5000,
  },

  // Metadata for tracking
  metadata: {
    category: 'ai',
    tier: 'premium',
    model: 'gpt-4',
  },
})

// Create wildcard endpoint (matches /api/v1/data/*)
const wildcardEndpoint = await credits.endpoints.create({
  path: '/api/v1/data/*',
  method: '*', // Match all methods
  pricePerCall: 0.01,
  name: 'Data Access',
  description: 'Access to all data endpoints',
})

// Update endpoint pricing
await credits.endpoints.update(endpoint.id, {
  pricePerCall: 0.12,
  active: true,
})

// Get endpoint statistics
const stats = await credits.endpoints.getStats(endpoint.id, {
  period: '30d',
})

console.log('Calls:', stats.totalCalls)
console.log('Revenue:', stats.totalRevenue)
console.log('Avg response time:', stats.avgResponseTime)

// Disable endpoint
await credits.endpoints.update(endpoint.id, {
  active: false,
})`,
    hook: `// React hook for endpoint management
'use client'

import { useState } from 'react'
import { useCreditEndpoints } from '@arcpay/credits/react'

export function EndpointsManager() {
  const {
    endpoints,
    isLoading,
    createEndpoint,
    updateEndpoint,
    deleteEndpoint,
    isCreating,
  } = useCreditEndpoints()

  const [newEndpoint, setNewEndpoint] = useState({
    path: '',
    method: 'POST',
    pricePerCall: '0.01',
    name: '',
  })

  const handleCreate = async () => {
    await createEndpoint({
      ...newEndpoint,
      pricePerCall: parseFloat(newEndpoint.pricePerCall),
    })
    setNewEndpoint({ path: '', method: 'POST', pricePerCall: '0.01', name: '' })
  }

  if (isLoading) return <div>Loading endpoints...</div>

  return (
    <div className="endpoints-manager">
      {/* Create Form */}
      <div className="create-form">
        <select
          value={newEndpoint.method}
          onChange={(e) => setNewEndpoint({ ...newEndpoint, method: e.target.value })}
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
          <option value="*">ALL</option>
        </select>
        <input
          placeholder="/api/v1/endpoint"
          value={newEndpoint.path}
          onChange={(e) => setNewEndpoint({ ...newEndpoint, path: e.target.value })}
        />
        <input
          type="number"
          step="0.01"
          placeholder="Price per call"
          value={newEndpoint.pricePerCall}
          onChange={(e) => setNewEndpoint({ ...newEndpoint, pricePerCall: e.target.value })}
        />
        <button onClick={handleCreate} disabled={isCreating}>
          {isCreating ? 'Creating...' : 'Add Endpoint'}
        </button>
      </div>

      {/* Endpoints List */}
      <div className="endpoints-list">
        {endpoints.map((endpoint) => (
          <div key={endpoint.id} className="endpoint-item">
            <div className="endpoint-info">
              <span className="method">{endpoint.method}</span>
              <span className="path">{endpoint.path}</span>
              <span className="price">\${endpoint.pricePerCall.toFixed(2)}/call</span>
            </div>
            <div className="endpoint-stats">
              <span>{endpoint.stats30d?.calls || 0} calls</span>
              <span>\${endpoint.stats30d?.revenue || 0} revenue</span>
            </div>
            <div className="endpoint-actions">
              <button onClick={() => updateEndpoint(endpoint.id, { active: !endpoint.active })}>
                {endpoint.active ? 'Pause' : 'Enable'}
              </button>
              <button onClick={() => deleteEndpoint(endpoint.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}`,
  },
  accounts: {
    basic: `// Create a customer credit account
const account = await credits.accounts.create({
  externalCustomerId: 'cust_acme_corp',
  initialBalance: 100,
  currency: 'USDC',
})

console.log('Account created:', account.id)
console.log('Balance:', account.balance)

// Deposit credits
const deposit = await credits.accounts.deposit(account.id, {
  amount: 50,
  description: 'Customer payment',
})

console.log('New balance:', deposit.balanceAfter)`,
    full: `// Full account management
// Create account with full configuration
const account = await credits.accounts.create({
  externalCustomerId: 'cust_enterprise_001',
  initialBalance: 500,
  currency: 'USDC',

  // Low balance alerts
  lowBalanceThreshold: 50,

  // Auto top-up configuration
  autoTopup: {
    enabled: true,
    triggerAmount: 25,   // Top up when balance falls below $25
    topupAmount: 100,    // Add $100 each time
    walletAddress: '0x...', // Customer's wallet for charges
  },

  // Link to your customer system
  customerId: 'your_internal_customer_id',

  // Custom metadata
  metadata: {
    plan: 'enterprise',
    company: 'Acme Corp',
    contactEmail: 'billing@acme.com',
  },
})

// Deposit with transaction details
const deposit = await credits.accounts.deposit(account.id, {
  amount: 250,
  type: 'deposit',
  description: 'Monthly credit purchase',

  // On-chain payment info (if applicable)
  txHash: '0x1234...',
  payerAddress: '0xabc...',
  chain: 'base',

  // Tracking
  metadata: {
    invoiceId: 'inv_123',
    paymentMethod: 'crypto',
  },
})

// Add promotional bonus
await credits.accounts.deposit(account.id, {
  amount: 25,
  type: 'bonus',
  description: 'Welcome bonus',
})

// Get account with transaction history
const details = await credits.accounts.get(account.id, {
  includeTransactions: true,
  transactionLimit: 50,
})

console.log('Balance:', details.balance)
console.log('Recent transactions:', details.transactions.length)

// Suspend account (e.g., for non-payment)
await credits.accounts.suspend(account.id, {
  reason: 'Failed payment verification',
})

// Reactivate account
await credits.accounts.activate(account.id)

// List accounts with filters
const accounts = await credits.accounts.list({
  active: true,
  lowBalance: true, // Only accounts below threshold
  search: 'acme',
  limit: 50,
})`,
    hook: `// React hook for account management
'use client'

import { useState } from 'react'
import { useCreditAccounts } from '@arcpay/credits/react'

export function AccountsManager() {
  const {
    accounts,
    total,
    isLoading,
    createAccount,
    depositCredits,
    suspendAccount,
    fetchAccounts,
  } = useCreditAccounts()

  const [selectedAccount, setSelectedAccount] = useState(null)
  const [depositAmount, setDepositAmount] = useState('100')

  const handleDeposit = async (accountId: string) => {
    await depositCredits(accountId, {
      amount: parseFloat(depositAmount),
      type: 'deposit',
      description: 'Manual deposit',
    })
    setDepositAmount('100')
  }

  if (isLoading) return <div>Loading accounts...</div>

  return (
    <div className="accounts-manager">
      <div className="accounts-header">
        <h2>Customer Credit Accounts</h2>
        <span className="total">
          Total Balance: \${accounts.reduce((sum, a) => sum + a.balance, 0).toFixed(2)}
        </span>
      </div>

      <div className="accounts-list">
        {accounts.map((account) => (
          <div key={account.id} className="account-card">
            <div className="account-info">
              <h3>{account.externalCustomerId}</h3>
              <div className="stats">
                <span>{account.totalRequests.toLocaleString()} requests</span>
                <span>\${account.totalSpent.toFixed(2)} spent</span>
              </div>
            </div>

            <div className="account-balance">
              <span className={\`balance \${account.balance < account.lowBalanceThreshold ? 'low' : ''}\`}>
                \${account.balance.toFixed(2)}
              </span>
              {account.balance < account.lowBalanceThreshold && (
                <span className="warning">Low balance</span>
              )}
            </div>

            <div className="account-actions">
              <div className="deposit-form">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Amount"
                />
                <button onClick={() => handleDeposit(account.id)}>
                  Add Credits
                </button>
              </div>
              <button
                className="suspend"
                onClick={() => suspendAccount(account.id)}
              >
                {account.active ? 'Suspend' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {accounts.length === 0 && (
        <div className="empty-state">
          <p>No credit accounts yet</p>
          <p>Accounts are auto-created when customers make their first API call</p>
        </div>
      )}
    </div>
  )
}`,
  },
  middleware: {
    basic: `// Protect API routes with credits middleware
// app/api/v1/analyze/route.ts

import { NextResponse } from 'next/server'
import { withCredits } from '@arcpay/credits/nextjs'

export const POST = withCredits()(async (req, { credits }) => {
  // Credits already deducted at this point
  const body = await req.json()

  // Your API logic here
  const result = await analyzeContent(body.content)

  return NextResponse.json({
    data: result,
    billing: {
      charged: credits.amount,
      balance: credits.balanceAfter,
    },
  })
})`,
    full: `// Full middleware configuration
// lib/credits-middleware.ts

import { createCreditsMiddleware } from '@arcpay/credits/nextjs'
import { createClient } from '@/lib/supabase/server'

export const withCredits = createCreditsMiddleware({
  // Database adapter
  async getDb() {
    return createClient()
  },

  // Organization ID (from env or context)
  organizationId: process.env.ARCPAY_ORG_ID!,

  // Customer identification
  getCustomerId: async (req) => {
    // Try API key first
    const apiKey = req.headers.get('x-api-key')
    if (apiKey) {
      const customer = await lookupCustomerByApiKey(apiKey)
      return customer?.externalId
    }

    // Fall back to header
    return req.headers.get('x-customer-id')
  },

  // Auto-create accounts for new customers
  autoCreateAccounts: true,

  // Skip billing for certain requests
  skipIf: async (req) => {
    // Skip health checks
    if (req.path === '/api/health') return true

    // Skip for internal requests
    if (req.headers.get('x-internal-request')) return true

    return false
  },

  // Callbacks
  onDeduction: async (info) => {
    console.log(\`Charged \${info.amount} to \${info.externalCustomerId}\`)

    // Send to analytics
    await analytics.track('api_call_charged', {
      customerId: info.externalCustomerId,
      amount: info.amount,
      endpoint: info.endpoint,
    })
  },

  onInsufficientCredits: async (info) => {
    console.log(\`Insufficient credits: \${info.externalCustomerId}\`)

    // Send notification to customer
    await sendLowBalanceEmail(info.externalCustomerId, info.balance)
  },

  // Error handling
  onError: async (error, req) => {
    console.error('Credits middleware error:', error)
    await reportError(error, { path: req.path })
  },

  // Custom top-up URL
  topUpUrl: '/billing/add-credits',

  // Enable usage logging
  logUsage: true,
})

// Usage in route
// app/api/v1/generate/route.ts

import { withCredits } from '@/lib/credits-middleware'

export const POST = withCredits({
  // Override settings for this endpoint
  dynamicPrice: async (req) => {
    const body = await req.json()
    // Price based on request size
    return body.tokens > 1000 ? 0.20 : 0.10
  },
})(async (req, { credits }) => {
  const body = await req.json()
  const result = await generateContent(body)

  return NextResponse.json({
    data: result,
    usage: {
      transactionId: credits.transactionId,
      charged: credits.amount,
      remainingBalance: credits.balanceAfter,
    },
  })
})`,
    hook: `// Express middleware for Node.js
import express from 'express'
import { creditsMiddleware, createCreditsClient } from '@arcpay/credits'
import { createClient } from '@supabase/supabase-js'

const app = express()

// Initialize credits client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)
const creditsDb = createCreditsClient(supabase)

// Apply middleware to all /api/v1/* routes
app.use('/api/v1/*', creditsMiddleware({
  db: creditsDb,
  organizationId: process.env.ORG_ID!,

  getCustomerId: (req) => {
    return req.headers['x-customer-id'] as string
  },

  onDeduction: async (info) => {
    console.log(\`Charged \${info.amount} for \${info.method} \${info.endpoint}\`)
  },

  onInsufficientCredits: async (info) => {
    console.log(\`Customer \${info.externalCustomerId} has insufficient credits\`)
  },
}))

// Protected endpoint
app.post('/api/v1/analyze', async (req, res) => {
  // req.credits contains payment info
  const { accountId, amount, balanceAfter } = req.credits

  const result = await analyzeContent(req.body.content)

  res.json({
    data: result,
    billing: {
      charged: amount,
      remainingBalance: balanceAfter,
    },
  })
})

// Unprotected endpoint (not under /api/v1/*)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(3000, () => {
  console.log('Server running on port 3000')
})`,
  },
  usage: {
    basic: `// Get usage statistics
const stats = await credits.usage.getStats({
  period: '30d',
})

console.log('Total requests:', stats.totalRequests)
console.log('Total revenue:', stats.totalRevenue)
console.log('Success rate:', stats.successRate + '%')

// Get usage by endpoint
const byEndpoint = await credits.usage.byEndpoint({
  period: '30d',
  limit: 10,
})

byEndpoint.forEach(ep => {
  console.log(\`\${ep.path}: \${ep.requests} requests, $\${ep.revenue}\`)
})`,
    full: `// Comprehensive usage analytics
// Get detailed stats with filters
const stats = await credits.usage.getStats({
  period: '30d',
  accountId: 'acc_specific_customer', // Filter by customer
  endpointId: 'ep_specific_endpoint', // Filter by endpoint
})

console.log('Summary:', {
  totalRequests: stats.summary.totalRequests,
  totalRevenue: stats.summary.totalRevenue,
  avgResponseTime: stats.summary.avgResponseTime,
  successRate: stats.summary.successRate,
  errorCount: stats.summary.errorCount,
})

// Daily breakdown for charting
stats.daily.forEach(day => {
  console.log(\`\${day.date}: \${day.requests} requests, $\${day.revenue}\`)
})

// Top endpoints by revenue
stats.byEndpoint.forEach(ep => {
  console.log(\`\${ep.method} \${ep.path}: \${ep.requests} calls, $\${ep.revenue}\`)
})

// Get customer rankings
const topCustomers = await credits.usage.topCustomers({
  period: '30d',
  sortBy: 'revenue', // or 'requests'
  limit: 10,
})

topCustomers.forEach((customer, i) => {
  console.log(\`#\${i + 1}: \${customer.externalCustomerId}\`)
  console.log(\`   Revenue: $\${customer.revenue}\`)
  console.log(\`   Requests: \${customer.requests}\`)
})

// Export usage data
const exportData = await credits.usage.export({
  period: '30d',
  format: 'csv', // or 'json'
  includeTransactions: true,
})

// Generate invoice data
const invoiceData = await credits.usage.generateInvoice({
  accountId: 'acc_customer_id',
  period: {
    start: new Date('2024-01-01'),
    end: new Date('2024-01-31'),
  },
})

console.log('Invoice total:', invoiceData.total)
console.log('Line items:', invoiceData.lineItems.length)`,
    hook: `// React hook for usage analytics
'use client'

import { useUsageStats, useUsageChart } from '@arcpay/credits/react'

export function UsageAnalytics() {
  const {
    stats,
    isLoading,
    refetch,
  } = useUsageStats({
    period: '30d',
    refreshInterval: 60000, // Refresh every minute
  })

  const {
    chartData,
    isLoading: chartLoading,
  } = useUsageChart({
    period: '30d',
    granularity: 'daily',
  })

  if (isLoading) return <div>Loading analytics...</div>

  return (
    <div className="usage-analytics">
      {/* Summary Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="label">Total Revenue</span>
          <span className="value">\${stats.summary.totalRevenue.toLocaleString()}</span>
        </div>
        <div className="stat-card">
          <span className="label">API Requests</span>
          <span className="value">{stats.summary.totalRequests.toLocaleString()}</span>
        </div>
        <div className="stat-card">
          <span className="label">Success Rate</span>
          <span className="value">{stats.summary.successRate}%</span>
        </div>
        <div className="stat-card">
          <span className="label">Avg Response Time</span>
          <span className="value">{stats.summary.avgResponseTime}ms</span>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="chart-container">
        <h3>Revenue Over Time</h3>
        <div className="chart">
          {chartData.map((point, i) => (
            <div
              key={i}
              className="chart-bar"
              style={{ height: \`\${(point.revenue / chartData.maxRevenue) * 100}%\` }}
              title={\`\${point.date}: $\${point.revenue}\`}
            />
          ))}
        </div>
      </div>

      {/* Top Endpoints */}
      <div className="top-endpoints">
        <h3>Top Endpoints by Revenue</h3>
        {stats.byEndpoint.slice(0, 5).map((ep) => (
          <div key={ep.endpointId} className="endpoint-row">
            <span className="method">{ep.method}</span>
            <span className="path">{ep.path}</span>
            <span className="requests">{ep.requests.toLocaleString()} calls</span>
            <span className="revenue">\${ep.revenue.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <button onClick={refetch}>Refresh</button>
    </div>
  )
}`,
  },
  webhooks: {
    basic: `// Webhook handler for credit events
// app/api/webhooks/credits/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { ArcPayCredits } from '@arcpay/credits'

const credits = new ArcPayCredits({ apiKey: process.env.ARCPAY_API_KEY! })

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('x-arcpay-signature')!

  const event = credits.webhooks.verify(body, signature)

  switch (event.type) {
    case 'credits.low_balance':
      console.log('Low balance:', event.data.accountId)
      break
    case 'credits.deposited':
      console.log('Deposit:', event.data.amount)
      break
    case 'credits.depleted':
      console.log('Account depleted:', event.data.accountId)
      break
  }

  return NextResponse.json({ received: true })
}`,
    full: `// Full webhook handling
// app/api/webhooks/credits/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { ArcPayCredits, CreditEvent } from '@arcpay/credits'

const credits = new ArcPayCredits({ apiKey: process.env.ARCPAY_API_KEY! })
const WEBHOOK_SECRET = process.env.ARCPAY_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('x-arcpay-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: CreditEvent

  try {
    event = credits.webhooks.verify(body, signature, WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'credits.low_balance':
        await handleLowBalance(event.data)
        break

      case 'credits.deposited':
        await handleDeposit(event.data)
        break

      case 'credits.depleted':
        await handleDepleted(event.data)
        break

      case 'credits.auto_topup_triggered':
        await handleAutoTopup(event.data)
        break

      case 'credits.auto_topup_failed':
        await handleAutoTopupFailed(event.data)
        break

      case 'credits.account_suspended':
        await handleAccountSuspended(event.data)
        break

      case 'credits.usage_spike':
        await handleUsageSpike(event.data)
        break

      default:
        console.log('Unhandled event type:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}

async function handleLowBalance(data: {
  accountId: string
  externalCustomerId: string
  balance: number
  threshold: number
}) {
  // Send low balance notification
  await sendEmail({
    to: await getCustomerEmail(data.externalCustomerId),
    template: 'low-balance',
    data: {
      balance: data.balance,
      threshold: data.threshold,
      topUpUrl: \`\${process.env.APP_URL}/billing/add-credits\`,
    },
  })

  // Update CRM
  await updateCRM(data.externalCustomerId, {
    lowBalanceAlert: true,
    lastAlertAt: new Date(),
  })
}

async function handleDepleted(data: {
  accountId: string
  externalCustomerId: string
}) {
  // Send urgent notification
  await sendUrgentNotification({
    customerId: data.externalCustomerId,
    message: 'Your API credits have been depleted. Add credits to continue.',
  })

  // Log for monitoring
  await logEvent('credits_depleted', {
    accountId: data.accountId,
    customerId: data.externalCustomerId,
    timestamp: new Date(),
  })
}

async function handleAutoTopup(data: {
  accountId: string
  amount: number
  txHash: string
  newBalance: number
}) {
  // Log successful auto top-up
  console.log(\`Auto top-up: $\${data.amount}, new balance: $\${data.newBalance}\`)

  // Send confirmation
  await sendEmail({
    template: 'auto-topup-success',
    data: {
      amount: data.amount,
      txHash: data.txHash,
      newBalance: data.newBalance,
    },
  })
}`,
    hook: `// React hook for real-time credit events
'use client'

import { useCreditEvents } from '@arcpay/credits/react'
import { toast } from 'sonner'

export function CreditEventsMonitor() {
  const {
    events,
    isConnected,
    connectionStatus,
  } = useCreditEvents({
    // Event types to listen for
    types: [
      'credits.deposited',
      'credits.low_balance',
      'credits.depleted',
      'credits.usage_spike',
    ],

    // Callbacks for specific events
    onDeposit: (data) => {
      toast.success(\`Deposit received: $\${data.amount}\`)
    },

    onLowBalance: (data) => {
      toast.warning(\`Low balance alert: $\${data.balance} remaining\`)
    },

    onDepleted: (data) => {
      toast.error('Credits depleted! Add credits to continue.')
    },

    onUsageSpike: (data) => {
      toast.info(\`Usage spike detected: \${data.requestsPerMinute} req/min\`)
    },

    // Generic event handler
    onEvent: (event) => {
      console.log('Credit event:', event.type, event.data)
    },

    // Connection handlers
    onConnect: () => {
      console.log('Connected to credit events')
    },

    onDisconnect: () => {
      console.log('Disconnected from credit events')
    },
  })

  return (
    <div className="events-monitor">
      <div className="connection-status">
        <span className={\`indicator \${isConnected ? 'connected' : 'disconnected'}\`} />
        <span>{connectionStatus}</span>
      </div>

      <div className="events-list">
        <h3>Recent Events</h3>
        {events.length === 0 ? (
          <p className="empty">No events yet</p>
        ) : (
          <ul>
            {events.map((event) => (
              <li key={event.id} className={\`event \${event.type}\`}>
                <span className="type">{event.type}</span>
                <span className="time">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
                <span className="details">
                  {event.type === 'credits.deposited' && (
                    <>Deposit: \${event.data.amount}</>
                  )}
                  {event.type === 'credits.low_balance' && (
                    <>Balance: \${event.data.balance}</>
                  )}
                  {event.type === 'credits.depleted' && (
                    <>Account: {event.data.externalCustomerId}</>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}`,
  },
};
