'use client';

import { useState } from 'react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: 'setup' | 'payments' | 'subscriptions' | 'webhooks';
  code: string;
}

const templates: Template[] = [
  {
    id: 'provider-setup',
    name: 'Provider Setup',
    description: 'Basic ArcPayProvider setup with configuration',
    category: 'setup',
    code: `import { ArcPayProvider } from '@arcpay/react';

function App({ children }) {
  return (
    <ArcPayProvider
      config={{
        apiKey: process.env.NEXT_PUBLIC_ARCPAY_API_KEY,
        network: 'testnet', // or 'mainnet'
      }}
    >
      {children}
    </ArcPayProvider>
  );
}

export default App;`,
  },
  {
    id: 'wallet-connect',
    name: 'Wallet Connection',
    description: 'Connect and display wallet with balance',
    category: 'setup',
    code: `import { useWallet, useBalance } from '@arcpay/react';

function WalletConnect() {
  const { address, isConnected, isConnecting, connect, disconnect } = useWallet();
  const { balance, isLoading } = useBalance();

  if (!isConnected) {
    return (
      <button
        onClick={connect}
        disabled={isConnecting}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div>
        <span className="text-sm text-gray-500">Balance</span>
        <p className="font-bold">
          {isLoading ? '...' : \`\${balance} USDC\`}
        </p>
      </div>
      <div>
        <span className="text-sm text-gray-500">Address</span>
        <p className="font-mono text-sm">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </p>
      </div>
      <button
        onClick={disconnect}
        className="px-3 py-1 text-sm border rounded"
      >
        Disconnect
      </button>
    </div>
  );
}`,
  },
  {
    id: 'pay-button',
    name: 'Pay Button',
    description: 'Simple payment button component',
    category: 'payments',
    code: `import { useTransfer, useWallet } from '@arcpay/react';

interface PayButtonProps {
  amount: string;
  recipient: string;
  onSuccess?: (tx: any) => void;
  onError?: (error: Error) => void;
}

function PayButton({ amount, recipient, onSuccess, onError }: PayButtonProps) {
  const { isConnected, connect } = useWallet();
  const { transfer, isTransferring } = useTransfer();

  const handlePay = async () => {
    if (!isConnected) {
      await connect();
      return;
    }

    try {
      const result = await transfer({
        to: recipient,
        amount,
        memo: 'Payment',
      });
      onSuccess?.(result.transaction);
    } catch (error) {
      onError?.(error as Error);
    }
  };

  return (
    <button
      onClick={handlePay}
      disabled={isTransferring}
      className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50"
    >
      {isTransferring
        ? 'Processing...'
        : isConnected
        ? \`Pay \${amount} USDC\`
        : 'Connect & Pay'}
    </button>
  );
}`,
  },
  {
    id: 'checkout-flow',
    name: 'Checkout Flow',
    description: 'Complete checkout flow with confirmation',
    category: 'payments',
    code: `import { useState } from 'react';
import { useWallet, useTransfer, useBalance } from '@arcpay/react';

interface CheckoutProps {
  items: Array<{ name: string; price: number }>;
  merchantAddress: string;
}

function Checkout({ items, merchantAddress }: CheckoutProps) {
  const { isConnected, connect } = useWallet();
  const { balance } = useBalance();
  const { transfer, isTransferring } = useTransfer();
  const [step, setStep] = useState<'review' | 'confirm' | 'success'>('review');
  const [txHash, setTxHash] = useState<string | null>(null);

  const total = items.reduce((sum, item) => sum + item.price, 0);
  const hasEnoughBalance = parseFloat(balance) >= total;

  const handleCheckout = async () => {
    if (!isConnected) {
      await connect();
      return;
    }

    setStep('confirm');

    try {
      const result = await transfer({
        to: merchantAddress,
        amount: total.toFixed(2),
        memo: \`Order: \${items.map(i => i.name).join(', ')}\`,
      });

      setTxHash(result.transaction.hash);
      setStep('success');
    } catch (error) {
      setStep('review');
      console.error('Checkout failed:', error);
    }
  };

  if (step === 'success') {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">Success!</div>
        <p className="text-gray-600 mb-4">Your payment has been confirmed.</p>
        <a
          href={\`https://explorer.arc.io/tx/\${txHash}\`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          View Transaction
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow">
      <h2 className="text-xl font-bold mb-4">Checkout</h2>

      {/* Items */}
      <div className="space-y-2 mb-4">
        {items.map((item, i) => (
          <div key={i} className="flex justify-between">
            <span>{item.name}</span>
            <span>\${item.price.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <hr className="my-4" />

      {/* Total */}
      <div className="flex justify-between font-bold mb-6">
        <span>Total</span>
        <span>\${total.toFixed(2)} USDC</span>
      </div>

      {/* Balance Warning */}
      {isConnected && !hasEnoughBalance && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4 text-sm">
          Insufficient balance. You have {balance} USDC.
        </div>
      )}

      {/* Pay Button */}
      <button
        onClick={handleCheckout}
        disabled={isTransferring || (isConnected && !hasEnoughBalance)}
        className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold disabled:opacity-50"
      >
        {isTransferring
          ? 'Processing Payment...'
          : isConnected
          ? 'Confirm & Pay'
          : 'Connect Wallet'}
      </button>
    </div>
  );
}`,
  },
  {
    id: 'subscription-checkout',
    name: 'Subscription Checkout',
    description: 'Subscribe to a plan with recurring payments',
    category: 'subscriptions',
    code: `import { useState } from 'react';
import { useSubscription, useSubscriptionPlans, useWallet } from '@arcpay/react';

function SubscriptionCheckout({ planId }: { planId: string }) {
  const { isConnected, connect } = useWallet();
  const { plans, isLoading: plansLoading } = useSubscriptionPlans();
  const { subscribe, isSubscribing, subscription } = useSubscription();
  const [error, setError] = useState<string | null>(null);

  const plan = plans.find(p => p.id === planId);

  const handleSubscribe = async () => {
    if (!isConnected) {
      await connect();
      return;
    }

    setError(null);

    try {
      await subscribe({
        planId,
        approveAmount: plan?.amount,
      });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (subscription) {
    return (
      <div className="p-6 bg-green-50 rounded-2xl">
        <h3 className="text-lg font-bold text-green-800">Subscribed!</h3>
        <p className="text-green-600">
          You&apos;re now subscribed to {plan?.name}.
          Next billing: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
        </p>
      </div>
    );
  }

  if (plansLoading || !plan) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-md p-6 bg-white rounded-2xl shadow">
      <h2 className="text-xl font-bold mb-2">{plan.name}</h2>
      <p className="text-gray-600 mb-4">{plan.description}</p>

      <div className="text-3xl font-bold mb-6">
        \${plan.amount} <span className="text-lg text-gray-500">/{plan.interval}</span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        onClick={handleSubscribe}
        disabled={isSubscribing}
        className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold disabled:opacity-50"
      >
        {isSubscribing
          ? 'Setting up subscription...'
          : isConnected
          ? 'Subscribe Now'
          : 'Connect & Subscribe'}
      </button>

      <p className="text-xs text-gray-500 mt-3 text-center">
        By subscribing, you authorize automatic USDC payments.
      </p>
    </div>
  );
}`,
  },
  {
    id: 'webhook-handler',
    name: 'Webhook Handler',
    description: 'Server-side webhook handler with verification',
    category: 'webhooks',
    code: `// app/api/webhooks/arcpay/route.ts
import { ArcPay, verifyWebhookSignature } from '@arcpay/node';

const arcpay = new ArcPay({
  apiKey: process.env.ARCPAY_API_KEY!,
  webhookSecret: process.env.ARCPAY_WEBHOOK_SECRET!,
});

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('X-ArcPay-Signature');

  // Verify signature
  const isValid = verifyWebhookSignature({
    payload: body,
    signature: signature!,
    secret: process.env.ARCPAY_WEBHOOK_SECRET!,
  });

  if (!isValid) {
    return new Response('Invalid signature', { status: 401 });
  }

  const event = JSON.parse(body);

  // Handle different event types
  switch (event.type) {
    case 'payment.completed':
      await handlePaymentCompleted(event.data);
      break;

    case 'payment.failed':
      await handlePaymentFailed(event.data);
      break;

    case 'subscription.renewed':
      await handleSubscriptionRenewed(event.data);
      break;

    case 'subscription.cancelled':
      await handleSubscriptionCancelled(event.data);
      break;

    default:
      console.log(\`Unhandled event type: \${event.type}\`);
  }

  return new Response('OK', { status: 200 });
}

async function handlePaymentCompleted(data: any) {
  // Update order status in your database
  console.log('Payment completed:', data.paymentId);
}

async function handlePaymentFailed(data: any) {
  // Notify customer, retry, or cancel order
  console.log('Payment failed:', data.paymentId, data.failureReason);
}

async function handleSubscriptionRenewed(data: any) {
  // Extend user access, send receipt
  console.log('Subscription renewed:', data.subscriptionId);
}

async function handleSubscriptionCancelled(data: any) {
  // Revoke access at period end
  console.log('Subscription cancelled:', data.subscriptionId);
}`,
  },
  {
    id: 'node-server',
    name: 'Node.js Server Setup',
    description: 'Backend integration with ArcPay Node SDK',
    category: 'webhooks',
    code: `// server.ts
import { ArcPay } from '@arcpay/node';

const arcpay = new ArcPay({
  apiKey: process.env.ARCPAY_API_KEY!,
  webhookSecret: process.env.ARCPAY_WEBHOOK_SECRET,
  network: 'testnet', // or 'mainnet'
});

// Create a payment request
async function createPaymentRequest(amount: string, customerId: string) {
  const payment = await arcpay.payments.create({
    amount,
    currency: 'USDC',
    customerId,
    metadata: {
      orderId: 'order_123',
    },
  });

  return payment;
}

// Get payment status
async function getPaymentStatus(paymentId: string) {
  const payment = await arcpay.payments.get(paymentId);
  return payment.status;
}

// Create subscription
async function createSubscription(customerId: string, planId: string) {
  const subscription = await arcpay.subscriptions.create({
    customerId,
    planId,
  });

  return subscription;
}

// Cancel subscription
async function cancelSubscription(subscriptionId: string) {
  await arcpay.subscriptions.cancel(subscriptionId, {
    cancelAtPeriodEnd: true,
  });
}

// Run health check
async function checkHealth() {
  const report = await arcpay.healthCheck();
  console.log(arcpay.formatHealthReport(report));
  return report.overall === 'healthy';
}`,
  },
];

const categories = [
  { id: 'setup', name: 'Setup', icon: 'cog' },
  { id: 'payments', name: 'Payments', icon: 'credit-card' },
  { id: 'subscriptions', name: 'Subscriptions', icon: 'refresh' },
  { id: 'webhooks', name: 'Webhooks', icon: 'webhook' },
];

function CategoryIcon({ icon }: { icon: string }) {
  switch (icon) {
    case 'cog':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case 'credit-card':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      );
    case 'refresh':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      );
    case 'webhook':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function GeneratorPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('setup');
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(templates[0]);
  const [copied, setCopied] = useState(false);

  const filteredTemplates = templates.filter((t) => t.category === selectedCategory);

  const copyCode = () => {
    navigator.clipboard.writeText(selectedTemplate.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Code Generator</h1>
        <p className="text-zinc-400">
          Generate ready-to-use code snippets for common integration patterns.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              const firstInCategory = templates.find((t) => t.category === cat.id);
              if (firstInCategory) setSelectedTemplate(firstInCategory);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              selectedCategory === cat.id
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <CategoryIcon icon={cat.icon} />
            {cat.name}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Template List */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-semibold text-white mb-4">Templates</h2>
          <div className="space-y-2">
            {filteredTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedTemplate.id === template.id
                    ? 'bg-orange-500/10 border-orange-500/30 text-white'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="font-medium mb-1">{template.name}</div>
                <div className="text-sm text-zinc-500">{template.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Code Preview */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <div>
                <h2 className="text-lg font-semibold text-white">{selectedTemplate.name}</h2>
                <p className="text-sm text-zinc-400">{selectedTemplate.description}</p>
              </div>
              <button
                onClick={copyCode}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  copied
                    ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                    : 'bg-zinc-800 text-white hover:bg-zinc-700'
                }`}
              >
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>

            {/* Code */}
            <div className="p-6 max-h-[600px] overflow-auto">
              <pre className="text-sm font-mono leading-relaxed">
                <code className="text-zinc-300 whitespace-pre-wrap">{selectedTemplate.code}</code>
              </pre>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="mt-6 bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-300 mb-2">Quick Tips</h3>
            <ul className="text-sm text-zinc-500 space-y-1">
              <li>
                * Replace <code className="text-blue-400">process.env.*</code> with your actual keys
              </li>
              <li>
                * Use <code className="text-blue-400">testnet</code> for development,{' '}
                <code className="text-blue-400">mainnet</code> for production
              </li>
              <li>* Always verify webhook signatures in production</li>
              <li>* Handle all error cases gracefully</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
