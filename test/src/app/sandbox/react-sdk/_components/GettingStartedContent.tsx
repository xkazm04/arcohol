'use client';

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { transparentDark } from '../_lib/syntax-theme';
import { packageManagerCommands } from '../_lib/constants';
import type { PackageManager } from '../_lib/types';

export function GettingStartedContent() {
  const [pm, setPm] = useState<PackageManager>('npm');

  return (
    <div className="space-y-5 w-full max-w-2xl">
      {/* Step 1 - Get API Key */}
      <div className="rounded-lg border border-slate-700/50 bg-transparent overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700/50">
          <span className="w-6 h-6 rounded-full bg-cyan-500 text-black text-xs font-bold flex items-center justify-center shrink-0">
            1
          </span>
          <span className="text-sm font-medium text-white">Get your API key</span>
          <span className="text-xs text-slate-500 font-mono ml-auto">.env.local</span>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-xs text-slate-400 leading-relaxed">
            The{' '}
            <code className="text-cyan-400 bg-slate-800/50 px-1.5 py-0.5 rounded">
              NEXT_PUBLIC_ARCPAY_KEY
            </code>{' '}
            authenticates your app with ArcPay services. The{' '}
            <code className="text-cyan-400 bg-slate-800/50 px-1.5 py-0.5 rounded">NEXT_PUBLIC_</code>{' '}
            prefix exposes it to the browser (required for client-side components).
          </p>
          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
            <code className="text-sm font-mono text-green-400">
              NEXT_PUBLIC_ARCPAY_KEY=pk_live_xxxxxxxxxxxx
            </code>
          </div>
          <p className="text-[11px] text-slate-500">
            Get your key from the <span className="text-cyan-400">ArcPay Dashboard</span> → Settings →
            API Keys
          </p>
        </div>
      </div>

      {/* Step 2 - Install */}
      <div className="rounded-lg border border-slate-700/50 bg-transparent overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700/50">
          <span className="w-6 h-6 rounded-full bg-cyan-500 text-black text-xs font-bold flex items-center justify-center shrink-0">
            2
          </span>
          <span className="text-sm font-medium text-white">Install the package</span>
        </div>
        <div className="flex border-b border-slate-700/50">
          {(['npm', 'yarn', 'pnpm', 'bun'] as PackageManager[]).map((p) => (
            <button
              key={p}
              onClick={() => setPm(p)}
              className={`px-4 py-2 text-xs font-medium transition-colors ${
                pm === p
                  ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-900/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="p-3 bg-slate-900/30">
          <code className="text-sm font-mono text-green-400">{packageManagerCommands[pm]}</code>
        </div>
      </div>

      {/* Step 3 - Provider */}
      <div className="rounded-lg border border-slate-700/50 bg-transparent overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700/50">
          <span className="w-6 h-6 rounded-full bg-cyan-500 text-black text-xs font-bold flex items-center justify-center shrink-0">
            3
          </span>
          <span className="text-sm font-medium text-white">Add provider to your app</span>
          <span className="text-xs text-slate-500 font-mono ml-auto">app/layout.tsx</span>
        </div>
        <SyntaxHighlighter
          language="tsx"
          style={transparentDark}
          customStyle={{ margin: 0, borderRadius: 0, fontSize: '12px', background: 'transparent' }}
        >
          {`import { ArcPayProvider } from '@arcpay/react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ArcPayProvider
          publicKey={process.env.NEXT_PUBLIC_ARCPAY_KEY!}  // Your API key
          environment="sandbox"  // "sandbox" for testing, "production" for live
        >
          {children}
        </ArcPayProvider>
      </body>
    </html>
  )
}`}
        </SyntaxHighlighter>
      </div>

      {/* Step 4 - Use Components */}
      <div className="rounded-lg border border-slate-700/50 bg-transparent overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700/50">
          <span className="w-6 h-6 rounded-full bg-cyan-500 text-black text-xs font-bold flex items-center justify-center shrink-0">
            4
          </span>
          <span className="text-sm font-medium text-white">Use components in your pages</span>
          <span className="text-xs text-slate-500 font-mono ml-auto">app/page.tsx</span>
        </div>
        <SyntaxHighlighter
          language="tsx"
          style={transparentDark}
          customStyle={{ margin: 0, borderRadius: 0, fontSize: '12px', background: 'transparent' }}
        >
          {`'use client'  // Required for interactive components

import { Checkout, Balance } from '@arcpay/react'

export default function HomePage() {
  const items = [{ id: '1', name: 'Pro Plan', price: 29.99, quantity: 1 }]

  return (
    <main className="p-8">
      <Balance address="0x..." chains={['arc', 'ethereum']} />
      <Checkout
        items={items}
        recipient="0xYourWalletAddress"  // Where payments are sent
        onSuccess={(payment) => console.log('Paid!', payment)}
      />
    </main>
  )
}`}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
