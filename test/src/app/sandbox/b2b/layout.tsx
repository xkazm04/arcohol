'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MockB2BProvider } from '@/mocks/MockB2BProvider';

const b2bNavItems = [
  { href: '/sandbox/b2b', label: 'Overview', icon: '📊' },
  { href: '/sandbox/b2b/credits', label: 'Credits & Usage', icon: '💳' },
  { href: '/sandbox/b2b/invoices', label: 'Invoices', icon: '📄' },
  { href: '/sandbox/b2b/disputes', label: 'Disputes', icon: '⚖️' },
  { href: '/sandbox/b2b/treasury', label: 'Treasury', icon: '🏦' },
];

export default function B2BLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <MockB2BProvider>
      <div className="min-h-screen bg-zinc-950 text-white">
        {/* Header */}
        <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/sandbox" className="text-zinc-400 hover:text-white transition-colors">
                  ← Sandbox
                </Link>
                <div className="h-4 w-px bg-zinc-700" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  B2B Demo
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded">
                  @arcpay/b2b
                </span>
                <span className="text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded">
                  Demo Mode
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex gap-6">
            {/* Sidebar Navigation */}
            <aside className="w-56 flex-shrink-0">
              <nav className="sticky top-24 space-y-1">
                {b2bNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}

                {/* Fee Comparison */}
                <div className="mt-6 p-4 bg-zinc-900 rounded-xl border border-zinc-800">
                  <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
                    Fee Savings
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Stripe</span>
                      <span className="text-red-400">2.9%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Arc B2B</span>
                      <span className="text-green-400">~0.1%</span>
                    </div>
                    <div className="h-px bg-zinc-800 my-2" />
                    <div className="flex justify-between font-medium">
                      <span className="text-zinc-300">Savings</span>
                      <span className="text-green-400">96%+</span>
                    </div>
                  </div>
                </div>
              </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              {children}
            </main>
          </div>
        </div>
      </div>
    </MockB2BProvider>
  );
}
