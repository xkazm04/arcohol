import type { SectionId, CodeTab } from './types';

export const codeExamples: Record<SectionId, Record<CodeTab, string>> = {
  'getting-started': {
    basic: `// Initialize the ArcPay B2B SDK
import { ArcPayB2B } from '@arcpay/b2b'

const arcpay = new ArcPayB2B({
  apiKey: process.env.ARCPAY_API_KEY!,
  environment: 'sandbox',
})

// Create a subscription plan
const plan = await arcpay.subscriptions.createPlan({
  name: 'Pro Plan',
  amount: 99,
  currency: 'USDC',
  interval: 'monthly',
})

console.log('Plan created:', plan.id)`,
    full: `// Full subscription configuration
import { ArcPayB2B } from '@arcpay/b2b'

const arcpay = new ArcPayB2B({
  apiKey: process.env.ARCPAY_API_KEY!,
  environment: 'production',
  webhookSecret: process.env.ARCPAY_WEBHOOK_SECRET,
})

// Create a plan with usage-based pricing
const plan = await arcpay.subscriptions.createPlan({
  name: 'Enterprise API',
  description: 'Unlimited API access with usage-based billing',

  // Base subscription fee
  amount: 299,
  currency: 'USDC',
  interval: 'monthly',

  // Usage-based pricing tiers
  usageType: 'metered',
  meters: [
    {
      name: 'api_calls',
      displayName: 'API Calls',
      aggregation: 'sum',
      tiers: [
        { upTo: 10000, unitAmount: 0 },      // First 10k free
        { upTo: 100000, unitAmount: 0.001 }, // $0.001/call
        { upTo: null, unitAmount: 0.0005 },  // Volume discount
      ],
    },
  ],

  // Trial settings
  trialDays: 14,
  trialRequiresPaymentMethod: true,

  // Metadata for your system
  metadata: {
    tier: 'enterprise',
    features: ['unlimited_api', 'priority_support', 'sla'],
  },
})`,
    hook: `// React hook for subscription plans
'use client'

import { useSubscriptionPlans } from '@arcpay/b2b/react'

export function PricingPage() {
  const {
    plans,
    isLoading,
    error,
    createPlan,
    updatePlan,
    deletePlan,
  } = useSubscriptionPlans()

  if (isLoading) return <div>Loading plans...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div className="pricing-grid">
      {plans.map((plan) => (
        <div key={plan.id} className="plan-card">
          <h3>{plan.name}</h3>
          <div className="price">
            \${plan.amount}/{plan.interval}
          </div>
          <p>{plan.description}</p>
          {plan.trialDays && (
            <span className="trial">{plan.trialDays} day trial</span>
          )}
        </div>
      ))}
    </div>
  )
}`,
  },
  'create-subscription': {
    basic: `// Create a subscription for a customer
const subscription = await arcpay.subscriptions.create({
  customerId: 'cus_abc123',
  planId: 'plan_pro_monthly',
})

console.log('Subscription created:', subscription.id)
console.log('Status:', subscription.status) // => 'active'`,
    full: `// Create subscription with full options
const subscription = await arcpay.subscriptions.create({
  // Customer reference
  customerId: 'cus_abc123',
  planId: 'plan_enterprise',

  // Override plan defaults
  quantity: 5, // 5 seats

  // Billing details
  billingCycleAnchor: new Date('2024-02-01'),
  prorationBehavior: 'create_prorations',

  // Payment collection
  collectionMethod: 'charge_automatically',
  paymentMethodId: 'pm_xyz789',

  // Trial period (overrides plan default)
  trialEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),

  // Discounts
  couponId: 'LAUNCH20', // 20% off

  // Metadata
  metadata: {
    salesRep: 'john@company.com',
    contractId: 'CNT-2024-001',
  },
})

console.log('Subscription:', subscription.id)
console.log('Current period:', subscription.currentPeriodStart, '-', subscription.currentPeriodEnd)
console.log('Next invoice:', subscription.upcomingInvoice?.amountDue)`,
    hook: `// React hook for creating subscriptions
'use client'

import { useState } from 'react'
import { useCreateSubscription } from '@arcpay/b2b/react'

export function SubscribeButton({ customerId, planId }) {
  const [quantity, setQuantity] = useState(1)

  const {
    subscribe,
    isLoading,
    error,
    subscription,
  } = useCreateSubscription({
    onSuccess: (sub) => {
      console.log('Subscribed!', sub.id)
      // Redirect to success page
    },
    onError: (err) => {
      console.error('Failed:', err.message)
    },
  })

  const handleSubscribe = async () => {
    await subscribe({
      customerId,
      planId,
      quantity,
    })
  }

  return (
    <div>
      <label>
        Seats:
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
      </label>

      <button onClick={handleSubscribe} disabled={isLoading}>
        {isLoading ? 'Processing...' : 'Subscribe Now'}
      </button>

      {error && <p className="error">{error.message}</p>}
      {subscription && <p>Success! ID: {subscription.id}</p>}
    </div>
  )
}`,
  },
  'manage-subscriptions': {
    basic: `// Update a subscription
await arcpay.subscriptions.update('sub_xyz789', {
  planId: 'plan_enterprise', // Upgrade plan
  quantity: 10, // Add more seats
})

// Pause a subscription
await arcpay.subscriptions.pause('sub_xyz789')

// Cancel a subscription
await arcpay.subscriptions.cancel('sub_xyz789', {
  cancelAtPeriodEnd: true, // Cancel at end of billing period
})`,
    full: `// Full subscription management
// List all subscriptions
const subscriptions = await arcpay.subscriptions.list({
  customerId: 'cus_abc123',
  status: 'active',
  limit: 10,
})

// Get a specific subscription
const subscription = await arcpay.subscriptions.retrieve('sub_xyz789', {
  expand: ['customer', 'plan', 'upcomingInvoice'],
})

// Update subscription
const updated = await arcpay.subscriptions.update('sub_xyz789', {
  planId: 'plan_enterprise',
  quantity: 10,
  prorationBehavior: 'always_invoice',
  metadata: { upgraded: true },
})

// Pause subscription (keeps customer but stops billing)
await arcpay.subscriptions.pause('sub_xyz789', {
  pauseCollection: {
    behavior: 'mark_uncollectible',
    resumesAt: new Date('2024-03-01'),
  },
})

// Resume subscription
await arcpay.subscriptions.resume('sub_xyz789')

// Cancel with options
await arcpay.subscriptions.cancel('sub_xyz789', {
  cancelAtPeriodEnd: true,
  cancellationDetails: {
    reason: 'customer_request',
    feedback: 'Too expensive',
  },
})

// Preview upcoming invoice
const preview = await arcpay.subscriptions.previewInvoice('sub_xyz789', {
  planId: 'plan_enterprise', // Preview plan change
})
console.log('Prorated amount:', preview.amountDue)`,
    hook: `// React hook for subscription management
'use client'

import { useSubscription } from '@arcpay/b2b/react'

export function SubscriptionManager({ subscriptionId }) {
  const {
    subscription,
    isLoading,
    error,
    update,
    pause,
    resume,
    cancel,
    isUpdating,
    isPausing,
    isCancelling,
  } = useSubscription(subscriptionId)

  if (isLoading) return <div>Loading...</div>
  if (!subscription) return <div>Not found</div>

  const handleUpgrade = async () => {
    await update({
      planId: 'plan_enterprise',
      prorationBehavior: 'create_prorations',
    })
  }

  const handleCancel = async () => {
    if (confirm('Cancel subscription?')) {
      await cancel({ cancelAtPeriodEnd: true })
    }
  }

  return (
    <div className="subscription-card">
      <h3>{subscription.plan.name}</h3>
      <p>Status: {subscription.status}</p>
      <p>Renews: {subscription.currentPeriodEnd}</p>

      <div className="actions">
        {subscription.status === 'active' && (
          <>
            <button onClick={handleUpgrade} disabled={isUpdating}>
              Upgrade Plan
            </button>
            <button onClick={() => pause()} disabled={isPausing}>
              Pause
            </button>
            <button onClick={handleCancel} disabled={isCancelling}>
              Cancel
            </button>
          </>
        )}

        {subscription.status === 'paused' && (
          <button onClick={() => resume()}>Resume</button>
        )}
      </div>
    </div>
  )
}`,
  },
  'usage-metering': {
    basic: `// Report usage for metered billing
await arcpay.usage.record({
  subscriptionId: 'sub_xyz789',
  meter: 'api_calls',
  quantity: 1500,
  timestamp: new Date(),
})

console.log('Usage recorded: 1500 API calls')`,
    full: `// Full usage metering
// Record usage event
await arcpay.usage.record({
  subscriptionId: 'sub_xyz789',
  meter: 'api_calls',
  quantity: 1500,
  timestamp: new Date(),

  // Optional: action type
  action: 'increment', // or 'set' to override

  // Idempotency key to prevent duplicates
  idempotencyKey: 'usage_2024_01_15_batch_001',

  // Metadata for your records
  metadata: {
    endpoint: '/api/v1/search',
    responseCode: 200,
  },
})

// Record batch usage
await arcpay.usage.recordBatch([
  { subscriptionId: 'sub_xyz789', meter: 'api_calls', quantity: 500 },
  { subscriptionId: 'sub_xyz789', meter: 'storage_gb', quantity: 2.5 },
  { subscriptionId: 'sub_abc123', meter: 'api_calls', quantity: 1200 },
])

// Get usage summary
const summary = await arcpay.usage.getSummary({
  subscriptionId: 'sub_xyz789',
  meter: 'api_calls',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31'),
})

console.log('Total usage:', summary.totalQuantity)
console.log('Estimated charge:', summary.estimatedCharge)

// List usage records
const records = await arcpay.usage.list({
  subscriptionId: 'sub_xyz789',
  meter: 'api_calls',
  limit: 100,
})`,
    hook: `// React hook for usage tracking
'use client'

import { useUsageMetering } from '@arcpay/b2b/react'

export function UsageDashboard({ subscriptionId }) {
  const {
    summary,
    records,
    isLoading,
    record,
    isRecording,
    refresh,
  } = useUsageMetering({
    subscriptionId,
    meter: 'api_calls',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  })

  if (isLoading) return <div>Loading usage...</div>

  return (
    <div className="usage-dashboard">
      <div className="summary">
        <h3>API Usage (Last 30 Days)</h3>
        <div className="stat">
          <span className="value">{summary?.totalQuantity.toLocaleString()}</span>
          <span className="label">Total Calls</span>
        </div>
        <div className="stat">
          <span className="value">\${summary?.estimatedCharge.toFixed(2)}</span>
          <span className="label">Estimated Charge</span>
        </div>
      </div>

      <div className="usage-chart">
        {records.map((record) => (
          <div key={record.id} className="usage-bar">
            <span>{new Date(record.timestamp).toLocaleDateString()}</span>
            <span>{record.quantity} calls</span>
          </div>
        ))}
      </div>

      <button onClick={refresh}>Refresh</button>
    </div>
  )
}`,
  },
  'micro-subscriptions': {
    basic: `// Create a micro subscription plan for per-use billing
const plan = await arcpay.subscriptions.createMicroPlan({
  name: 'AI API Usage',
  description: 'Pay per API call with x402 gasless payments',
  pricePerUnit: '$0.01',
  unitName: 'request',
  network: 'eip155:5042002', // Arc testnet
  sellerAddress: '0x1234...5678',
})

// Customer authorizes spending with EIP-3009 signature
const auth = await arcpay.subscriptions.authorizeMicro({
  subscriptionId: 'sub_micro_xyz',
  signature: customerSignature,
  amount: '$50.00', // Pre-authorize up to $50
})

console.log('Authorized:', auth.authorizedAmount)
console.log('Remaining:', auth.remainingAmount)`,
    full: `// Full micro subscription setup
import { ArcPayB2B } from '@arcpay/b2b'

const arcpay = new ArcPayB2B({
  apiKey: process.env.ARCPAY_API_KEY!,
  environment: 'production',
})

// Create micro plan with limits
const plan = await arcpay.subscriptions.createMicroPlan({
  name: 'Premium AI Tokens',
  description: 'GPT-4 API access with usage-based billing',

  // Pricing
  pricePerUnit: '$0.002',
  unitName: 'token',
  billingType: 'per_unit',

  // x402 Settlement
  network: 'eip155:5042002',
  sellerAddress: process.env.MERCHANT_WALLET!,

  // Limits to protect customers
  minCharge: '$0.01',        // Batch small charges
  maxChargePerDay: '$10.00', // Daily cap
  maxChargePerMonth: '$100', // Monthly cap

  // Features for display
  features: [
    'GPT-4 Turbo access',
    'Priority queue',
    'Usage analytics',
  ],

  metadata: {
    model: 'gpt-4-turbo',
    tier: 'premium',
  },
})

// Create subscription for customer
const subscription = await arcpay.subscriptions.createMicro({
  microPlanId: plan.id,
  payerAddress: '0xcustomer...wallet',
  payerEmail: 'customer@example.com',
})

// Record charges as usage occurs
const charge = await arcpay.subscriptions.chargeMicro({
  subscriptionId: subscription.id,
  units: 1500,
  description: 'API call: /v1/chat/completions',
})

console.log('Charge recorded:', charge.amount)
console.log('Total charged:', subscription.totalCharged)

// Batch settle pending charges (gasless via x402)
const settlement = await arcpay.subscriptions.settleMicroBatch({
  network: 'eip155:5042002',
  maxCharges: 100,
})

console.log('Settled:', settlement.totalCharges, 'charges')
console.log('Total amount:', settlement.totalAmount)`,
    hook: `// React hook for micro subscriptions
'use client'

import { useMicroSubscriptions } from '@arcpay/b2b/react'

export function MicroUsageDashboard({ subscriptionId }) {
  const {
    subscription,
    charges,
    stats,
    isLoading,
    authorize,
    isAuthorizing,
    refetch,
  } = useMicroSubscriptions(subscriptionId)

  if (isLoading) return <div>Loading...</div>

  const handleAuthorize = async () => {
    // Request wallet signature for spend authorization
    const signature = await getWalletSignature()

    await authorize({
      signature,
      amount: '$100.00',
    })
  }

  return (
    <div className="micro-dashboard">
      <div className="stats">
        <div className="stat">
          <span className="label">Total Spent</span>
          <span className="value">\${subscription?.totalCharged || '0.00'}</span>
        </div>
        <div className="stat">
          <span className="label">Authorized</span>
          <span className="value">\${subscription?.authorizedAmount || '0.00'}</span>
        </div>
        <div className="stat">
          <span className="label">Remaining</span>
          <span className="value">
            \${(parseFloat(subscription?.authorizedAmount || '0') -
               parseFloat(subscription?.totalCharged || '0')).toFixed(2)}
          </span>
        </div>
      </div>

      <div className="plan-info">
        <h3>{subscription?.microPlan?.name}</h3>
        <p>{subscription?.microPlan?.pricePerUnit} per {subscription?.microPlan?.unitName}</p>
      </div>

      <div className="charges">
        <h4>Recent Charges</h4>
        {charges.slice(0, 10).map((charge) => (
          <div key={charge.id} className="charge">
            <span>{charge.units} {subscription?.microPlan?.unitName}s</span>
            <span>\${charge.amount}</span>
            <span className={\`status \${charge.status}\`}>{charge.status}</span>
          </div>
        ))}
      </div>

      <button onClick={handleAuthorize} disabled={isAuthorizing}>
        {isAuthorizing ? 'Authorizing...' : 'Authorize More Spend'}
      </button>

      <button onClick={refetch}>Refresh</button>
    </div>
  )
}`,
  },
  webhooks: {
    basic: `// Webhook endpoint for subscription events
// app/api/webhooks/subscriptions/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { ArcPayB2B } from '@arcpay/b2b'

const arcpay = new ArcPayB2B({ apiKey: process.env.ARCPAY_API_KEY! })

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('x-arcpay-signature')!

  const event = arcpay.webhooks.verify(body, signature)

  switch (event.type) {
    case 'subscription.created':
      console.log('New subscription:', event.data.id)
      break
    case 'subscription.renewed':
      console.log('Subscription renewed:', event.data.id)
      break
  }

  return NextResponse.json({ received: true })
}`,
    full: `// Full webhook handling for subscriptions
// app/api/webhooks/subscriptions/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { ArcPayB2B, SubscriptionEvent } from '@arcpay/b2b'

const arcpay = new ArcPayB2B({ apiKey: process.env.ARCPAY_API_KEY! })
const WEBHOOK_SECRET = process.env.ARCPAY_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('x-arcpay-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: SubscriptionEvent

  try {
    event = arcpay.webhooks.verify(body, signature, WEBHOOK_SECRET)
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'subscription.created':
        await handleSubscriptionCreated(event.data)
        break

      case 'subscription.updated':
        await handleSubscriptionUpdated(event.data)
        break

      case 'subscription.renewed':
        await handleSubscriptionRenewed(event.data)
        break

      case 'subscription.payment_failed':
        await handlePaymentFailed(event.data)
        break

      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event.data)
        break

      case 'subscription.trial_ending':
        await handleTrialEnding(event.data)
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}

async function handleSubscriptionCreated(subscription) {
  // Provision access
  await provisionService(subscription.customerId, subscription.planId)

  // Send welcome email
  await sendEmail(subscription.customer.email, 'welcome', {
    planName: subscription.plan.name,
  })
}

async function handlePaymentFailed(subscription) {
  // Update internal status
  await db.subscriptions.update({
    id: subscription.id,
    status: 'past_due',
  })

  // Send dunning email
  await sendEmail(subscription.customer.email, 'payment_failed', {
    retryDate: subscription.nextRetryDate,
  })
}`,
    hook: `// React hook for real-time subscription events
'use client'

import { useSubscriptionEvents } from '@arcpay/b2b/react'

export function SubscriptionActivity() {
  const {
    events,
    isConnected,
    lastEvent,
  } = useSubscriptionEvents({
    types: [
      'subscription.created',
      'subscription.renewed',
      'subscription.cancelled',
    ],
    onEvent: (event) => {
      console.log('New event:', event.type)
    },
    onSubscriptionCreated: (sub) => {
      showNotification(\`New subscription: \${sub.plan.name}\`)
    },
    onPaymentFailed: (sub) => {
      showAlert(\`Payment failed for \${sub.customer.name}\`)
    },
  })

  return (
    <div className="activity-feed">
      <div className="status">
        {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>

      <ul>
        {events.map((event) => (
          <li key={event.id}>
            <span className="type">{event.type}</span>
            <span className="time">
              {new Date(event.timestamp).toLocaleTimeString()}
            </span>
            <span className="details">
              {event.type === 'subscription.created' && (
                <>New: {event.data.customer.name}</>
              )}
              {event.type === 'subscription.renewed' && (
                <>Renewed: \${event.data.amount}</>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}`,
  },
  'dashboard-api': {
    basic: `// Using the built-in Dashboard API routes
// These routes are authenticated and organization-scoped

// List subscription plans
const plansResponse = await fetch('/api/plans')
const { plans } = await plansResponse.json()

// Create a new plan
const createResponse = await fetch('/api/plans', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Pro Plan',
    amount: 99,
    interval: 'monthly',
    trialDays: 14,
  }),
})
const { plan } = await createResponse.json()

// List subscriptions
const subsResponse = await fetch('/api/subscriptions?status=active')
const { subscriptions, total } = await subsResponse.json()`,
    full: `// Full Dashboard API usage

// =====================================================
// Plans API
// =====================================================

// GET /api/plans - List all plans
const plans = await fetch('/api/plans?active=true')

// POST /api/plans - Create a plan
await fetch('/api/plans', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Enterprise',
    description: 'Full access to all features',
    amount: 299,
    currency: 'USDC',
    interval: 'monthly',
    intervalCount: 1,
    trialDays: 14,
    features: ['Unlimited API calls', 'Priority support', 'Custom integrations'],
    usageLimits: { api_calls: 100000 },
  }),
})

// PATCH /api/plans/:id - Update a plan
await fetch('/api/plans/plan_123', {
  method: 'PATCH',
  body: JSON.stringify({ amount: 349, features: [...] }),
})

// DELETE /api/plans/:id - Archive/delete a plan
await fetch('/api/plans/plan_123', { method: 'DELETE' })

// =====================================================
// Subscriptions API
// =====================================================

// GET /api/subscriptions - List subscriptions
const subs = await fetch('/api/subscriptions?status=active&customerId=cus_123')

// POST /api/subscriptions - Create a subscription
await fetch('/api/subscriptions', {
  method: 'POST',
  body: JSON.stringify({
    planId: 'plan_123',
    customerId: 'cus_456',
    customerWallet: '0x1234...5678',
    merchantWallet: '0xabcd...efgh',
    chain: 'base',
  }),
})

// POST /api/subscriptions/:id/cancel - Cancel
await fetch('/api/subscriptions/sub_123/cancel', {
  method: 'POST',
  body: JSON.stringify({ cancelAtPeriodEnd: true, reason: 'Customer request' }),
})

// POST /api/subscriptions/:id/pause - Pause
await fetch('/api/subscriptions/sub_123/pause', {
  method: 'POST',
  body: JSON.stringify({ resumesAt: '2024-03-01', reason: 'Seasonal pause' }),
})

// POST /api/subscriptions/:id/resume - Resume
await fetch('/api/subscriptions/sub_123/resume', { method: 'POST' })

// =====================================================
// Invoices API
// =====================================================

// GET /api/invoices - List invoices
const invoices = await fetch('/api/invoices?status=sent&customerId=cus_123')

// POST /api/invoices - Create invoice
await fetch('/api/invoices', {
  method: 'POST',
  body: JSON.stringify({
    customerId: 'cus_123',
    lineItems: [
      { description: 'Pro Plan - January', quantity: 1, unitPrice: 99 },
      { description: 'API Overage', quantity: 5000, unitPrice: 0.001 },
    ],
    dueDate: '2024-02-15',
  }),
})

// POST /api/invoices/:id/send - Send invoice email
await fetch('/api/invoices/inv_123/send', { method: 'POST' })

// POST /api/invoices/:id/mark-paid - Record payment
await fetch('/api/invoices/inv_123/mark-paid', {
  method: 'POST',
  body: JSON.stringify({ txHash: '0xabc...', chain: 'base' }),
})`,
    hook: `// React hooks for Dashboard API
// Import from features/subscriptions and features/invoices

'use client'

import { usePlans, useSubscriptions } from '@/features/subscriptions'
import { useInvoices } from '@/features/invoices'

export function SubscriptionDashboard() {
  // Plans hook
  const {
    plans,
    isLoading: plansLoading,
    createPlan,
    updatePlan,
    deletePlan,
    isCreating,
  } = usePlans()

  // Subscriptions hook
  const {
    subscriptions,
    total,
    isLoading: subsLoading,
    getSubscription,
    createSubscription,
    cancelSubscription,
    pauseSubscription,
    resumeSubscription,
  } = useSubscriptions({ status: 'active' })

  // Invoices hook
  const {
    invoices,
    isLoading: invoicesLoading,
    createInvoice,
    sendInvoice,
    markAsPaid,
    deleteInvoice,
  } = useInvoices()

  // Create a new plan
  const handleCreatePlan = async () => {
    const plan = await createPlan({
      name: 'Pro Plan',
      amount: 99,
      interval: 'monthly',
      trialDays: 14,
    })
    if (plan) {
      console.log('Plan created:', plan.id)
    }
  }

  // Cancel subscription at period end
  const handleCancel = async (id: string) => {
    await cancelSubscription(id, { cancelAtPeriodEnd: true })
  }

  // Send invoice
  const handleSendInvoice = async (id: string) => {
    await sendInvoice(id)
  }

  return (
    <div>
      <h2>Plans ({plans.length})</h2>
      <button onClick={handleCreatePlan} disabled={isCreating}>
        Create Plan
      </button>

      <h2>Active Subscriptions ({total})</h2>
      {subscriptions.map((sub) => (
        <div key={sub.id}>
          {sub.customer?.email} - {sub.plan?.name}
          <button onClick={() => handleCancel(sub.id)}>Cancel</button>
        </div>
      ))}

      <h2>Invoices ({invoices.length})</h2>
      {invoices.map((inv) => (
        <div key={inv.id}>
          {inv.reference} - \${inv.amount} - {inv.status}
          {inv.status === 'draft' && (
            <button onClick={() => handleSendInvoice(inv.id)}>Send</button>
          )}
        </div>
      ))}
    </div>
  )
}`,
  },
};
