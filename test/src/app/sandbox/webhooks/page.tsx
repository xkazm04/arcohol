'use client';

import { useState } from 'react';

interface WebhookEvent {
  type: string;
  description: string;
  payload: Record<string, unknown>;
}

const webhookEvents: WebhookEvent[] = [
  {
    type: 'payment.initiated',
    description: 'Triggered when a payment is initiated',
    payload: {
      id: 'pay_1234567890',
      type: 'payment.initiated',
      timestamp: new Date().toISOString(),
      data: {
        paymentId: 'pay_1234567890',
        amount: '99.99',
        currency: 'USDC',
        status: 'pending',
        merchantId: 'merch_abc123',
        customerId: 'cus_xyz789',
      },
    },
  },
  {
    type: 'payment.completed',
    description: 'Triggered when a payment is confirmed on-chain',
    payload: {
      id: 'pay_1234567890',
      type: 'payment.completed',
      timestamp: new Date().toISOString(),
      data: {
        paymentId: 'pay_1234567890',
        amount: '99.99',
        currency: 'USDC',
        status: 'completed',
        transactionHash: '0x' + 'a'.repeat(64),
        merchantId: 'merch_abc123',
        customerId: 'cus_xyz789',
      },
    },
  },
  {
    type: 'payment.failed',
    description: 'Triggered when a payment fails',
    payload: {
      id: 'pay_1234567890',
      type: 'payment.failed',
      timestamp: new Date().toISOString(),
      data: {
        paymentId: 'pay_1234567890',
        amount: '99.99',
        currency: 'USDC',
        status: 'failed',
        failureReason: 'insufficient_funds',
        merchantId: 'merch_abc123',
        customerId: 'cus_xyz789',
      },
    },
  },
  {
    type: 'subscription.created',
    description: 'Triggered when a subscription is created',
    payload: {
      id: 'sub_1234567890',
      type: 'subscription.created',
      timestamp: new Date().toISOString(),
      data: {
        subscriptionId: 'sub_1234567890',
        planId: 'plan_pro_monthly',
        customerId: 'cus_xyz789',
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    },
  },
  {
    type: 'subscription.renewed',
    description: 'Triggered when a subscription is renewed',
    payload: {
      id: 'sub_1234567890',
      type: 'subscription.renewed',
      timestamp: new Date().toISOString(),
      data: {
        subscriptionId: 'sub_1234567890',
        planId: 'plan_pro_monthly',
        customerId: 'cus_xyz789',
        status: 'active',
        invoiceId: 'inv_abc123',
        amount: '29.99',
      },
    },
  },
  {
    type: 'subscription.cancelled',
    description: 'Triggered when a subscription is cancelled',
    payload: {
      id: 'sub_1234567890',
      type: 'subscription.cancelled',
      timestamp: new Date().toISOString(),
      data: {
        subscriptionId: 'sub_1234567890',
        planId: 'plan_pro_monthly',
        customerId: 'cus_xyz789',
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        reason: 'customer_request',
      },
    },
  },
  {
    type: 'wallet.created',
    description: 'Triggered when a new wallet is created',
    payload: {
      id: 'wallet_1234567890',
      type: 'wallet.created',
      timestamp: new Date().toISOString(),
      data: {
        walletId: 'wallet_1234567890',
        address: '0x' + 'b'.repeat(40),
        chain: 'arc',
        type: 'circle',
      },
    },
  },
  {
    type: 'transfer.completed',
    description: 'Triggered when a transfer is confirmed',
    payload: {
      id: 'tx_1234567890',
      type: 'transfer.completed',
      timestamp: new Date().toISOString(),
      data: {
        transactionId: 'tx_1234567890',
        transactionHash: '0x' + 'c'.repeat(64),
        amount: '50.00',
        currency: 'USDC',
        fromAddress: '0x' + 'd'.repeat(40),
        toAddress: '0x' + 'e'.repeat(40),
        status: 'completed',
      },
    },
  },
];

function generateSignature(payload: string, secret: string): string {
  // Simulated HMAC signature
  const encoder = new TextEncoder();
  const payloadBytes = encoder.encode(payload);
  const secretBytes = encoder.encode(secret);

  // Simple hash simulation (in real implementation use HMAC-SHA256)
  let hash = 0;
  for (let i = 0; i < payloadBytes.length; i++) {
    hash = ((hash << 5) - hash) + payloadBytes[i] + secretBytes[i % secretBytes.length];
    hash = hash & hash;
  }

  const hexHash = Math.abs(hash).toString(16).padStart(64, '0');
  return `sha256=${hexHash}`;
}

export default function WebhooksPage() {
  const [selectedEvent, setSelectedEvent] = useState<WebhookEvent>(webhookEvents[0]);
  const [webhookSecret, setWebhookSecret] = useState('whsec_test_secret_key_12345');
  const [customPayload, setCustomPayload] = useState('');
  const [sentWebhooks, setSentWebhooks] = useState<Array<{ event: string; timestamp: string; status: 'success' | 'error' }>>([]);
  const [webhookUrl, setWebhookUrl] = useState('https://your-app.com/api/webhooks/arcpay');

  const currentPayload = customPayload || JSON.stringify(selectedEvent.payload, null, 2);
  const signature = generateSignature(currentPayload, webhookSecret);

  const simulateSend = () => {
    setSentWebhooks((prev) => [
      { event: selectedEvent.type, timestamp: new Date().toISOString(), status: 'success' },
      ...prev.slice(0, 9),
    ]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Webhook Simulator</h1>
        <p className="text-zinc-400">
          Test your webhook integration by simulating events. Generate payloads and verify signatures.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Event Selector */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-semibold text-white mb-4">Event Types</h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
            {webhookEvents.map((event) => (
              <button
                key={event.type}
                onClick={() => {
                  setSelectedEvent(event);
                  setCustomPayload('');
                }}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedEvent.type === event.type
                    ? 'bg-purple-500/10 border-purple-500/30 text-white'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="font-mono text-sm text-purple-400 mb-1">{event.type}</div>
                <div className="text-xs">{event.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Webhook Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Configuration */}
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <h2 className="text-lg font-semibold text-white mb-4">Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Webhook URL</label>
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Webhook Secret</label>
                <input
                  type="text"
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Payload */}
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Payload</h2>
              <button
                onClick={() => copyToClipboard(currentPayload)}
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Copy
              </button>
            </div>
            <textarea
              value={currentPayload}
              onChange={(e) => setCustomPayload(e.target.value)}
              rows={12}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-green-400 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          {/* Signature */}
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Signature</h2>
              <button
                onClick={() => copyToClipboard(signature)}
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Copy
              </button>
            </div>
            <div className="bg-zinc-800 rounded-lg p-4 font-mono text-sm text-blue-400 break-all">
              X-ArcPay-Signature: {signature}
            </div>
            <p className="text-xs text-zinc-500 mt-3">
              This signature is generated using HMAC-SHA256 with your webhook secret.
              Verify this header in your webhook handler.
            </p>
          </div>

          {/* Send Button */}
          <button
            onClick={simulateSend}
            className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
          >
            Simulate Webhook Delivery
          </button>

          {/* Sent Webhooks Log */}
          {sentWebhooks.length > 0 && (
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
              <h2 className="text-lg font-semibold text-white mb-4">Delivery Log</h2>
              <div className="space-y-2">
                {sentWebhooks.map((webhook, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 px-3 bg-zinc-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          webhook.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      />
                      <span className="font-mono text-sm text-zinc-300">{webhook.event}</span>
                    </div>
                    <span className="text-xs text-zinc-500">
                      {new Date(webhook.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Handler Example */}
      <div className="mt-8 bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
        <h2 className="text-lg font-semibold text-white mb-4">Webhook Handler Example</h2>
        <pre className="bg-zinc-800 rounded-lg p-4 text-sm overflow-x-auto">
          <code className="text-zinc-300">
            <span className="text-purple-400">import</span> {'{'}{' '}
            <span className="text-blue-400">verifyWebhookSignature</span> {'}'}{' '}
            <span className="text-purple-400">from</span>{' '}
            <span className="text-green-400">&apos;@arcpay/node&apos;</span>;{'\n\n'}
            <span className="text-purple-400">export async function</span>{' '}
            <span className="text-yellow-400">POST</span>(request: Request) {'{\n'}
            {'  '}<span className="text-purple-400">const</span> body ={' '}
            <span className="text-purple-400">await</span> request.text();{'\n'}
            {'  '}<span className="text-purple-400">const</span> signature = request.headers.get(
            <span className="text-green-400">&apos;X-ArcPay-Signature&apos;</span>);{'\n\n'}
            {'  '}<span className="text-purple-400">const</span> isValid = verifyWebhookSignature({'{'}
            {'\n'}
            {'    '}payload: body,{'\n'}
            {'    '}signature,{'\n'}
            {'    '}secret: process.env.ARCPAY_WEBHOOK_SECRET,{'\n'}
            {'  '}{'}'});{'\n\n'}
            {'  '}<span className="text-purple-400">if</span> (!isValid) {'{\n'}
            {'    '}<span className="text-purple-400">return new</span>{' '}
            Response(<span className="text-green-400">&apos;Invalid signature&apos;</span>, {'{'} status:{' '}
            <span className="text-orange-400">401</span> {'}'});{'\n'}
            {'  '}{'}\n\n'}
            {'  '}<span className="text-purple-400">const</span> event = JSON.parse(body);{'\n'}
            {'  '}<span className="text-purple-400">switch</span> (event.type) {'{\n'}
            {'    '}<span className="text-purple-400">case</span>{' '}
            <span className="text-green-400">&apos;payment.completed&apos;</span>:{'\n'}
            {'      '}<span className="text-zinc-500">// Handle payment completion</span>{'\n'}
            {'      '}<span className="text-purple-400">break</span>;{'\n'}
            {'    '}<span className="text-purple-400">case</span>{' '}
            <span className="text-green-400">&apos;subscription.renewed&apos;</span>:{'\n'}
            {'      '}<span className="text-zinc-500">// Handle subscription renewal</span>{'\n'}
            {'      '}<span className="text-purple-400">break</span>;{'\n'}
            {'  '}{'}\n\n'}
            {'  '}<span className="text-purple-400">return new</span>{' '}
            Response(<span className="text-green-400">&apos;OK&apos;</span>, {'{'} status:{' '}
            <span className="text-orange-400">200</span> {'}'});{'\n'}
            {'}'}
          </code>
        </pre>
      </div>
    </div>
  );
}
