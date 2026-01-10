'use client';

import { Header } from '@/components/Header';
import { ProductCard } from '@/components/ProductCard';
import { CartSidebar } from '@/components/CartSidebar';
import { products } from '@/data/products';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <CartSidebar />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <section className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Powered by ArcPay SDK
          </div>
          <h1 className="text-5xl font-bold text-zinc-900 mb-4">
            Shop with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">USDC</span>
          </h1>
          <p className="text-xl text-zinc-600 max-w-2xl mx-auto">
            Experience seamless cryptocurrency payments. Connect your wallet,
            browse products, and checkout instantly with USDC on Arc blockchain.
          </p>
        </section>

        {/* How it Works */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-zinc-900 mb-8 text-center">
            How it Works
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-zinc-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">1. Connect Wallet</h3>
              <p className="text-zinc-600 text-sm">
                Click Connect Wallet to create or link your USDC wallet powered by Circle.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-zinc-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">2. Shop Products</h3>
              <p className="text-zinc-600 text-sm">
                Browse our catalog and add items to your cart like any online store.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-zinc-100">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">3. Pay with USDC</h3>
              <p className="text-zinc-600 text-sm">
                Confirm payment and your USDC is transferred instantly on Arc chain.
              </p>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-zinc-900">Featured Products</h2>
            <span className="text-sm text-zinc-500">{products.length} items</span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* SDK Info Banner */}
        <section className="mt-16 bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-3xl p-8 md:p-12 text-white">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold mb-4">
              Built with @arcpay/react SDK
            </h2>
            <p className="text-zinc-400 mb-6 text-lg">
              This demo showcases the ArcPay React SDK integration. Add USDC payments
              to your app with just a few lines of code.
            </p>
            <div className="bg-zinc-800/50 rounded-xl p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-green-400">
{`import { ArcPayProvider, PayButton } from '@arcpay/react';

function App() {
  return (
    <ArcPayProvider apiKey="your-key">
      <PayButton
        amount={99.99}
        recipient="merchant@store.com"
        onSuccess={(tx) => console.log('Paid!', tx)}
      />
    </ArcPayProvider>
  );
}`}
              </pre>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20 py-8 text-center text-zinc-500 text-sm">
        <p>Demo Store - ArcPay React SDK Integration Example</p>
        <p className="mt-1">Payments powered by USDC on Arc blockchain</p>
      </footer>
    </div>
  );
}
