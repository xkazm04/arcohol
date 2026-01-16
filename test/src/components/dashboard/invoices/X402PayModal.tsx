'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Modal } from '../layout/Modal';
import { GlowButton } from '../ui/GlowButton';
import type { Invoice, X402PaymentRequirements } from '@/features/invoices';

interface X402PayModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onSuccess?: (result: X402PaymentResult) => void;
}

interface X402PaymentResult {
  invoiceId: string;
  transaction?: string;
  batchId?: string;
  status: string;
}

type PaymentStep = 'connect' | 'authorize' | 'processing' | 'success' | 'error';

export function X402PayModal({ isOpen, onClose, invoice, onSuccess }: X402PayModalProps) {
  const [step, setStep] = useState<PaymentStep>('connect');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [requirements, setRequirements] = useState<X402PaymentRequirements | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('connect');
      setWalletAddress(null);
      setRequirements(null);
      setError(null);
    }
  }, [isOpen]);

  // Fetch payment requirements when invoice is available
  useEffect(() => {
    if (isOpen && invoice) {
      fetchRequirements();
    }
  }, [isOpen, invoice]);

  const fetchRequirements = async () => {
    if (!invoice) return;

    try {
      const response = await fetch(`/api/invoices/${invoice.id}/x402-requirements`);
      if (response.ok) {
        const data = await response.json();
        setRequirements(data.requirements);
      }
    } catch (err) {
      console.error('Failed to fetch x402 requirements:', err);
    }
  };

  const handleConnectWallet = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if ethereum is available (MetaMask or similar)
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({
          method: 'eth_requestAccounts',
        });

        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setStep('authorize');
        }
      } else {
        setError('No wallet detected. Please install MetaMask or another Web3 wallet.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthorize = async () => {
    if (!invoice || !walletAddress) return;

    setIsLoading(true);
    setError(null);
    setStep('processing');

    try {
      // Create the EIP-3009 authorization message
      const amount = invoice.amount.toString();
      const network = requirements?.network || 'eip155:5042002';

      // For demo purposes, we'll simulate the signature
      // In production, this would use the actual GatewayClient from @circlefin/x402-batching
      const messageToSign = JSON.stringify({
        type: 'x402-payment',
        invoiceId: invoice.id,
        amount,
        payTo: requirements?.payTo,
        network,
        timestamp: Date.now(),
      });

      // Request signature from wallet
      const signature = await (window as any).ethereum.request({
        method: 'personal_sign',
        params: [messageToSign, walletAddress],
      });

      // Send to backend for verification and settlement
      const response = await fetch(`/api/invoices/${invoice.id}/pay-x402`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payerAddress: walletAddress,
          signature,
          network,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Payment failed');
      }

      setStep('success');
      onSuccess?.(result);
    } catch (err: any) {
      setError(err.message || 'Payment authorization failed');
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const renderStep = () => {
    switch (step) {
      case 'connect':
        return (
          <div className="text-center py-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 mx-auto mb-4 bg-cyan-500/10 rounded-full flex items-center justify-center"
            >
              <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </motion.div>

            <h3 className="text-white text-sm font-medium mb-2">Connect Your Wallet</h3>
            <p className="text-slate-400 text-xs mb-6">
              Pay this invoice with gasless x402 micropayments.
              <br />
              No gas fees required.
            </p>

            {invoice && (
              <div className="bg-slate-800/50 rounded-lg p-3 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400 text-xs">Invoice</span>
                  <span className="text-white text-xs font-mono">{invoice.reference}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs">Amount</span>
                  <span className="text-cyan-400 text-sm font-semibold">
                    ${invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
                  </span>
                </div>
              </div>
            )}

            <GlowButton onClick={handleConnectWallet} disabled={isLoading} className="w-full">
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                  Connecting...
                </span>
              ) : (
                'Connect Wallet'
              )}
            </GlowButton>

            {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
          </div>
        );

      case 'authorize':
        return (
          <div className="text-center py-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 mx-auto mb-4 bg-emerald-500/10 rounded-full flex items-center justify-center"
            >
              <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </motion.div>

            <h3 className="text-white text-sm font-medium mb-2">Authorize Payment</h3>
            <p className="text-slate-400 text-xs mb-6">
              Sign the authorization to pay this invoice.
              <br />
              This is a gasless signature - no ETH needed.
            </p>

            <div className="bg-slate-800/50 rounded-lg p-3 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400 text-xs">Connected Wallet</span>
                <span className="text-white text-xs font-mono">{walletAddress && formatAddress(walletAddress)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400 text-xs">Invoice</span>
                <span className="text-white text-xs font-mono">{invoice?.reference}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400 text-xs">Amount</span>
                <span className="text-cyan-400 text-sm font-semibold">
                  ${invoice?.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs">Gas Fee</span>
                <span className="text-emerald-400 text-xs font-medium">$0.00 (Gasless)</span>
              </div>
            </div>

            <div className="flex gap-2">
              <GlowButton variant="secondary" onClick={() => setStep('connect')} className="flex-1">
                Back
              </GlowButton>
              <GlowButton onClick={handleAuthorize} disabled={isLoading} className="flex-1">
                {isLoading ? 'Processing...' : 'Sign & Pay'}
              </GlowButton>
            </div>

            {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
          </div>
        );

      case 'processing':
        return (
          <div className="text-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 mx-auto mb-4 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full"
            />

            <h3 className="text-white text-sm font-medium mb-2">Processing Payment</h3>
            <p className="text-slate-400 text-xs">
              Your payment is being processed via the x402 Gateway.
              <br />
              Settlement typically completes within 5 minutes.
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-4">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="w-16 h-16 mx-auto mb-4 bg-emerald-500/20 rounded-full flex items-center justify-center"
            >
              <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>

            <h3 className="text-white text-sm font-medium mb-2">Payment Successful!</h3>
            <p className="text-slate-400 text-xs mb-6">
              Your payment has been submitted to the x402 Gateway.
              <br />
              The invoice will be marked as paid after settlement.
            </p>

            <div className="bg-slate-800/50 rounded-lg p-3 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400 text-xs">Invoice</span>
                <span className="text-white text-xs font-mono">{invoice?.reference}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400 text-xs">Amount Paid</span>
                <span className="text-emerald-400 text-sm font-semibold">
                  ${invoice?.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs">Status</span>
                <span className="text-amber-400 text-xs">Batching...</span>
              </div>
            </div>

            <GlowButton onClick={onClose} className="w-full">
              Done
            </GlowButton>
          </div>
        );

      case 'error':
        return (
          <div className="text-center py-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 mx-auto mb-4 bg-red-500/10 rounded-full flex items-center justify-center"
            >
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.div>

            <h3 className="text-white text-sm font-medium mb-2">Payment Failed</h3>
            <p className="text-slate-400 text-xs mb-2">{error || 'An error occurred during payment.'}</p>

            <div className="flex gap-2 mt-6">
              <GlowButton variant="secondary" onClick={onClose} className="flex-1">
                Cancel
              </GlowButton>
              <GlowButton onClick={() => setStep('connect')} className="flex-1">
                Try Again
              </GlowButton>
            </div>
          </div>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pay with x402"
      subtitle="Gasless USDC payment via Circle Gateway"
      accent="cyan"
      size="sm"
    >
      {renderStep()}
    </Modal>
  );
}
