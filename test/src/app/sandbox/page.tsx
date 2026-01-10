'use client';

import Link from 'next/link';

const features = [
  {
    title: 'API Explorer',
    description: 'Test SDK hooks and methods interactively. See real-time responses and experiment with parameters.',
    href: '/sandbox/api-explorer',
    icon: 'code',
    color: 'blue',
  },
  {
    title: 'Webhook Simulator',
    description: 'Simulate webhook events to test your integration. Generate payloads and verify signatures.',
    href: '/sandbox/webhooks',
    icon: 'webhook',
    color: 'purple',
  },
  {
    title: 'Health Check',
    description: 'Run diagnostics on your SDK configuration. Verify connectivity and identify issues.',
    href: '/sandbox/health',
    icon: 'heart',
    color: 'green',
  },
  {
    title: 'Code Generator',
    description: 'Generate integration code snippets for common use cases. Copy and paste into your project.',
    href: '/sandbox/generator',
    icon: 'sparkles',
    color: 'orange',
  },
];

function FeatureIcon({ icon, color }: { icon: string; color: string }) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400',
    purple: 'bg-purple-500/10 text-purple-400',
    green: 'bg-green-500/10 text-green-400',
    orange: 'bg-orange-500/10 text-orange-400',
  };

  const iconClass = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

  return (
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconClass}`}>
      {icon === 'code' && (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      )}
      {icon === 'webhook' && (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )}
      {icon === 'heart' && (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )}
      {icon === 'sparkles' && (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )}
    </div>
  );
}

export default function SandboxOverview() {
  return (
    <div>
      {/* Hero */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Developer Sandbox</h1>
        <p className="text-xl text-zinc-400 max-w-2xl">
          Explore, test, and prototype with the ArcPay SDK. This interactive environment
          lets you experiment with APIs before integrating into your application.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mb-12">
        <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
          <div className="text-2xl font-bold text-white mb-1">19</div>
          <div className="text-sm text-zinc-400">React Hooks</div>
        </div>
        <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
          <div className="text-2xl font-bold text-white mb-1">8</div>
          <div className="text-sm text-zinc-400">Webhook Events</div>
        </div>
        <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
          <div className="text-2xl font-bold text-white mb-1">12</div>
          <div className="text-sm text-zinc-400">Components</div>
        </div>
        <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
          <div className="text-2xl font-bold text-green-400 mb-1">Active</div>
          <div className="text-sm text-zinc-400">SDK Status</div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {features.map((feature) => (
          <Link
            key={feature.href}
            href={feature.href}
            className="group bg-zinc-900 rounded-2xl p-6 border border-zinc-800 hover:border-zinc-700 transition-all hover:shadow-lg hover:shadow-black/20"
          >
            <FeatureIcon icon={feature.icon} color={feature.color} />
            <h3 className="text-xl font-semibold text-white mt-4 mb-2 group-hover:text-blue-400 transition-colors">
              {feature.title}
            </h3>
            <p className="text-zinc-400">{feature.description}</p>
            <div className="mt-4 text-sm text-blue-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Explore
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* Getting Started */}
      <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl p-8 border border-blue-500/20">
        <h2 className="text-2xl font-bold text-white mb-4">Getting Started</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="text-blue-400 font-mono text-sm mb-2">Step 1</div>
            <h3 className="text-lg font-semibold text-white mb-2">Install the SDK</h3>
            <div className="bg-zinc-900/80 rounded-lg p-3 font-mono text-sm text-zinc-300">
              npm install @arcpay/react
            </div>
          </div>
          <div>
            <div className="text-blue-400 font-mono text-sm mb-2">Step 2</div>
            <h3 className="text-lg font-semibold text-white mb-2">Wrap Your App</h3>
            <div className="bg-zinc-900/80 rounded-lg p-3 font-mono text-sm text-zinc-300">
              {`<ArcPayProvider>`}
            </div>
          </div>
          <div>
            <div className="text-blue-400 font-mono text-sm mb-2">Step 3</div>
            <h3 className="text-lg font-semibold text-white mb-2">Use Hooks</h3>
            <div className="bg-zinc-900/80 rounded-lg p-3 font-mono text-sm text-zinc-300">
              useWallet(), useBalance()
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
