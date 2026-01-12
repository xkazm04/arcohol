'use client';

import { Header } from '@/components/Header';
import { ProductCard } from '@/components/ProductCard';
import { CartSidebar } from '@/components/CartSidebar';
import { products } from '@/data/products';
import { useModeStore } from '@/store/modeStore';
import { THEME, FEATURES, CAPABILITIES, lightTheme, modeColors } from '@/lib/theme';
import Link from 'next/link';

// --- BADGE COMPONENT ---
function Badge({ children, mode }: { children: React.ReactNode; mode: 'mock' | 'testnet' }) {
  const colors = modeColors[mode];
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium border rounded-full ${colors.accent}`}>
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
          mode === 'mock' ? 'bg-violet-400' : 'bg-orange-400'
        }`} />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${
          mode === 'mock' ? 'bg-violet-500' : 'bg-orange-500'
        }`} />
      </span>
      {children}
    </div>
  );
}

// --- HERO SECTION ---
function Hero({ mode }: { mode: 'mock' | 'testnet' }) {
  const colors = modeColors[mode];

  return (
    <section className="relative pt-24 pb-16 overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge mode={mode}>
            {mode === 'mock' ? 'Demo Mode · Simulated' : 'Testnet Mode · Live Blockchain'}
          </Badge>

          <h1 className={`text-5xl lg:text-7xl ${THEME.fontDisplay} ${lightTheme.text} leading-[1.05]`}>
            Pay with crypto.<br />
            <span className={lightTheme.textLight}>Ship worldwide.</span>
          </h1>

          <p className={`text-lg lg:text-xl leading-relaxed ${lightTheme.textMuted} max-w-2xl mx-auto`}>
            {mode === 'mock'
              ? 'Experience the future of e-commerce payments. This demo simulates USDC transactions on Arc blockchain.'
              : 'Connect MetaMask, pay with ARC tokens on testnet. Real transactions, real blockchain, zero risk.'
            }
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <a
              href="#products"
              className={`group inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-all rounded-lg ${colors.primary} ${colors.primaryHover}`}
            >
              Browse Products
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <Link
              href="/sandbox"
              className={`inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold ${lightTheme.buttonSecondary} rounded-lg transition-colors`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              SDK Sandbox
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- STATS BAR ---
function StatsBar({ mode }: { mode: 'mock' | 'testnet' }) {
  const colors = modeColors[mode];

  return (
    <section className={`border-t border-b ${lightTheme.border}`}>
      <div className={`grid grid-cols-2 md:grid-cols-4 ${lightTheme.divider}`}>
        {FEATURES.map((feature, i) => (
          <div key={i} className={`p-6 text-center ${lightTheme.hover} transition-colors`}>
            <div className={`text-3xl font-bold ${THEME.fontDisplay} ${colors.primaryText}`}>
              {feature.stat}
            </div>
            <div className={`${THEME.labelSmall} ${lightTheme.textLight} mt-1`}>
              {feature.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// --- MODE COMPARISON SECTION (Light Theme) ---
function ModeSection({ mode }: { mode: 'mock' | 'testnet' }) {
  return (
    <section className={`border-t ${lightTheme.border} ${lightTheme.bgAlt}`}>
      <div className={`grid md:grid-cols-2 ${lightTheme.divider}`}>
        {/* Mock Mode */}
        <div className={`p-8 lg:p-12 transition-colors ${mode === 'mock' ? 'bg-violet-50' : ''}`}>
          <div className="flex items-center justify-between mb-6">
            <span className={`${THEME.labelSmall} ${lightTheme.textLight}`}>Mode 01</span>
            {mode === 'mock' && (
              <span className={`px-2 py-0.5 ${THEME.labelSmall} ${modeColors.mock.accentStrong} rounded`}>Active</span>
            )}
          </div>
          <h3 className={`text-2xl font-bold uppercase tracking-tight mb-3 ${lightTheme.text}`}>Mock</h3>
          <p className={`${lightTheme.textMuted} text-sm leading-relaxed mb-6`}>
            Simulated transactions with instant mock balance. Perfect for exploring the UI/UX without any wallet setup.
          </p>
          <ul className="space-y-2">
            {['No wallet required', 'Instant $1,250 balance', 'Full checkout flow'].map((item) => (
              <li key={item} className={`flex items-center gap-2 text-xs ${lightTheme.textMuted}`}>
                <span className="w-1 h-1 bg-violet-500 rounded-full" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Testnet Mode */}
        <div className={`p-8 lg:p-12 transition-colors ${mode === 'testnet' ? 'bg-orange-50' : ''}`}>
          <div className="flex items-center justify-between mb-6">
            <span className={`${THEME.labelSmall} ${lightTheme.textLight}`}>Mode 02</span>
            {mode === 'testnet' && (
              <span className={`px-2 py-0.5 ${THEME.labelSmall} ${modeColors.testnet.accentStrong} rounded`}>Active</span>
            )}
          </div>
          <h3 className={`text-2xl font-bold uppercase tracking-tight mb-3 ${lightTheme.text}`}>Testnet</h3>
          <p className={`${lightTheme.textMuted} text-sm leading-relaxed mb-6`}>
            Real MetaMask integration with Arc Testnet. Send actual blockchain transactions viewable on explorer.
          </p>
          <ul className="space-y-2">
            {['MetaMask connect', 'Arc Testnet chain', 'Block explorer links'].map((item) => (
              <li key={item} className={`flex items-center gap-2 text-xs ${lightTheme.textMuted}`}>
                <span className="w-1 h-1 bg-orange-500 rounded-full" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// --- CAPABILITIES GRID ---
function CapabilitiesGrid({ mode }: { mode: 'mock' | 'testnet' }) {
  const colors = modeColors[mode];

  return (
    <section className={`${lightTheme.bgAlt} py-16 px-6`}>
      <div className="container mx-auto">
        <div className="grid md:grid-cols-12 gap-12">
          {/* Left Column */}
          <div className="md:col-span-4">
            <h2 className={`text-3xl lg:text-4xl font-bold uppercase tracking-tighter mb-4 ${THEME.fontDisplay} ${lightTheme.text}`}>
              Payment<br />Infrastructure
            </h2>
            <p className={`${lightTheme.textMuted} text-sm mb-8 border-l-2 ${lightTheme.borderAccent} pl-4`}>
              Built on Arc blockchain for fast, secure, and low-cost transactions.
            </p>

            <div className={`grid grid-cols-2 gap-px ${lightTheme.bgMuted} border ${lightTheme.border}`}>
              {CAPABILITIES.map((cap) => (
                <div key={cap.label} className={`${lightTheme.bg} p-4`}>
                  <div className={`${THEME.labelSmall} ${lightTheme.textLight} mb-1`}>Capability</div>
                  <div className={`font-semibold text-sm ${lightTheme.text}`}>{cap.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Features */}
          <div className="md:col-span-8 flex flex-col gap-3">
            {FEATURES.map((feature, i) => (
              <div
                key={i}
                className={`${lightTheme.bg} border ${lightTheme.border} p-5 flex items-center gap-6 group hover:border-zinc-400 transition-colors`}
              >
                <div className={`w-12 h-12 ${colors.primary} text-white flex items-center justify-center flex-shrink-0 text-lg font-bold`}>
                  {feature.stat}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold uppercase text-sm tracking-tight ${lightTheme.text}`}>{feature.title}</h4>
                  <p className={`${lightTheme.textMuted} text-sm mt-0.5`}>{feature.description}</p>
                </div>
                <svg className={`w-5 h-5 ${lightTheme.textLight} group-hover:${lightTheme.text} transition-colors flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// --- PRODUCTS SECTION ---
function ProductsSection({ mode }: { mode: 'mock' | 'testnet' }) {
  const categories = [...new Set(products.map(p => p.category))];
  const colors = modeColors[mode];

  return (
    <section id="products" className="py-16 px-6 scroll-mt-20">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className={`${THEME.labelSmall} ${lightTheme.textLight} mb-2`}>Catalog</div>
            <h2 className={`text-3xl lg:text-4xl font-bold uppercase tracking-tighter ${THEME.fontDisplay} ${lightTheme.text}`}>
              Featured Products
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Category Pills */}
            <div className="flex items-center gap-2">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className={`px-3 py-1.5 text-xs font-medium ${lightTheme.bgMuted} ${lightTheme.textSecondary} rounded-full ${lightTheme.hoverStrong} transition-colors cursor-pointer`}
                >
                  {cat}
                </span>
              ))}
            </div>

            {/* Item Count */}
            <div className={`px-3 py-1.5 text-xs font-medium rounded-full border ${colors.accent}`}>
              {products.length} items
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

// --- SDK BANNER (Light Theme) ---
function SDKBanner({ mode }: { mode: 'mock' | 'testnet' }) {
  const colors = modeColors[mode];

  return (
    <section className={`border-t ${lightTheme.border}`}>
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5">
            <div className={`${THEME.labelSmall} ${lightTheme.textLight} mb-2`}>Developer</div>
            <h2 className={`text-3xl font-bold uppercase tracking-tighter mb-4 ${THEME.fontDisplay} ${lightTheme.text}`}>
              @arcpay/react SDK
            </h2>
            <p className={`${lightTheme.textMuted} text-sm leading-relaxed mb-6`}>
              Add crypto payments to your React app with just a few lines of code.
              Full TypeScript support, customizable components, and comprehensive documentation.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/sandbox"
                className={`px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors ${colors.primary} ${colors.primaryHover}`}
              >
                Try Sandbox
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors ${lightTheme.buttonSecondary}`}
              >
                GitHub
              </a>
            </div>
          </div>

          <div className="md:col-span-7">
            {/* Light themed code block */}
            <div className={`${lightTheme.code} rounded-lg p-5 ${THEME.fontMono} text-sm overflow-x-auto`}>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-200">
                <span className="w-3 h-3 rounded-full bg-zinc-300" />
                <span className="w-3 h-3 rounded-full bg-zinc-300" />
                <span className="w-3 h-3 rounded-full bg-zinc-300" />
                <span className={`ml-4 ${lightTheme.textLight} text-xs`}>App.tsx</span>
              </div>
              <pre className={lightTheme.codeText}>
                <code>
                  <span className="text-pink-600">import</span> {`{ ArcPayProvider, PayButton }`} <span className="text-pink-600">from</span> <span className="text-green-600">'@arcpay/react'</span>;{'\n\n'}
                  <span className="text-pink-600">function</span> <span className="text-blue-600">Checkout</span>() {`{`}{'\n'}
                  {'  '}<span className="text-pink-600">return</span> ({'\n'}
                  {'    '}<span className="text-orange-600">&lt;ArcPayProvider</span> <span className="text-purple-600">apiKey</span>=<span className="text-green-600">"your-key"</span><span className="text-orange-600">&gt;</span>{'\n'}
                  {'      '}<span className="text-orange-600">&lt;PayButton</span>{'\n'}
                  {'        '}<span className="text-purple-600">amount</span>={`{`}<span className="text-blue-600">99.99</span>{`}`}{'\n'}
                  {'        '}<span className="text-purple-600">recipient</span>=<span className="text-green-600">"merchant@store.com"</span>{'\n'}
                  {'        '}<span className="text-purple-600">onSuccess</span>={`{`}(tx) =&gt; console.log(<span className="text-green-600">'Paid!'</span>, tx){`}`}{'\n'}
                  {'      '}<span className="text-orange-600">/&gt;</span>{'\n'}
                  {'    '}<span className="text-orange-600">&lt;/ArcPayProvider&gt;</span>{'\n'}
                  {'  '});{'\n'}
                  {`}`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- FOOTER ---
function Footer({ mode }: { mode: 'mock' | 'testnet' }) {
  const colors = modeColors[mode];

  return (
    <footer className={`border-t ${lightTheme.border} ${lightTheme.bgAlt}`}>
      <div className="container mx-auto px-6">
        {/* Main Footer */}
        <div className="py-12 grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors.primary}`}>
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <div className={`font-bold ${lightTheme.text}`}>Arc Store</div>
                <div className={`text-xs ${lightTheme.textLight}`}>ArcPay SDK Demo</div>
              </div>
            </div>
            <p className={`text-sm ${lightTheme.textMuted} max-w-sm`}>
              Demo e-commerce store showcasing blockchain payment integration with the ArcPay React SDK.
            </p>
          </div>

          <div>
            <div className={`${THEME.labelSmall} ${lightTheme.textLight} mb-4`}>Navigation</div>
            <ul className="space-y-2 text-sm">
              <li><a href="#products" className={`${lightTheme.textSecondary} hover:${lightTheme.text} transition-colors`}>Products</a></li>
              <li><Link href="/sandbox" className={`${lightTheme.textSecondary} hover:${lightTheme.text} transition-colors`}>Sandbox</Link></li>
              <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className={`${lightTheme.textSecondary} hover:${lightTheme.text} transition-colors`}>GitHub</a></li>
            </ul>
          </div>

          <div>
            <div className={`${THEME.labelSmall} ${lightTheme.textLight} mb-4`}>Resources</div>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className={`${lightTheme.textSecondary} hover:${lightTheme.text} transition-colors`}>Documentation</a></li>
              <li><a href="#" className={`${lightTheme.textSecondary} hover:${lightTheme.text} transition-colors`}>API Reference</a></li>
              <li><a href="https://arc.network" target="_blank" rel="noopener noreferrer" className={`${lightTheme.textSecondary} hover:${lightTheme.text} transition-colors`}>Arc Network</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`py-4 border-t ${lightTheme.border} flex flex-col md:flex-row items-center justify-between gap-4 text-xs ${lightTheme.textLight}`}>
          <div>Payments powered by {mode === 'mock' ? 'USDC' : 'ARC'} on Arc blockchain</div>
          <div className="flex items-center gap-4">
            <span>{mode === 'mock' ? 'Demo Mode' : 'Testnet Mode'}</span>
            <span>·</span>
            <span>Built with Next.js</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// --- MAIN PAGE ---
export default function Home() {
  const mode = useModeStore((state) => state.mode);

  return (
    <div className={`min-h-screen ${lightTheme.bg}`}>
      <Header />
      <CartSidebar />

      <main>
        <Hero mode={mode} />
        <StatsBar mode={mode} />
        <ModeSection mode={mode} />
        <ProductsSection mode={mode} />
        <CapabilitiesGrid mode={mode} />
        <SDKBanner mode={mode} />
      </main>

      <Footer mode={mode} />
    </div>
  );
}
