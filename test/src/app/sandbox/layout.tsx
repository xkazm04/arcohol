'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '../../hooks/useWallet';
import { MockArcPayProvider } from '../../mocks/MockArcPayProvider';
import { NetworkProvider, useNetwork, type NetworkType } from './_context';

// Menu structure with submenus
interface MenuItem {
  href: string;
  label: string;
  icon: string;
  exact?: boolean;
  special?: boolean; // For unique styling (like Wallet Integration)
  external?: boolean;
}

interface MenuSection {
  id: string;
  label: string;
  icon: string;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    id: 'react-sdk',
    label: 'React SDK',
    icon: 'component',
    items: [
      { href: '/sandbox/wallet', label: 'Wallet Integration', icon: 'wallet', special: true, external: true },
      { href: '/sandbox/react-sdk?section=getting-started', label: 'Getting Started', icon: 'play' },
      { href: '/sandbox/react-sdk?section=checkout', label: 'Checkout', icon: 'cart' },
      { href: '/sandbox/react-sdk?section=invoice', label: 'Invoice', icon: 'document' },
      { href: '/sandbox/react-sdk?section=plans', label: 'PlanSelector', icon: 'layers' },
      { href: '/sandbox/react-sdk?section=balance', label: 'Balance', icon: 'coin' },
      { href: '/sandbox/react-sdk?section=transaction-history', label: 'TransactionHistory', icon: 'history' },
      { href: '/sandbox/react-sdk?section=fiat-on-ramp', label: 'Fiat On-Ramp', icon: 'credit-card' },
    ],
  },
  {
    id: 'b2b-suite',
    label: 'B2B Suite',
    icon: 'building',
    items: [
      { href: '/sandbox/b2b', label: 'Overview', icon: 'grid', exact: true },
      { href: '/sandbox/b2b/credits', label: 'Subscriptions', icon: 'refresh' },
      { href: '/sandbox/b2b/usdy', label: 'USDY', icon: 'chart' },
      { href: '/sandbox/b2b/invoices', label: 'Invoices', icon: 'document' },
      { href: '/sandbox/b2b/disputes', label: 'Disputes', icon: 'shield' },
      { href: '/sandbox/b2b/agents', label: 'Agents', icon: 'robot' },
      { href: '/sandbox/b2b/x402', label: 'x402 API', icon: 'api' },
      { href: '/sandbox/b2b/crosschain', label: 'CrossChain', icon: 'link' },
      { href: '/sandbox/b2b/webhooks', label: 'Webhooks', icon: 'webhook' },
      { href: '/sandbox/b2b/settings', label: 'Settings', icon: 'gear' },
    ],
  },
  {
    id: 'api-explorer',
    label: 'API Explorer',
    icon: 'code',
    items: [
      { href: '/sandbox/api-explorer?hook=useWallet', label: 'useWallet', icon: 'function' },
      { href: '/sandbox/api-explorer?hook=useBalance', label: 'useBalance', icon: 'function' },
      { href: '/sandbox/api-explorer?hook=useTransfer', label: 'useTransfer', icon: 'function' },
      { href: '/sandbox/api-explorer?hook=useTransactionHistory', label: 'useTransactionHistory', icon: 'function' },
    ],
  },
];

const standaloneItems: MenuItem[] = [
  { href: '/sandbox', label: 'Overview', icon: 'grid', exact: true },
  { href: '/sandbox/webhooks', label: 'Webhooks', icon: 'webhook' },
  { href: '/sandbox/health', label: 'Health Monitor', icon: 'heart' },
];

function NavIcon({ icon, className = 'w-3.5 h-3.5' }: { icon: string; className?: string }) {
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
    case 'play':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'cart':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    case 'document':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case 'layers':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      );
    case 'coin':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'history':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'credit-card':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      );
    case 'refresh':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      );
    case 'chart':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      );
    case 'shield':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case 'robot':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    case 'api':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case 'link':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      );
    case 'gear':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case 'function':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
        </svg>
      );
    case 'chevron':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      );
    default:
      return null;
  }
}

function CollapsibleSection({ section, pathname, searchParams }: { section: MenuSection; pathname: string | null; searchParams: URLSearchParams }) {
  // Helper to check if an item is active (considering both path and query params)
  const isItemActive = (item: MenuItem): boolean => {
    const [basePath, queryString] = item.href.split('?');

    // First check if the base path matches
    const pathMatches = item.exact
      ? pathname === basePath
      : pathname?.startsWith(basePath);

    if (!pathMatches) return false;

    // If there's no query string in the item href, just check path match
    if (!queryString) return true;

    // Parse the item's query params and check if they match current URL
    const itemParams = new URLSearchParams(queryString);
    for (const [key, value] of itemParams.entries()) {
      if (searchParams.get(key) !== value) return false;
    }

    return true;
  };

  const isAnyItemActive = section.items.some(isItemActive);
  const [isOpen, setIsOpen] = useState(isAnyItemActive);

  return (
    <div className="space-y-0.5">
      {/* Section Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all text-xs ${
          isAnyItemActive
            ? 'bg-cyan-500/5 text-cyan-400'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
        }`}
      >
        <div className="flex items-center gap-2">
          <NavIcon icon={section.icon} className="w-4 h-4" />
          <span className="font-medium">{section.label}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <NavIcon icon="chevron" className="w-3 h-3" />
        </motion.div>
      </button>

      {/* Submenu Items */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pl-3 ml-2 border-l border-slate-800/50 space-y-0.5 py-1">
              {section.items.map((item) => {
                const isActive = isItemActive(item);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md transition-all text-[11px] ${
                      item.special
                        ? isActive
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : 'text-purple-400/70 hover:text-purple-400 hover:bg-purple-500/5 border border-transparent'
                        : isActive
                          ? 'bg-cyan-500/10 text-cyan-400'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                    }`}
                  >
                    <NavIcon icon={item.icon} className="w-3 h-3" />
                    <span className={item.special ? 'font-medium' : ''}>{item.label}</span>
                    {item.external && (
                      <svg className="w-2.5 h-2.5 ml-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    )}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NetworkSelector() {
  const { network, config, setNetwork } = useNetwork();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const networks: { id: NetworkType; name: string; color: string }[] = [
    { id: 'testnet', name: 'Arc Testnet', color: 'cyan' },
    { id: 'mainnet', name: 'Arc Mainnet', color: 'emerald' },
  ];

  return (
    <div className="relative flex items-center gap-2" ref={dropdownRef}>
      {/* Faucet icon - only show for testnet */}
      {network === 'testnet' && config.faucet && (
        <a
          href={config.faucet}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 text-slate-500 hover:text-cyan-400 transition-colors"
          title="Get Testnet Tokens"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </a>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-2.5 py-1.5 bg-slate-900/50 rounded border transition-all ${
          isOpen ? 'border-cyan-500/50' : 'border-slate-800/50 hover:border-slate-700'
        }`}
      >
        <div className={`w-2 h-2 rounded-full ${network === 'testnet' ? 'bg-cyan-500' : 'bg-emerald-500'}`} />
        <span className="text-xs font-mono text-slate-300">{config.name}</span>
        <span className="text-xs text-slate-600">ID:{config.chainId}</span>
        <svg className={`w-3 h-3 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 right-0 bg-slate-900 border border-slate-800 rounded-lg shadow-xl z-50 min-w-[180px] overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Select Network</span>
          </div>
          {networks.map((n) => (
            <button
              key={n.id}
              onClick={() => {
                setNetwork(n.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${
                network === n.id
                  ? 'bg-cyan-500/10 text-cyan-400'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${n.color === 'cyan' ? 'bg-cyan-500' : 'bg-emerald-500'}`} />
              <span className="text-xs font-mono">{n.name}</span>
              {network === n.id && (
                <svg className="w-3 h-3 ml-auto text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
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

function SidebarFooter() {
  const { network, config } = useNetwork();

  return (
    <div className="absolute bottom-0 left-0 w-52 p-3 border-t border-slate-800/50 bg-[#080808]">
      <div className="text-xs font-mono text-slate-600 space-y-1.5">
        <div className="flex justify-between">
          <span>SDK</span>
          <span className="text-green-500">v1.0.0</span>
        </div>
        <div className="flex justify-between">
          <span>Network</span>
          <span className={network === 'testnet' ? 'text-cyan-500' : 'text-emerald-500'}>{config.name}</span>
        </div>
      </div>
    </div>
  );
}

function SandboxContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { config } = useNetwork();

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

        {/* Network Selector (includes faucet icon for testnet) */}
        <NetworkSelector />

        {/* Block Explorer Link */}
        <a
          href={config.blockExplorer}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 text-slate-500 hover:text-cyan-400 transition-colors"
          title="Block Explorer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>

        {/* Wallet */}
        <WalletButton />
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <nav className="w-52 border-r border-slate-800/50 bg-[#080808] shrink-0 overflow-y-auto pb-20">
          <div className="p-2.5 space-y-1">
            {/* Standalone Items at Top */}
            {standaloneItems.slice(0, 1).map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all text-xs ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <NavIcon icon={item.icon} className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}

            <div className="h-px bg-slate-800/50 my-2" />

            {/* Collapsible Sections */}
            {menuSections.map((section) => (
              <CollapsibleSection key={section.id} section={section} pathname={pathname} searchParams={searchParams} />
            ))}

            <div className="h-px bg-slate-800/50 my-2" />

            {/* Standalone Items at Bottom */}
            {standaloneItems.slice(1).map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all text-xs ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <NavIcon icon={item.icon} className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          <SidebarFooter />
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

export default function SandboxLayout({ children }: { children: React.ReactNode }) {
  return (
    <NetworkProvider>
      <SandboxContent>{children}</SandboxContent>
    </NetworkProvider>
  );
}
