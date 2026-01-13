import type { SectionId, CodeTab } from './types';

export const codeExamples: Record<SectionId, Record<CodeTab, string>> = {
  'getting-started': {
    basic: `// Initialize the ArcPay B2B SDK
import { ArcPayB2B } from '@arcpay/b2b'

const arcpay = new ArcPayB2B({
  // Your API key from the ArcPay Dashboard
  apiKey: process.env.ARCPAY_API_KEY!,

  // "sandbox" = test mode, "production" = live
  environment: 'sandbox',
})

// Enable dispute protection for your organization
await arcpay.disputes.enableProtection({
  autoAcceptThreshold: 50, // Auto-accept under $50
  aiEnabled: true,
  aiAutoResolve: false, // Require human review
})`,
    full: `// Full configuration with all options
import { ArcPayB2B } from '@arcpay/b2b'

const arcpay = new ArcPayB2B({
  apiKey: process.env.ARCPAY_API_KEY!,
  environment: 'production',

  // Optional: Custom base URL for self-hosted
  baseUrl: 'https://api.arcpay.com',

  // Request timeout in milliseconds
  timeout: 30000,

  // Retry configuration
  retries: 3,
  retryDelay: 1000,
})

// Configure dispute protection settings
await arcpay.disputes.enableProtection({
  // Auto-accept disputes under this amount
  autoAcceptThreshold: 50,

  // Require delivery proof for transactions above
  requireDeliveryProofThreshold: 100,

  // Reserve percentage for potential disputes
  reservePercentage: 5,

  // AI evaluation settings
  aiEnabled: true,
  aiAutoResolve: false,
  aiConfidenceThreshold: 0.85,

  // Notification settings
  notifyOnDispute: true,
  notifyEmail: 'disputes@yourcompany.com',
  notifySlackWebhook: 'https://hooks.slack.com/...',
})`,
    hook: `// React hook for dispute protection status
'use client'

import { useDisputeProtection } from '@arcpay/b2b/react'

export function DisputeSettings() {
  const {
    settings,
    isEnabled,
    isLoading,
    updateSettings,
    enableProtection,
    disableProtection,
  } = useDisputeProtection()

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <h2>Dispute Protection: {isEnabled ? 'Enabled' : 'Disabled'}</h2>

      {isEnabled && (
        <>
          <p>Auto-accept threshold: \${settings.autoAcceptThreshold}</p>
          <p>AI Enabled: {settings.aiEnabled ? 'Yes' : 'No'}</p>
          <p>Reserve: {settings.reservePercentage}%</p>
        </>
      )}

      <button onClick={() => isEnabled ? disableProtection() : enableProtection()}>
        {isEnabled ? 'Disable' : 'Enable'} Protection
      </button>
    </div>
  )
}`,
  },
  'file-dispute': {
    basic: `// File a dispute as a buyer
const dispute = await arcpay.disputes.create({
  transactionId: 'tx_abc123',
  buyerId: 'buyer_456',
  merchantId: 'merchant_789',
  amount: 150.00,
  category: 'not_received',
  description: 'Order never arrived after 14 days',
  desiredResolution: 'full_refund',
})

console.log('Dispute filed:', dispute.id)
// => dis_xyz789`,
    full: `// File a dispute with evidence
const dispute = await arcpay.disputes.create({
  // Required fields
  transactionId: 'tx_abc123',
  buyerId: 'buyer_456',
  merchantId: 'merchant_789',
  amount: 150.00,
  currency: 'USDC',

  // Dispute category
  category: 'not_received', // not_received | not_as_described | duplicate_charge | quality_issue | unauthorized

  // Claim details
  description: 'Package shows delivered but never received. Checked with neighbors and building management.',
  desiredResolution: 'full_refund', // full_refund | partial_refund | replacement | other

  // Supporting evidence (optional)
  evidence: [
    {
      type: 'order_confirmation',
      title: 'Original Order',
      description: 'Order placed on Jan 15, 2024',
      fileUrl: 'https://storage.example.com/order-123.pdf',
    },
    {
      type: 'communication',
      title: 'Merchant Contact Attempts',
      description: 'Emails sent on Jan 25 and Jan 28 with no response',
      fileUrl: 'https://storage.example.com/emails.pdf',
    },
  ],

  // Optional metadata
  metadata: {
    orderNumber: 'ORD-2024-001',
    productSku: 'PROD-ABC',
  },
})

console.log('Dispute status:', dispute.status) // => 'filed'
console.log('Response deadline:', dispute.merchantResponseDeadline)`,
    hook: `// React hook for filing disputes
'use client'

import { useState } from 'react'
import { useCreateDispute } from '@arcpay/b2b/react'

export function FileDisputeForm({ transactionId, amount }) {
  const [category, setCategory] = useState('not_received')
  const [description, setDescription] = useState('')

  const {
    createDispute,
    isLoading,
    error,
    dispute,
  } = useCreateDispute({
    onSuccess: (d) => console.log('Filed:', d.id),
    onError: (e) => console.error('Failed:', e.message),
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    await createDispute({
      transactionId,
      amount,
      category,
      description,
      desiredResolution: 'full_refund',
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="not_received">Not Received</option>
        <option value="not_as_described">Not As Described</option>
        <option value="quality_issue">Quality Issue</option>
        <option value="unauthorized">Unauthorized</option>
      </select>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe your issue..."
      />

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Filing...' : 'File Dispute'}
      </button>

      {error && <p className="error">{error.message}</p>}
      {dispute && <p>Dispute filed: {dispute.id}</p>}
    </form>
  )
}`,
  },
  respond: {
    basic: `// Respond to a dispute as merchant
const response = await arcpay.disputes.respond({
  disputeId: 'dis_xyz789',
  acceptClaim: false,
  responseText: 'Package was delivered per tracking records',
  proposedResolution: 'reject',
})

console.log('Response submitted')`,
    full: `// Full merchant response with evidence
const response = await arcpay.disputes.respond({
  disputeId: 'dis_xyz789',

  // Accept or contest the claim
  acceptClaim: false,

  // Detailed response
  responseText: \`
    The package was confirmed delivered on Jan 20, 2024 at 2:15 PM.
    Tracking shows delivery to the customer's address with signature.
    Attached is the proof of delivery from the carrier.
  \`,

  // Proposed resolution
  proposedResolution: 'reject', // full_refund | partial_refund | replacement | reject

  // If proposing partial refund
  // proposedRefundAmount: 50.00,

  // Supporting evidence
  evidence: [
    {
      type: 'shipping_proof',
      title: 'Delivery Confirmation',
      description: 'FedEx tracking showing delivered with signature',
      fileUrl: 'https://storage.example.com/delivery-proof.pdf',
    },
    {
      type: 'photo',
      title: 'Delivery Photo',
      description: 'Photo taken at delivery showing package at door',
      fileUrl: 'https://storage.example.com/delivery-photo.jpg',
    },
  ],
})

// Check updated dispute status
const dispute = await arcpay.disputes.get('dis_xyz789')
console.log('Status:', dispute.status) // => 'merchant_responded'`,
    hook: `// React hook for merchant response
'use client'

import { useState } from 'react'
import { useDisputeResponse } from '@arcpay/b2b/react'

export function MerchantResponseForm({ disputeId, amount }) {
  const [acceptClaim, setAcceptClaim] = useState(false)
  const [responseText, setResponseText] = useState('')
  const [refundAmount, setRefundAmount] = useState(amount)

  const {
    respond,
    isLoading,
    error,
    response,
  } = useDisputeResponse({
    disputeId,
    onSuccess: () => console.log('Response submitted'),
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    await respond({
      acceptClaim,
      responseText,
      proposedResolution: acceptClaim ? 'full_refund' : 'reject',
      proposedRefundAmount: acceptClaim ? refundAmount : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        <input
          type="checkbox"
          checked={acceptClaim}
          onChange={(e) => setAcceptClaim(e.target.checked)}
        />
        Accept buyer's claim
      </label>

      {acceptClaim && (
        <input
          type="number"
          value={refundAmount}
          onChange={(e) => setRefundAmount(Number(e.target.value))}
          max={amount}
        />
      )}

      <textarea
        value={responseText}
        onChange={(e) => setResponseText(e.target.value)}
        placeholder="Explain your response..."
      />

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Submitting...' : 'Submit Response'}
      </button>
    </form>
  )
}`,
  },
  'ai-evaluation': {
    basic: `// Trigger AI evaluation for a dispute
const evaluation = await arcpay.disputes.evaluate('dis_xyz789')

console.log('Recommendation:', evaluation.recommendation)
// => 'approve' | 'deny' | 'escalate'

console.log('Confidence:', evaluation.confidence)
// => 0.87 (87% confidence)

console.log('Reasoning:', evaluation.reasoning)
// => 'Evidence supports buyer claim...'`,
    full: `// Full AI evaluation with detailed factors
const evaluation = await arcpay.disputes.evaluate('dis_xyz789', {
  // Force re-evaluation even if already evaluated
  forceReevaluate: false,

  // Include detailed factor breakdown
  includeFactors: true,
})

console.log('Recommendation:', evaluation.recommendation)
console.log('Confidence:', (evaluation.confidence * 100).toFixed(0) + '%')
console.log('Reasoning:', evaluation.reasoning)

// Detailed evaluation factors
if (evaluation.factors) {
  console.log('\\nEvaluation Factors:')

  // Buyer history (25% weight)
  console.log('Buyer History:', evaluation.factors.buyerHistory)
  // => { score: 0.85, accountAge: '2 years', disputeRate: 'Low', trustLevel: 'High' }

  // Merchant history (25% weight)
  console.log('Merchant History:', evaluation.factors.merchantHistory)
  // => { score: 0.72, accountAge: '6 months', disputeRate: 'Medium', deliveryProofRate: '90%' }

  // Evidence quality (30% weight)
  console.log('Evidence Quality:', evaluation.factors.evidenceQuality)
  // => { score: 0.80, buyerStrength: 'Strong', merchantStrength: 'Moderate', gaps: ['Missing delivery signature'] }

  // Transaction analysis (20% weight)
  console.log('Transaction Analysis:', evaluation.factors.transactionAnalysis)
  // => { score: 0.75, amountPattern: 'Normal', timingFlags: [], riskSignals: [] }
}

// Suggested resolution
if (evaluation.suggestedResolution) {
  console.log('\\nSuggested Resolution:')
  console.log('Type:', evaluation.suggestedResolution.type)
  console.log('Amount:', evaluation.suggestedResolution.amount)
}`,
    hook: `// React hook for AI evaluation
'use client'

import { useAIEvaluation } from '@arcpay/b2b/react'

export function AIEvaluationPanel({ disputeId }) {
  const {
    evaluation,
    isEvaluating,
    error,
    evaluate,
    hasEvaluation,
  } = useAIEvaluation(disputeId)

  if (isEvaluating) {
    return (
      <div className="ai-panel loading">
        <div className="spinner" />
        <p>AI is analyzing the dispute...</p>
      </div>
    )
  }

  if (!hasEvaluation) {
    return (
      <div className="ai-panel">
        <button onClick={() => evaluate()}>
          Run AI Evaluation
        </button>
      </div>
    )
  }

  const confidenceColor =
    evaluation.confidence > 0.85 ? 'green' :
    evaluation.confidence > 0.70 ? 'yellow' : 'red'

  return (
    <div className="ai-panel">
      <h3>AI Recommendation</h3>

      <div className={\`recommendation \${evaluation.recommendation}\`}>
        {evaluation.recommendation.toUpperCase()}
      </div>

      <div className={\`confidence \${confidenceColor}\`}>
        {(evaluation.confidence * 100).toFixed(0)}% confidence
      </div>

      <p className="reasoning">{evaluation.reasoning}</p>

      {evaluation.factors && (
        <div className="factors">
          <h4>Evaluation Factors</h4>
          <div>Buyer History: {(evaluation.factors.buyerHistory.score * 100).toFixed(0)}%</div>
          <div>Merchant History: {(evaluation.factors.merchantHistory.score * 100).toFixed(0)}%</div>
          <div>Evidence Quality: {(evaluation.factors.evidenceQuality.score * 100).toFixed(0)}%</div>
          <div>Transaction Analysis: {(evaluation.factors.transactionAnalysis.score * 100).toFixed(0)}%</div>
        </div>
      )}
    </div>
  )
}`,
  },
  'delivery-proof': {
    basic: `// Register delivery proof for a transaction
await arcpay.deliveryProof.register({
  transactionId: 'tx_abc123',
  type: 'physical_shipment',
  proof: {
    carrier: 'FedEx',
    trackingNumber: '1234567890',
    shippedAt: '2024-01-15T10:00:00Z',
    deliveredAt: '2024-01-20T14:15:00Z',
  },
})

console.log('Delivery proof registered')`,
    full: `// Register delivery proofs for different delivery types
// Physical shipment
await arcpay.deliveryProof.register({
  transactionId: 'tx_physical_123',
  type: 'physical_shipment',
  proof: {
    carrier: 'FedEx',
    trackingNumber: '1234567890',
    shippedAt: '2024-01-15T10:00:00Z',
    deliveredAt: '2024-01-20T14:15:00Z',
    signatureUrl: 'https://storage.example.com/signature.png',
    deliveryPhotoUrl: 'https://storage.example.com/delivery.jpg',
  },
})

// Digital delivery
await arcpay.deliveryProof.register({
  transactionId: 'tx_digital_456',
  type: 'digital_delivery',
  proof: {
    timestamp: '2024-01-15T10:00:00Z',
    confirmed: true,
    ipAddress: '192.168.1.1',
    downloadLinks: ['https://download.example.com/file1.zip'],
    accessGrantedAt: '2024-01-15T10:00:05Z',
  },
})

// Service rendered
await arcpay.deliveryProof.register({
  transactionId: 'tx_service_789',
  type: 'service_rendered',
  proof: {
    serviceDate: '2024-01-15',
    serviceDescription: 'Website development - 40 hours',
    completionConfirmed: true,
    customerSignature: 'https://storage.example.com/approval.pdf',
    deliverables: ['https://github.com/client/project'],
  },
})

// Subscription access
await arcpay.deliveryProof.register({
  transactionId: 'tx_sub_101',
  type: 'subscription_access',
  proof: {
    periodStart: '2024-01-01',
    periodEnd: '2024-01-31',
    featuresAccessed: ['api_calls', 'dashboard', 'reports'],
    usageLogs: [
      { date: '2024-01-05', action: 'API call', count: 150 },
      { date: '2024-01-10', action: 'Report generated', count: 5 },
    ],
  },
})`,
    hook: `// React hook for delivery proof management
'use client'

import { useState } from 'react'
import { useDeliveryProof } from '@arcpay/b2b/react'

export function DeliveryProofForm({ transactionId }) {
  const [type, setType] = useState('physical_shipment')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [carrier, setCarrier] = useState('')

  const {
    register,
    verify,
    isRegistering,
    isVerified,
    error,
    proof,
  } = useDeliveryProof(transactionId)

  const handleSubmit = async (e) => {
    e.preventDefault()

    await register({
      type,
      proof: type === 'physical_shipment' ? {
        carrier,
        trackingNumber,
        shippedAt: new Date().toISOString(),
      } : {
        timestamp: new Date().toISOString(),
        confirmed: true,
      },
    })
  }

  if (proof && isVerified) {
    return (
      <div className="proof-verified">
        <span className="badge success">Verified</span>
        <p>Delivery confirmed on {proof.deliveredAt}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="physical_shipment">Physical Shipment</option>
        <option value="digital_delivery">Digital Delivery</option>
        <option value="service_rendered">Service Rendered</option>
      </select>

      {type === 'physical_shipment' && (
        <>
          <input
            placeholder="Carrier (FedEx, UPS, etc.)"
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
          />
          <input
            placeholder="Tracking Number"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
          />
        </>
      )}

      <button type="submit" disabled={isRegistering}>
        {isRegistering ? 'Registering...' : 'Register Proof'}
      </button>
    </form>
  )
}`,
  },
  webhooks: {
    basic: `// Set up webhook endpoint
// app/api/webhooks/arcpay/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { ArcPayB2B } from '@arcpay/b2b'

const arcpay = new ArcPayB2B({ apiKey: process.env.ARCPAY_API_KEY! })

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('x-arcpay-signature')!

  // Verify webhook signature
  const event = arcpay.webhooks.verify(body, signature)

  switch (event.type) {
    case 'dispute.created':
      console.log('New dispute:', event.data.id)
      break
    case 'dispute.resolved':
      console.log('Dispute resolved:', event.data.outcome)
      break
  }

  return NextResponse.json({ received: true })
}`,
    full: `// Full webhook handling with all events
// app/api/webhooks/arcpay/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { ArcPayB2B, DisputeEvent } from '@arcpay/b2b'

const arcpay = new ArcPayB2B({ apiKey: process.env.ARCPAY_API_KEY! })
const WEBHOOK_SECRET = process.env.ARCPAY_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('x-arcpay-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: DisputeEvent

  try {
    event = arcpay.webhooks.verify(body, signature, WEBHOOK_SECRET)
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'dispute.created':
        // New dispute filed
        await handleDisputeCreated(event.data)
        break

      case 'dispute.updated':
        // Dispute status changed
        await handleDisputeUpdated(event.data)
        break

      case 'dispute.merchant_responded':
        // Merchant submitted response
        await handleMerchantResponse(event.data)
        break

      case 'dispute.evidence_added':
        // New evidence submitted
        await handleNewEvidence(event.data)
        break

      case 'dispute.ai_evaluated':
        // AI evaluation completed
        await handleAIEvaluation(event.data)
        break

      case 'dispute.escalated':
        // Dispute escalated to human review
        await handleEscalation(event.data)
        break

      case 'dispute.resolved':
        // Dispute resolved
        await handleResolution(event.data)
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}

async function handleDisputeCreated(dispute) {
  // Send notification
  await sendSlackAlert(\`New dispute: \${dispute.id} for \$\${dispute.amount}\`)

  // Update internal records
  await db.disputes.create({ externalId: dispute.id, ...dispute })
}

async function handleResolution(dispute) {
  // Process refund if buyer wins
  if (dispute.resolution.outcome === 'buyer_wins') {
    await processRefund(dispute.transactionId, dispute.resolution.refundAmount)
  }

  // Update order status
  await db.orders.update({
    transactionId: dispute.transactionId,
    disputeStatus: 'resolved',
    disputeOutcome: dispute.resolution.outcome,
  })
}`,
    hook: `// React hook for real-time dispute updates
'use client'

import { useDisputeEvents } from '@arcpay/b2b/react'

export function DisputeActivityFeed() {
  const {
    events,
    isConnected,
    lastEvent,
    subscribe,
    unsubscribe,
  } = useDisputeEvents({
    // Filter events
    types: ['dispute.created', 'dispute.resolved'],

    // Callbacks
    onEvent: (event) => {
      console.log('New event:', event.type)
    },
    onDisputeCreated: (dispute) => {
      showNotification(\`New dispute: \${dispute.id}\`)
    },
    onDisputeResolved: (dispute) => {
      showNotification(\`Dispute resolved: \${dispute.resolution.outcome}\`)
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
            <span className="time">{event.timestamp}</span>
            {event.type === 'dispute.created' && (
              <span>New dispute for \${event.data.amount}</span>
            )}
            {event.type === 'dispute.resolved' && (
              <span>Resolved: {event.data.resolution.outcome}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}`,
  },
};
