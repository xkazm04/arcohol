'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet, ARC_TESTNET } from '../../hooks/useWallet';
import { MockArcPayProvider } from '../../mocks/MockArcPayProvider';

const navItems = [
  { href: '/sandbox', label: 'Overview', icon: 'grid', exact: true },
  { href: '/sandbox/wallet', label: 'Wallet Integration', icon: 'wallet' },
  { href: '/sandbox/react-sdk', label: 'React SDK', icon: 'component' },
  { href: '/sandbox/b2b', label: 'B2B Suite', icon: 'building' },
  { href: '/sandbox/api-explorer', label: 'API Explorer', icon: 'code' },
  { href: '/sandbox/webhooks', label: 'Webhooks', icon: 'webhook' },
  { href: '/sandbox/health', label: 'Health Monitor', icon: 'heart' },
  { href: '/sandbox/generator', label: 'Code Generator', icon: 'sparkles' },
];

function NavIcon({ icon, className = 'w-4 h-4' }: { icon: string; className?: string }) {
  switch (icon) {
    case 'grid':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      );
    case 'wallet':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
        </svg>
      );
    case 'component':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      );
    case 'building':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      );
    case 'code':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      );
    case 'webhook':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case 'heart':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      );
    case 'sparkles':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      );
    default:
      return null;
  }
}

function WalletButton() {
  const wallet = useWallet();

  if (wallet.isConnected) {
    return (
      <div className="flex items-center gap-2">
        {!wallet.isCorrectNetwork && (
          <button
            onClick={wallet.switchToArcTestnet}
            className="px-2.5 py-1.5 text-xs font-mono bg-amber-500/10 text-amber-400 rounded border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
          >
            Switch Network
          </button>
        )}
        <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
          <div className={`w-2 h-2 rounded-full ${wallet.isCorrectNetwork ? 'bg-green-500' : 'bg-amber-500'} animate-pulse`} />
          <span className="text-sm font-mono text-slate-300">
            {wallet.balance} ARC
          </span>
          <div className="h-4 w-px bg-slate-700" />
          <span className="text-sm font-mono text-cyan-400">
            {wallet.formatAddress(wallet.address!)}
          </span>
          <button
            onClick={wallet.disconnect}
            className="ml-1 p-1 text-slate-500 hover:text-slate-300 transition-colors"
            title="Disconnect"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={wallet.connect}
      disabled={wallet.isConnecting}
      className="flex items-center gap-2 px-3 py-2 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/30 hover:bg-cyan-500/20 transition-all text-sm font-mono disabled:opacity-50"
    >
      {wallet.isConnecting ? (
        <>
          <div className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <svg className="w-4 h-4" viewBox="0 0 35 33" fill="currentColor">
            <path d="M32.958 1l-13.134 9.718 2.442-5.727L32.958 1z" />
            <path d="M2.663 1l13.017 9.809-2.325-5.818L2.663 1zm25.555 22.517l-3.495 5.336 7.478 2.058 2.143-7.262-6.126-.132zm-26.314.132l2.127 7.262 7.464-2.058-3.48-5.336-6.111.132z" />
            <path d="M11.475 14.465l-2.087 3.151 7.434.338-.262-7.995-5.085 4.506zm12.628 0l-5.157-4.587-.175 8.076 7.418-.338-2.086-3.151z" />
          </svg>
          Connect Wallet
        </>
      )}
    </button>
  );
}

export default function SandboxLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="h-screen w-full flex flex-col bg-[#050505] font-sans overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-4 px-5 py-3 border-b border-slate-800/50 bg-[#050505] relative z-20 shrink-0">
        <Link href="/" className="text-slate-500 hover:text-slate-300 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div className="h-5 w-px bg-slate-800" />
        <div className="flex items-center gap-2.5">
          <span className="text-white font-semibold text-base">ArcPay</span>
          <span className="text-xs font-mono px-2 py-1 bg-cyan-500/10 text-cyan-400 rounded border border-cyan-500/20">
            SANDBOX
          </span>
        </div>

        <div className="flex-1" />

        {/* Network Status */}
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-900/50 rounded border border-slate-800/50">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs font-mono text-slate-400">{ARC_TESTNET.name}</span>
          <span className="text-xs text-slate-600">ID:{ARC_TESTNET.chainId}</span>
        </div>

        {/* Wallet */}
        <WalletButton />

        {/* Links */}
        <div className="flex items-center gap-1">
          <a
            href={ARC_TESTNET.faucet}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-slate-500 hover:text-cyan-400 transition-colors"
            title="Get Testnet USDC"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </a>
          <a
            href={ARC_TESTNET.blockExplorer}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-slate-500 hover:text-cyan-400 transition-colors"
            title="Block Explorer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <a
            href="https://github.com/ArcPay"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <nav className="w-52 border-r border-slate-800/50 bg-[#080808] shrink-0 overflow-y-auto">
          <div className="p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-sm ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <NavIcon icon={item.icon} className="w-4.5 h-4.5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          <div className="absolute bottom-0 left-0 w-52 p-3 border-t border-slate-800/50 bg-[#080808]">
            <div className="text-xs font-mono text-slate-600 space-y-1.5">
              <div className="flex justify-between">
                <span>SDK</span>
                <span className="text-green-500">v1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>Network</span>
                <span className="text-cyan-500">Arc Testnet</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[#050505]">
          <div className="max-w-5xl mx-auto px-8 py-6">
            <MockArcPayProvider>
              {children}
            </MockArcPayProvider>
          </div>
        </main>
      </div>
    </div>
  );
}
