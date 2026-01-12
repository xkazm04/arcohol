'use client';

import React, { useState } from 'react';
import type { Product } from '@/data/products';
import { useCartStore } from '@/store/cartStore';
import { useModeStore } from '@/store/modeStore';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const mode = useModeStore((state) => state.mode);
  const [isAdding, setIsAdding] = useState(false);
  const [showAdded, setShowAdded] = useState(false);

  const handleAddToCart = () => {
    if (!product.inStock) return;
    setIsAdding(true);
    addItem(product);

    setTimeout(() => {
      setIsAdding(false);
      setShowAdded(true);
      setTimeout(() => setShowAdded(false), 1500);
    }, 300);
  };

  return (
    <div className="group relative bg-white border border-zinc-200 hover:border-zinc-900 transition-all duration-300">
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-3 flex items-center justify-between">
          <span className="px-2 py-0.5 bg-white/90 backdrop-blur-sm text-[10px] uppercase tracking-wider font-medium text-zinc-600">
            {product.category}
          </span>
          {!product.inStock && (
            <span className="px-2 py-0.5 bg-zinc-900 text-[10px] uppercase tracking-wider font-medium text-white">
              Sold Out
            </span>
          )}
        </div>

        {/* Quick Add - Desktop */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-zinc-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex items-end justify-center pb-4">
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock || isAdding}
            className={`px-5 py-2.5 text-sm font-medium transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 ${
              !product.inStock
                ? 'bg-zinc-600 text-zinc-400 cursor-not-allowed'
                : showAdded
                ? 'bg-green-500 text-white'
                : 'bg-white text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            {!product.inStock ? (
              'Unavailable'
            ) : showAdded ? (
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Added
              </span>
            ) : isAdding ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add to Cart
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Product Info */}
        <div className="mb-4">
          <h3 className="font-semibold text-zinc-900 uppercase tracking-tight text-sm leading-tight group-hover:text-zinc-600 transition-colors">
            {product.name}
          </h3>
          <p className="mt-1.5 text-xs text-zinc-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
          {/* Price */}
          <div className="flex items-baseline gap-1">
            <span className={`text-xl font-bold ${
              mode === 'mock' ? 'text-zinc-900' : 'text-orange-600'
            }`}>
              ${product.price.toFixed(0)}
            </span>
            <span className="text-xs text-zinc-400">
              .{(product.price % 1).toFixed(2).slice(2)}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 ml-1">
              {mode === 'mock' ? 'USDC' : 'ARC'}
            </span>
          </div>

          {/* Mobile Add Button */}
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock || isAdding}
            className={`md:hidden w-9 h-9 flex items-center justify-center transition-all ${
              !product.inStock
                ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                : showAdded
                ? 'bg-green-500 text-white'
                : mode === 'mock'
                ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            {showAdded ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Stock Indicator */}
      {product.inStock && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5">
          <div className={`h-full w-0 group-hover:w-full transition-all duration-500 ${
            mode === 'mock' ? 'bg-violet-500' : 'bg-orange-500'
          }`} />
        </div>
      )}
    </div>
  );
}
