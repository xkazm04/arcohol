'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MockB2BProvider } from '@/mocks/MockB2BProvider';

const b2bNavItems = [
  { href: '/sandbox/b2b', label: 'Overview' },
  { href: '/sandbox/b2b/credits', label: 'Subscriptions' },
  { href: '/sandbox/b2b/usdy', label: 'USDY' },
  { href: '/sandbox/b2b/invoices', label: 'Invoices' },
  { href: '/sandbox/b2b/disputes', label: 'Disputes' },
  { href: '/sandbox/b2b/agents', label: 'Agents' },
  { href: '/sandbox/b2b/x402', label: 'x402 API' },
  { href: '/sandbox/b2b/crosschain', label: 'CrossChain' },
  { href: '/sandbox/b2b/webhooks', label: 'Webhooks' },
  { href: '/sandbox/b2b/settings', label: 'Settings' },
];

export default function B2BLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <MockB2BProvider>
      <div className="space-y-4">
        {/* Navigation */}
        <div className="flex items-center gap-2 flex-wrap">
          {b2bNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-500 hover:text-slate-300 border border-transparent'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Content */}
        {children}
      </div>
    </MockB2BProvider>
  );
}
