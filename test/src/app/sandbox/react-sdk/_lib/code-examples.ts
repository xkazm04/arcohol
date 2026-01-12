import type { SectionId, CodeTab } from './types';

export const codeExamples: Record<SectionId, Record<CodeTab, string>> = {
  'getting-started': {
    basic: `// app/layout.tsx
// Wrap your app with ArcPayProvider to enable all SDK features
import { ArcPayProvider } from '@arcpay/react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ArcPayProvider
          // Your public API key from ArcPay Dashboard
          // NEXT_PUBLIC_ prefix required for client-side access
          publicKey={process.env.NEXT_PUBLIC_ARCPAY_KEY!}

          // "sandbox" = test mode (no real transactions)
          // "production" = live mode (real payments)
          environment="sandbox"
        >
          {children}
        </ArcPayProvider>
      </body>
    </html>
  )
}`,
    full: `// app/layout.tsx - Full configuration with all options
import { ArcPayProvider } from '@arcpay/react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ArcPayProvider
          publicKey={process.env.NEXT_PUBLIC_ARCPAY_KEY!}
          environment="production"

          // Theme preset: "light" or "dark"
          preset="dark"

          // Custom theme overrides (optional)
          theme={{
            colors: {
              primary: '#06b6d4',
              background: '#0f172a',
            },
          }}

          // Brand config - shown in checkout, invoices, emails
          brand={{
            name: 'My Company',
            logo: '/logo.png',
            primaryColor: '#06b6d4',
          }}

          // Default checkout settings
          checkout={{
            recipient: '0xYourWalletAddress',
            chains: ['arc', 'ethereum', 'polygon'],
            defaultChain: 'arc',
            showFees: true,
          }}

          locale="en-US"
          onError={(error) => console.error('ArcPay error:', error)}
        >
          {children}
        </ArcPayProvider>
      </body>
    </html>
  )
}`,
    hook: `// Access provider context anywhere in your app
'use client'

import { useArcPay } from '@arcpay/react'

export default function SettingsPanel() {
  const { publicKey, environment, brand } = useArcPay()

  return (
    <div>
      <p>Environment: {environment}</p>
      <p>Public Key: {publicKey.slice(0, 8)}...</p>
      {brand && <p>Brand: {brand.name}</p>}
    </div>
  )
}`,
  },
  checkout: {
    basic: `// app/checkout/page.tsx
'use client'

import { Checkout } from '@arcpay/react'
import { useRouter } from 'next/navigation'

export default function CheckoutPage() {
  const router = useRouter()
  const items = [
    { id: '1', name: 'Pro Plan', price: 29.99, quantity: 1 },
    { id: '2', name: 'API Credits', price: 10.00, quantity: 1 }
  ]

  return (
    <Checkout
      items={items}
      recipient="0xYourWalletAddress"
      onSuccess={(payment) => {
        router.push(\`/success?tx=\${payment.txHash}\`)
      }}
      onError={(error) => {
        console.error('Payment failed:', error.message)
      }}
    />
  )
}`,
    full: `// app/checkout/page.tsx - Full customization
'use client'

import { Checkout } from '@arcpay/react'
import { useRouter } from 'next/navigation'

export default function CheckoutPage() {
  const router = useRouter()
  const items = [
    { id: '1', name: 'Pro Plan', price: 29.99, quantity: 1 },
    { id: '2', name: 'API Credits', price: 10.00, quantity: 1 }
  ]

  return (
    <Checkout
      items={items}
      recipient="0xYourWalletAddress"
      currency="USDC"
      chains={['arc', 'ethereum', 'polygon']}
      defaultChain="arc"
      showSummary={true}
      showChainSelector={true}
      showFees={true}
      showQRCode={true}
      branding={{
        name: 'My Store',
        logo: '/logo.png',
        primaryColor: '#06b6d4',
      }}
      onSuccess={(payment) => router.push(\`/success?tx=\${payment.txHash}\`)}
      onError={(error) => console.error(error.message)}
      onCancel={() => router.push('/cart')}
      testMode={process.env.NODE_ENV === 'development'}
    />
  )
}`,
    hook: `// Custom checkout with useCheckout hook
'use client'

import { useCheckout } from '@arcpay/react'

export default function CustomCheckout({ items }) {
  const {
    items: cartItems,
    addItem, removeItem, updateQuantity,
    subtotal, estimatedFee, total,
    supportedChains, selectedChain, setChain,
    status, isProcessing, error,
    initiatePayment, reset,
  } = useCheckout({
    items,
    recipient: '0xYourWalletAddress',
    currency: 'USDC',
    chains: ['arc', 'ethereum', 'polygon'],
    onSuccess: (payment) => console.log('Paid:', payment.txHash),
  })

  return (
    <div>
      {cartItems.map((item) => (
        <div key={item.id}>
          {item.name}: \${item.price} x {item.quantity}
          <button onClick={() => removeItem(item.id!)}>Remove</button>
        </div>
      ))}
      <p>Total: \${total.toFixed(2)} USDC</p>
      <select value={selectedChain} onChange={(e) => setChain(e.target.value)}>
        {supportedChains.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <button onClick={initiatePayment} disabled={isProcessing}>
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </button>
    </div>
  )
}`,
  },
  invoice: {
    basic: `// app/invoice/[id]/page.tsx
'use client'

import { Invoice } from '@arcpay/react'

export default function InvoicePage() {
  const invoiceData = {
    reference: 'INV-2024-001',
    customer: { name: 'Acme Corp', email: 'billing@acme.com' },
    items: [
      { description: 'API Integration (40 hrs)', amount: 6000 },
      { description: 'Smart Contract Audit', amount: 2500 }
    ],
    currency: 'USDC' as const,
    dueDate: '2024-02-15',
  }

  return (
    <Invoice
      invoice={invoiceData}
      recipient="0xYourWalletAddress"
      onPaid={(payment) => console.log('Invoice paid:', payment.txHash)}
    />
  )
}`,
    full: `// app/invoice/[id]/page.tsx - Full customization
'use client'

import { Invoice } from '@arcpay/react'

export default function InvoicePage({ params }) {
  const invoiceData = {
    id: params.id,
    reference: 'INV-2024-001',
    issuedDate: '2024-01-15',
    dueDate: '2024-02-15',
    customer: {
      name: 'Client Inc',
      email: 'accounts@client.com',
      address: '123 Business St, City',
    },
    items: [
      { description: 'API Integration', quantity: 40, unitPrice: 150, amount: 6000 },
      { description: 'Smart Contract Audit', quantity: 1, unitPrice: 2500, amount: 2500 }
    ],
    subtotal: 8500,
    taxAmount: 250,
    total: 8750,
    currency: 'USDC' as const,
  }

  return (
    <Invoice
      invoice={invoiceData}
      recipient="0xYourWalletAddress"
      branding={{
        name: 'Acme Corp',
        logo: '/logo.png',
        primaryColor: '#2563eb',
      }}
      showPdfDownload={true}
      showPrint={true}
      showPayButton={true}
      onPaid={(payment) => console.log('Paid:', payment.txHash)}
    />
  )
}`,
    hook: `// Custom invoice with useInvoice hook
'use client'

import { useInvoice } from '@arcpay/react'

export default function CustomInvoice({ data }) {
  const {
    invoice, isLoading,
    subtotal, taxAmount, total, amountDue,
    isPaid, isProcessing, payment, error,
    pay, downloadPdf, print,
  } = useInvoice({
    invoice: data,
    recipient: '0xYourWalletAddress',
    onPaid: (payment) => console.log('Paid:', payment.txHash),
  })

  if (isLoading) return <div>Loading...</div>
  if (!invoice) return <div>Not found</div>

  return (
    <div>
      <h1>Invoice #{invoice.reference}</h1>
      {invoice.items.map((item, i) => (
        <div key={i}>{item.description}: \${item.amount}</div>
      ))}
      <p>Total: \${total}</p>
      {isPaid ? (
        <p>Paid! TX: {payment?.txHash}</p>
      ) : (
        <button onClick={pay} disabled={isProcessing}>
          {isProcessing ? 'Processing...' : 'Pay Invoice'}
        </button>
      )}
      <button onClick={downloadPdf}>Download PDF</button>
    </div>
  )
}`,
  },
  plans: {
    basic: `// app/pricing/page.tsx
'use client'

import { useState } from 'react'
import { PlanSelector, type Plan } from '@arcpay/react'

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState('pro')

  const plans: Plan[] = [
    { id: 'starter', name: 'Starter', price: 9, interval: 'monthly', features: ['1k API calls', 'Email support'] },
    { id: 'pro', name: 'Pro', price: 29, interval: 'monthly', features: ['10k API calls', 'Priority support'] }
  ]

  return (
    <PlanSelector
      plans={plans}
      selected={selectedPlan}
      onChange={(planId) => setSelectedPlan(planId)}
    />
  )
}`,
    full: `// app/pricing/page.tsx - Full customization
'use client'

import { useState } from 'react'
import { PlanSelector, type Plan } from '@arcpay/react'

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState('pro')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const plans: Plan[] = [
    { id: 'starter', name: 'Starter', description: 'For individuals', price: 9, interval: 'monthly', features: ['1,000 API calls', 'Email support'] },
    { id: 'pro', name: 'Pro', description: 'For teams', price: 29, interval: 'monthly', popular: true, features: ['10,000 API calls', 'Priority support', 'Analytics'] },
    { id: 'enterprise', name: 'Enterprise', description: 'For large orgs', price: 99, interval: 'monthly', features: ['Unlimited API calls', '24/7 support', 'SLA guarantee'] }
  ]

  return (
    <PlanSelector
      plans={plans}
      selected={selectedPlan}
      currentPlan="starter"
      onChange={(planId) => setSelectedPlan(planId)}
      billingCycle={billingCycle}
      onBillingCycleChange={(cycle) => setBillingCycle(cycle)}
      showAnnualDiscount={true}
      annualDiscountPercent={20}
      highlightPopular={true}
      layout="grid"
    />
  )
}`,
    hook: `// Custom pricing with useSubscription hook
'use client'

import { useSubscription, type Plan } from '@arcpay/react'

export default function CustomPricing({ customerId, plans, currentSubscription }) {
  const {
    subscription, currentPlan, usage, history,
    isActive, isCancelled, willCancel, daysUntilRenewal,
    isUpgrading, isDowngrading, isCancelling, error,
    upgrade, downgrade, cancel, reactivate,
    canUpgradeTo, canDowngradeTo,
  } = useSubscription({
    customerId,
    plans,
    subscription: currentSubscription,
    onUpgrade: async (planId) => {
      await fetch('/api/upgrade', { method: 'POST', body: JSON.stringify({ planId }) })
    },
  })

  return (
    <div>
      {currentPlan && <h2>Current Plan: {currentPlan.name}</h2>}
      {plans.map((plan) => (
        <div key={plan.id}>
          <h3>{plan.name}</h3>
          <p>\${plan.price}/mo</p>
          {currentPlan?.id !== plan.id && (
            <button onClick={() => canUpgradeTo(plan.id) ? upgrade(plan.id) : downgrade(plan.id)}>
              {canUpgradeTo(plan.id) ? 'Upgrade' : 'Downgrade'}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}`,
  },
  balance: {
    basic: `// components/WalletBalance.tsx
'use client'

import { Balance, useWalletConnection } from '@arcpay/react'

export default function WalletBalance() {
  const { isConnected, address, chain, connect } = useWalletConnection({
    supportedChains: ['arc', 'ethereum', 'polygon'],
  })

  if (!isConnected) {
    return (
      <div className="text-center p-6">
        <p>Connect wallet to view balance</p>
        <button onClick={connect}>Connect Wallet</button>
      </div>
    )
  }

  return (
    <Balance
      address={address}
      chains={[chain]}
      currency="USDC"
      showTotal={false}
      compact={true}
    />
  )
}`,
    full: `// components/WalletDashboard.tsx - Full customization
'use client'

import { Balance } from '@arcpay/react'

export default function WalletDashboard({ walletAddress }) {
  return (
    <Balance
      address={walletAddress}
      chains={['arc', 'ethereum', 'polygon']}
      currency="USDC"
      showTotal={true}
      showBreakdown={true}
      compact={false}
      autoRefresh={true}
      refreshInterval={30000}
    />
  )
}

// Compact mode for headers/navbars
export function HeaderBalance({ address }) {
  return (
    <Balance
      address={address}
      chains={['arc']}
      currency="USDC"
      compact={true}
    />
  )
}`,
    hook: `// Custom balance with useBalance hook
'use client'

import { useBalance } from '@arcpay/react'

export default function CustomBalance({ address }) {
  const {
    balances, totalBalance,
    isLoading, error,
    refresh, getBalance,
  } = useBalance({
    address,
    chains: ['arc', 'ethereum', 'polygon'],
    currency: 'USDC',
    autoRefresh: true,
    refreshInterval: 30000,
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>{error.message}</div>

  const chainBalances = Object.values(balances)

  return (
    <div>
      <h2>Total: {totalBalance.amount} {totalBalance.currency}</h2>
      {chainBalances.map((b) => (
        <div key={b.chain}>
          <span>{b.chain}</span>
          <span>{b.balance.amount} {b.balance.currency}</span>
        </div>
      ))}
      <button onClick={refresh}>Refresh</button>
    </div>
  )
}`,
  },
  'transaction-history': {
    basic: `// components/ActivityFeed.tsx
'use client'

import { TransactionHistory } from '@arcpay/react'

export default function ActivityFeed() {
  return (
    <TransactionHistory
      address="0xYourWalletAddress"
      limit={10}
    />
  )
}`,
    full: `// app/activity/page.tsx - Full customization
'use client'

import { TransactionHistory } from '@arcpay/react'

export default function ActivityPage({ walletAddress }) {
  return (
    <TransactionHistory
      address={walletAddress}
      chains={['arc', 'ethereum', 'polygon']}
      limit={20}
      showFilters={true}
      showLoadMore={true}
    />
  )
}`,
    hook: `// Custom history with useTransactionHistory hook
'use client'

import { useTransactionHistory } from '@arcpay/react'

export default function CustomHistory({ address }) {
  const {
    transactions, filteredTransactions,
    hasMore, totalCount,
    isLoading, isLoadingMore, error,
    filter, setFilter, clearFilter,
    loadMore, refresh,
  } = useTransactionHistory({
    address,
    chains: ['arc', 'ethereum', 'polygon'],
    limit: 10,
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <select
        value={filter.type || ''}
        onChange={(e) => setFilter({ ...filter, type: e.target.value || undefined })}
      >
        <option value="">All types</option>
        <option value="payment">Payments</option>
        <option value="receive">Received</option>
      </select>
      {filteredTransactions.map((tx) => (
        <div key={tx.id}>
          <span>{tx.type}</span>
          <span>{tx.amount.amount} {tx.amount.currency}</span>
        </div>
      ))}
      {hasMore && (
        <button onClick={loadMore} disabled={isLoadingMore}>
          Load more
        </button>
      )}
    </div>
  )
}`,
  },
  'fiat-on-ramp': {
    basic: `// app/buy/page.tsx - Standalone on-ramp widget
'use client'

import { FiatOnRamp } from '@arcpay/react'

export default function BuyCryptoPage() {
  return (
    <FiatOnRamp
      amount="50.00"
      currency="USDC"
      chain="arc"
      walletAddress="0xYourWallet..."
      onSuccess={(transaction) => {
        console.log('Purchase complete:', transaction)
      }}
      onError={(error) => {
        console.error('Purchase failed:', error.message)
      }}
    />
  )
}`,
    full: `// Checkout with integrated on-ramp fallback
'use client'

import { Checkout, FiatOnRamp } from '@arcpay/react'

export function CheckoutWithOnRamp() {
  const items = [{ id: '1', name: 'Pro Plan', price: 29.99, quantity: 1 }]

  return (
    <Checkout
      items={items}
      recipient="0xMerchantWallet"
      currency="USDC"
      chains={['arc', 'ethereum', 'polygon']}
      enableOnRamp={true}
      walletAddress="0xUserWallet"
      fiatCurrency="USD"
      preferredOnRampProvider="circle"
      onOnRampSuccess={(tx) => console.log('Funds added:', tx)}
      onSuccess={(payment) => console.log('Payment complete:', payment)}
    />
  )
}

export function FullOnRamp() {
  return (
    <FiatOnRamp
      amount="100.00"
      currency="USDC"
      chain="arc"
      walletAddress="0xYourWallet"
      fiatCurrency="EUR"
      preferredProvider="circle"
      allowedProviders={['circle', 'moonpay']}
      showProviderSelection={true}
    />
  )
}`,
    hook: `// Custom on-ramp with useOnRamp hook
'use client'

import { useOnRamp, useBalanceCheck } from '@arcpay/react'

export default function CustomOnRamp({ amount, walletAddress }) {
  const balance = useBalanceCheck({
    walletAddress,
    chain: 'arc',
    currency: 'USDC',
    amountNeeded: amount,
  })

  const {
    status, selectedProvider, availableProviders,
    quotes, isLoadingQuotes, isProcessing,
    fiatAmount, selectProvider, startPurchase,
  } = useOnRamp({
    amount,
    currency: 'USDC',
    chain: 'arc',
    walletAddress,
    autoFetchQuotes: true,
  })

  if (balance.isSufficient) return <p>Balance OK</p>
  if (isLoadingQuotes) return <p>Loading...</p>

  return (
    <div>
      {availableProviders.map((p) => (
        <button key={p.provider} onClick={() => selectProvider(p.provider)}>
          {p.name} - {p.feePercent}% fee
          {quotes[p.provider] && ' $' + quotes[p.provider].fiatAmount}
        </button>
      ))}
      <button onClick={startPurchase} disabled={!selectedProvider}>
        Pay {fiatAmount.toFixed(2)} USD
      </button>
    </div>
  )
}`,
  },
};
