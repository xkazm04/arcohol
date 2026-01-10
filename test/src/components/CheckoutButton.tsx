'use client';

import React, { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useMockArcPay, useWallet, useTransfer } from '@/mocks/MockArcPayProvider';
import { MERCHANT_ADDRESS } from '@/data/products';

export function CheckoutButton() {
  const totalPrice = useCartStore((state) => state.totalPrice);
  const clearCart = useCartStore((state) => state.clearCart);
  const closeCart = useCartStore((state) => state.closeCart);

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

      // Clear cart after successful payment
      setTimeout(() => {
        clearCart();
        closeCart();
        setShowSuccess(false);
        setTxHash(null);
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    }
  };

  // Confirm Modal
  if (showConfirm) {
    return (
      <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
          <h3 className="text-xl font-semibold text-center mb-2">
            Confirm Payment
          </h3>
          <div className="text-center py-6">
            <div className="text-4xl font-bold text-zinc-900 mb-2">
              ${amount}
            </div>
            <div className="text-sm text-zinc-500">
              To: {MERCHANT_ADDRESS}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 px-4 py-3 rounded-full border border-zinc-200 font-medium hover:bg-zinc-50 transition-colors"
              disabled={isTransferring}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isTransferring}
              className="flex-1 px-4 py-3 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isTransferring ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Processing...
                </span>
              ) : (
                'Pay with USDC'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success Modal
  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
          <p className="text-zinc-600 mb-4">
            Your order has been confirmed and paid with USDC.
          </p>
          {txHash && (
            <div className="bg-zinc-50 rounded-lg p-3 text-xs font-mono text-zinc-600 break-all">
              TX: {txHash.slice(0, 20)}...{txHash.slice(-10)}
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
      className="w-full py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
    >
      {isConnecting ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Connecting Wallet...
        </span>
      ) : isConnected ? (
        <>Pay ${amount} with USDC</>
      ) : (
        <>Connect Wallet to Pay</>
      )}
    </button>
  );
}
