'use client';

import React from 'react';
import { useCartStore } from '@/store/cartStore';
import { useModeStore } from '@/store/modeStore';
import { CheckoutButton } from './CheckoutButton';
import { lightTheme, modeColors, THEME } from '@/lib/theme';

export function CartSidebar() {
  const items = useCartStore((state) => state.items);
  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const totalItems = useCartStore((state) => state.totalItems);
  const mode = useModeStore((state) => state.mode);
  const colors = modeColors[mode];

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={closeCart}
      />

      {/* Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-md ${lightTheme.bg} border-l ${lightTheme.border} z-50 flex flex-col`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-5 border-b ${lightTheme.border}`}>
          <div>
            <div className={`${THEME.labelSmall} ${lightTheme.textLight} mb-0.5`}>Shopping</div>
            <h2 className={`text-lg font-bold uppercase tracking-tight ${lightTheme.text}`}>Cart</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-2 py-0.5 ${THEME.labelSmall} font-medium rounded border ${colors.accent}`}>
              {totalItems()} {totalItems() === 1 ? 'item' : 'items'}
            </span>
            <button
              onClick={closeCart}
              className={`w-8 h-8 flex items-center justify-center ${lightTheme.hover} transition-colors`}
            >
              <svg className={`w-5 h-5 ${lightTheme.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className={`w-16 h-16 ${lightTheme.bgMuted} flex items-center justify-center mb-4`}>
                <svg className={`w-8 h-8 ${lightTheme.textLight}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className={`${lightTheme.text} font-semibold uppercase tracking-tight text-sm`}>Empty Cart</p>
              <p className={`text-xs ${lightTheme.textMuted} mt-1`}>Add products to get started</p>
              <button
                onClick={closeCart}
                className={`mt-6 px-5 py-2.5 text-sm font-medium text-white transition-colors ${colors.primary} ${colors.primaryHover}`}
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className={`${lightTheme.divider}`}>
              {items.map((item, index) => (
                <div key={item.product.id} className={`p-4 ${lightTheme.hover} transition-colors border-b ${lightTheme.border}`}>
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className={`w-20 h-20 ${lightTheme.bgMuted} flex-shrink-0 overflow-hidden`}>
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className={`${THEME.labelSmall} ${lightTheme.textLight}`}>
                            #{String(index + 1).padStart(2, '0')}
                          </span>
                          <h3 className={`font-semibold ${lightTheme.text} uppercase tracking-tight text-sm line-clamp-1`}>
                            {item.product.name}
                          </h3>
                        </div>
                        <span className={`font-bold text-sm ${colors.primaryText}`}>
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className={`flex items-center border ${lightTheme.border}`}>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className={`w-7 h-7 flex items-center justify-center ${lightTheme.textMuted} ${lightTheme.hover} transition-colors`}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className={`w-8 text-center text-xs font-semibold ${lightTheme.text}`}>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className={`w-7 h-7 flex items-center justify-center ${lightTheme.textMuted} ${lightTheme.hover} transition-colors`}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>

                        {/* Unit Price & Remove */}
                        <div className="flex items-center gap-3">
                          <span className={`${THEME.labelSmall} ${lightTheme.textLight}`}>
                            ${item.product.price.toFixed(2)} ea
                          </span>
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className={`${THEME.labelSmall} text-red-500 hover:text-red-600 font-medium transition-colors`}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Summary (Light Theme) */}
        {items.length > 0 && (
          <div className={`border-t ${lightTheme.border}`}>
            {/* Summary Grid */}
            <div className={`p-4 grid grid-cols-2 gap-px ${lightTheme.bgMuted}`}>
              <div className={`${lightTheme.bg} p-3`}>
                <div className={`${THEME.labelSmall} ${lightTheme.textLight} mb-0.5`}>Subtotal</div>
                <div className={`font-bold ${lightTheme.text}`}>${totalPrice().toFixed(2)}</div>
              </div>
              <div className={`${lightTheme.bg} p-3`}>
                <div className={`${THEME.labelSmall} ${lightTheme.textLight} mb-0.5`}>Network Fee</div>
                <div className="font-bold text-green-600">~$0.01</div>
              </div>
            </div>

            {/* Total Section */}
            <div className={`p-4 ${lightTheme.bgAlt} border-t ${lightTheme.border}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className={`${THEME.labelSmall} ${lightTheme.textLight} mb-0.5`}>Total</div>
                  <div className={`text-2xl font-bold ${lightTheme.text}`}>${totalPrice().toFixed(2)}</div>
                </div>
                <div className="text-right">
                  <div className={`${THEME.labelSmall} ${lightTheme.textLight} mb-0.5`}>Currency</div>
                  <div className={`text-sm font-semibold ${colors.primaryText}`}>
                    {mode === 'mock' ? 'USDC' : 'ARC'}
                  </div>
                </div>
              </div>

              <CheckoutButton />

              {/* Security Note */}
              <div className={`mt-3 flex items-center justify-center gap-2 ${THEME.labelSmall} ${lightTheme.textLight}`}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Secure · Arc Blockchain
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
