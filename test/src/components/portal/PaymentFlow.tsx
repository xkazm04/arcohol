'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Invoice {
  id: string;
  reference: string;
  amount: number;
  currency: string;
}

interface PaymentFlowProps {
  invoice: Invoice;
  onClose: () => void;
  onSuccess: () => void;
}

type PaymentStep = 'connect' | 'confirm' | 'processing' | 'success' | 'error';

export function PaymentFlow({ invoice, onClose, onSuccess }: PaymentFlowProps) {
  const [step, setStep] = useState<PaymentStep>('connect');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency || 'USD' }).format(amount);

  // Simulated wallet connection (replace with wagmi/RainbowKit in production)
  const connectWallet = async () => {
    try {
      // Check if MetaMask or similar is available
      if (typeof window !== 'undefined' && (window as unknown as { ethereum?: unknown }).ethereum) {
        const ethereum = (window as unknown as { ethereum: { request: (args: { method: string }) => Promise<string[]> } }).ethereum;
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts[0]) {
          setWalletAddress(accounts[0]);
          setStep('confirm');
        }
      } else {
        setError('No wallet found. Please install MetaMask or another Web3 wallet.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    }
  };

  // Simulated payment (replace with actual contract call in production)
  const submitPayment = async () => {
    setStep('processing');
    setError(null);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In production, this would:
      // 1. Check USDC balance
      // 2. Check/request allowance
      // 3. Execute transfer or sign EIP-3009 for gasless
      // 4. Submit to backend for verification

      // Simulate successful payment
      const mockTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      setTxHash(mockTxHash);

      // Notify backend
      await fetch(`/api/portal/invoices/${invoice.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payerAddress: walletAddress,
          txHash: mockTxHash,
          chain: 'base',
        }),
      });

      setStep('success');
      setTimeout(onSuccess, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      setStep('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Pay Invoice</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* Connect Wallet Step */}
            {step === 'connect' && (
              <motion.div
                key="connect"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">Connect Your Wallet</h3>
                  <p className="text-sm text-slate-400">
                    Connect your wallet to pay {formatCurrency(invoice.amount)} in USDC
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                <button
                  onClick={connectWallet}
                  className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.5 9.5h-17v5h17v-5zm-17-2h17a2 2 0 012 2v5a2 2 0 01-2 2h-17a2 2 0 01-2-2v-5a2 2 0 012-2z" />
                  </svg>
                  Connect Wallet
                </button>
              </motion.div>
            )}

            {/* Confirm Payment Step */}
            {step === 'confirm' && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="p-4 bg-slate-800/50 rounded-xl space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Invoice</span>
                    <span className="text-white">#{invoice.reference}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Amount</span>
                    <span className="text-white font-medium">{formatCurrency(invoice.amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Network</span>
                    <span className="text-white">Base</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">From</span>
                    <span className="text-white font-mono text-xs">
                      {walletAddress?.slice(0, 8)}...{walletAddress?.slice(-6)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={submitPayment}
                  className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-medium rounded-lg transition-colors"
                >
                  Confirm Payment
                </button>

                <button
                  onClick={() => setStep('connect')}
                  className="w-full py-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Use a different wallet
                </button>
              </motion.div>
            )}

            {/* Processing Step */}
            {step === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 mx-auto mb-4">
                  <div className="w-full h-full border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Processing Payment</h3>
                <p className="text-sm text-slate-400">
                  Please confirm the transaction in your wallet...
                </p>
              </motion.div>
            )}

            {/* Success Step */}
            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Payment Successful!</h3>
                <p className="text-sm text-slate-400 mb-4">
                  Your payment of {formatCurrency(invoice.amount)} has been confirmed.
                </p>
                {txHash && (
                  <p className="text-xs text-slate-500 font-mono">
                    TX: {txHash.slice(0, 10)}...{txHash.slice(-8)}
                  </p>
                )}
              </motion.div>
            )}

            {/* Error Step */}
            {step === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Payment Failed</h3>
                <p className="text-sm text-red-400 mb-4">{error}</p>
                <button
                  onClick={() => setStep('confirm')}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
