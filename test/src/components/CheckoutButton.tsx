'use client';

import React, { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useModeStore } from '@/store/modeStore';
import { useWallet, useTransfer } from '@/mocks/MockArcPayProvider';
import { useTestnetWallet, useTestnetTransfer, ARC_TESTNET } from '@/providers/TestnetWalletProvider';
import { MERCHANT_ADDRESS } from '@/data/products';
import { lightTheme, modeColors, THEME } from '@/lib/theme';

function MockCheckout() {
  const totalPrice = useCartStore((state) => state.totalPrice);
  const clearCart = useCartStore((state) => state.clearCart);
  const closeCart = useCartStore((state) => state.closeCart);
  const colors = modeColors.mock;

  const { isConnected, connect, isConnecting } = useWallet();
  const { transfer, isTransferring } = useTransfer();

  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const amount = totalPrice().toFixed(2);

  const handleClick = async () => {
    if (!isConnected) {
      await connect();
      return;
    }
    setShowConfirm(true);
    setError(null);
  };

  const handleConfirm = async () => {
    try {
      const result = await transfer({
        to: MERCHANT_ADDRESS,
        amount,
        memo: `Arc Store Order - ${new Date().toISOString()}`,
      });

      setTxHash(result.transaction.hash);
      setShowConfirm(false);
      setShowSuccess(true);

      setTimeout(() => {
        clearCart();
        closeCart();
        setShowSuccess(false);
        setTxHash(null);
      }, 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    }
  };

  if (showConfirm) {
    return (
      <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
        <div className={`${lightTheme.bg} border ${lightTheme.border} p-6 max-w-sm w-full shadow-xl`}>
          <div className="text-center mb-6">
            <div className={`w-14 h-14 ${colors.light} flex items-center justify-center mx-auto mb-4`}>
              <svg className={`w-7 h-7 ${colors.primaryText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className={`text-lg font-bold uppercase tracking-tight ${lightTheme.text}`}>Confirm Payment</h3>
            <p className={`${THEME.labelSmall} ${lightTheme.textLight} mt-1`}>Mock Mode · Simulated</p>
          </div>

          <div className={`${lightTheme.bgMuted} p-4 mb-6`}>
            <div className="text-center">
              <div className={`text-3xl font-bold ${lightTheme.text}`}>${amount}</div>
              <div className={`${THEME.labelSmall} ${colors.primaryText} mt-1`}>USDC</div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              className={`flex-1 px-4 py-3 ${lightTheme.buttonSecondary} font-medium transition-colors`}
              disabled={isTransferring}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isTransferring}
              className={`flex-1 px-4 py-3 ${colors.primary} ${colors.primaryHover} text-white font-medium transition-all disabled:opacity-50`}
            >
              {isTransferring ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing
                </span>
              ) : (
                'Confirm'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
        <div className={`${lightTheme.bg} border ${lightTheme.border} p-6 max-w-sm w-full shadow-xl text-center`}>
          <div className="w-16 h-16 bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className={`text-lg font-bold uppercase tracking-tight ${lightTheme.text} mb-2`}>Payment Complete</h3>
          <p className={`${lightTheme.textMuted} text-sm mb-4`}>Your order has been confirmed</p>
          {txHash && (
            <div className={`${lightTheme.bgMuted} p-3 ${THEME.fontMono} text-xs ${lightTheme.textSecondary} break-all`}>
              {txHash.slice(0, 20)}...{txHash.slice(-10)}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isConnecting}
      className={`w-full py-3 ${colors.primary} ${colors.primaryHover} text-white font-semibold transition-all disabled:opacity-50`}
    >
      {isConnecting ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Connecting
        </span>
      ) : isConnected ? (
        `Pay $${amount}`
      ) : (
        'Connect Wallet to Pay'
      )}
    </button>
  );
}

function TestnetCheckout() {
  const totalPrice = useCartStore((state) => state.totalPrice);
  const clearCart = useCartStore((state) => state.clearCart);
  const closeCart = useCartStore((state) => state.closeCart);
  const colors = modeColors.testnet;

  const { isConnected, connect, isConnecting, isCorrectNetwork, switchToArcTestnet } = useTestnetWallet();
  const { transfer, isTransferring } = useTestnetTransfer();

  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const amount = totalPrice().toFixed(2);

  const handleClick = async () => {
    if (!isConnected) {
      await connect();
      return;
    }
    if (!isCorrectNetwork) {
      await switchToArcTestnet();
      return;
    }
    setShowConfirm(true);
    setError(null);
  };

  const handleConfirm = async () => {
    try {
      const result = await transfer({
        to: '0x0000000000000000000000000000000000000000',
        amount,
        memo: `Arc Store Order`,
      });

      setTxHash(result.transaction.hash);
      setShowConfirm(false);
      setShowSuccess(true);

      setTimeout(() => {
        clearCart();
        closeCart();
        setShowSuccess(false);
        setTxHash(null);
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed');
    }
  };

  if (showConfirm) {
    return (
      <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
        <div className={`${lightTheme.bg} border ${lightTheme.border} p-6 max-w-sm w-full shadow-xl`}>
          <div className="text-center mb-6">
            <div className={`w-14 h-14 ${colors.light} flex items-center justify-center mx-auto mb-4`}>
              <svg className={`w-7 h-7 ${colors.primaryText}`} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </div>
            <h3 className={`text-lg font-bold uppercase tracking-tight ${lightTheme.text}`}>Confirm Transaction</h3>
            <p className={`${THEME.labelSmall} ${lightTheme.textLight} mt-1`}>Arc Testnet · Real Blockchain</p>
          </div>

          <div className={`${colors.light} p-4 mb-4`}>
            <div className="text-center">
              <div className={`text-3xl font-bold ${lightTheme.text}`}>{amount}</div>
              <div className={`${THEME.labelSmall} ${colors.primaryText} mt-1`}>ARC (Testnet)</div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-3 mb-4 text-sm text-amber-800">
            This will send a real transaction on Arc Testnet
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              className={`flex-1 px-4 py-3 ${lightTheme.buttonSecondary} font-medium transition-colors`}
              disabled={isTransferring}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isTransferring}
              className={`flex-1 px-4 py-3 ${colors.primary} ${colors.primaryHover} text-white font-medium transition-all disabled:opacity-50`}
            >
              {isTransferring ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Sending
                </span>
              ) : (
                'Send Transaction'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
        <div className={`${lightTheme.bg} border ${lightTheme.border} p-6 max-w-sm w-full shadow-xl text-center`}>
          <div className="w-16 h-16 bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className={`text-lg font-bold uppercase tracking-tight ${lightTheme.text} mb-2`}>Transaction Sent</h3>
          <p className={`${lightTheme.textMuted} text-sm mb-4`}>Check Arc Testnet explorer</p>
          {txHash && (
            <a
              href={`${ARC_TESTNET.blockExplorer}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`block ${lightTheme.bgMuted} p-3 ${THEME.fontMono} text-xs ${colors.primaryText} hover:${lightTheme.bgAlt} transition-colors`}
            >
              View on Explorer
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isConnecting}
      className={`w-full py-3 ${colors.primary} ${colors.primaryHover} text-white font-semibold transition-all disabled:opacity-50`}
    >
      {isConnecting ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Connecting
        </span>
      ) : !isConnected ? (
        'Connect MetaMask'
      ) : !isCorrectNetwork ? (
        'Switch to Arc Testnet'
      ) : (
        `Pay ${amount} ARC`
      )}
    </button>
  );
}

export function CheckoutButton() {
  const mode = useModeStore((state) => state.mode);

  if (mode === 'testnet') {
    return <TestnetCheckout />;
  }

  return <MockCheckout />;
}
