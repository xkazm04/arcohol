import type { Template } from './types';

export const templates: Template[] = [
  {
    id: 'provider',
    name: 'Provider Setup',
    desc: 'Basic ArcPayProvider configuration',
    useCase: 'Required for all React integrations - wrap your app root',
    category: 'setup',
    icon: 'settings',
    code: `import { ArcPayProvider } from '@arcpay/react'

function App({ children }) {
  return (
    <ArcPayProvider
      config={{
        apiKey: process.env.NEXT_PUBLIC_ARCPAY_API_KEY,
        network: 'testnet'
      }}
    >
      {children}
    </ArcPayProvider>
  )
}`,
  },
  {
    id: 'wallet',
    name: 'Wallet Connection',
    desc: 'Connect wallet with balance display',
    useCase: 'User authentication and account display in header or profile',
    category: 'setup',
    icon: 'wallet',
    code: `import { useWallet, useBalance } from '@arcpay/react'

function WalletConnect() {
  const { address, isConnected, connect, disconnect } = useWallet()
  const { balance } = useBalance()

  if (!isConnected) {
    return <button onClick={connect}>Connect Wallet</button>
  }

  return (
    <div>
      <p>Balance: {balance} USDC</p>
      <p>Address: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
      <button onClick={disconnect}>Disconnect</button>
    </div>
  )
}`,
  },
  {
    id: 'pay-button',
    name: 'Pay Button',
    desc: 'Simple payment button',
    useCase: 'One-click payments for products, tips, or donations',
    category: 'payments',
    icon: 'credit-card',
    code: `import { useTransfer, useWallet } from '@arcpay/react'

function PayButton({ amount, recipient, onSuccess }) {
  const { isConnected, connect } = useWallet()
  const { transfer, isTransferring } = useTransfer()

  const handlePay = async () => {
    if (!isConnected) { await connect(); return }
    const result = await transfer({ to: recipient, amount })
    onSuccess?.(result.transaction)
  }

  return (
    <button onClick={handlePay} disabled={isTransferring}>
      {isTransferring ? 'Processing...' : \`Pay \${amount} USDC\`}
    </button>
  )
}`,
  },
  {
    id: 'checkout',
    name: 'Checkout Flow',
    desc: 'Complete checkout with cart',
    useCase: 'E-commerce stores with multi-item shopping carts',
    category: 'payments',
    icon: 'shopping-cart',
    code: `import { useWallet, useTransfer, useBalance } from '@arcpay/react'

function Checkout({ items, merchantAddress }) {
  const { isConnected, connect } = useWallet()
  const { balance } = useBalance()
  const { transfer, isTransferring } = useTransfer()

  const total = items.reduce((sum, i) => sum + i.price, 0)

  const handleCheckout = async () => {
    if (!isConnected) { await connect(); return }
    await transfer({
      to: merchantAddress,
      amount: total.toFixed(2),
      memo: \`Order: \${items.map(i => i.name).join(', ')}\`
    })
  }

  return (
    <div>
      {items.map(item => <div key={item.id}>{item.name}: \${item.price}</div>)}
      <div>Total: \${total} USDC</div>
      <button onClick={handleCheckout} disabled={isTransferring}>
        {isTransferring ? 'Processing...' : 'Checkout'}
      </button>
    </div>
  )
}`,
  },
  {
    id: 'subscription',
    name: 'Subscription',
    desc: 'Subscribe to a plan',
    useCase: 'SaaS apps, membership sites, and recurring billing',
    category: 'subscriptions',
    icon: 'repeat',
    code: `import { useSubscription, useWallet } from '@arcpay/react'

function Subscribe({ planId, planAmount }) {
  const { isConnected, connect } = useWallet()
  const { subscribe, isSubscribing, subscription } = useSubscription()

  const handleSubscribe = async () => {
    if (!isConnected) { await connect(); return }
    await subscribe({ planId, approveAmount: planAmount })
  }

  if (subscription) {
    return <div>Subscribed! Next billing: {subscription.currentPeriodEnd}</div>
  }

  return (
    <button onClick={handleSubscribe} disabled={isSubscribing}>
      {isSubscribing ? 'Setting up...' : 'Subscribe'}
    </button>
  )
}`,
  },
  {
    id: 'webhook',
    name: 'Webhook Handler',
    desc: 'Server-side webhook handler',
    useCase: 'Backend order fulfillment, access control, and notifications',
    category: 'webhooks',
    icon: 'webhook',
    code: `// app/api/webhooks/arcpay/route.ts
import { verifyWebhookSignature } from '@arcpay/node'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('X-ArcPay-Signature')

  const isValid = verifyWebhookSignature({
    payload: body,
    signature: signature!,
    secret: process.env.ARCPAY_WEBHOOK_SECRET!
  })

  if (!isValid) return new Response('Invalid', { status: 401 })

  const event = JSON.parse(body)
  switch (event.type) {
    case 'payment.completed':
      // Update order status
      break
    case 'subscription.renewed':
      // Extend access
      break
  }

  return new Response('OK', { status: 200 })
}`,
  },
];
