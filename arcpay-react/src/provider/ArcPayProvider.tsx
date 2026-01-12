import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import { ArcPayThemeProvider } from '../theme/ThemeProvider';
import type {
  ArcPayProviderConfig,
  ArcPayTheme,
  BrandConfig,
  CheckoutConfig,
  InvoiceConfig,
  SubscriptionConfig,
} from '../theme/types';

/**
 * ArcPay context value
 */
interface ArcPayContextValue {
  publicKey: string;
  environment: 'sandbox' | 'production';
  brand?: BrandConfig;
  checkout?: CheckoutConfig;
  invoice?: InvoiceConfig;
  subscription?: SubscriptionConfig;
}

const ArcPayContext = createContext<ArcPayContextValue | null>(null);

/**
 * ArcPay provider props
 */
export interface ArcPayProviderProps {
  /** ArcPay public key */
  publicKey: string;

  /** Environment (sandbox or production) */
  environment?: 'sandbox' | 'production';

  /** Theme configuration */
  theme?: Partial<ArcPayTheme>;

  /** Theme preset */
  preset?: 'light' | 'dark';

  /** Brand configuration */
  brand?: BrandConfig;

  /** Checkout configuration */
  checkout?: CheckoutConfig;

  /** Invoice configuration */
  invoice?: InvoiceConfig;

  /** Subscription configuration */
  subscription?: SubscriptionConfig;

  /** Locale for internationalization */
  locale?: string;

  /** Error handler */
  onError?: (error: Error) => void;

  /** Children */
  children: ReactNode;
}

/**
 * Main ArcPay provider component
 */
export function ArcPayProvider({
  publicKey,
  environment = 'sandbox',
  theme,
  preset = 'light',
  brand,
  checkout,
  invoice,
  subscription,
  locale,
  onError,
  children,
}: ArcPayProviderProps) {
  const contextValue = useMemo<ArcPayContextValue>(
    () => ({
      publicKey,
      environment,
      brand,
      checkout,
      invoice,
      subscription,
    }),
    [publicKey, environment, brand, checkout, invoice, subscription]
  );

  return (
    <ArcPayContext.Provider value={contextValue}>
      <ArcPayThemeProvider theme={theme} preset={preset}>
        {children}
      </ArcPayThemeProvider>
    </ArcPayContext.Provider>
  );
}

/**
 * Hook to access ArcPay context
 */
export function useArcPay(): ArcPayContextValue {
  const context = useContext(ArcPayContext);

  if (!context) {
    throw new Error('useArcPay must be used within an ArcPayProvider');
  }

  return context;
}

/**
 * Hook to check if we're in an ArcPay provider
 */
export function useArcPayOptional(): ArcPayContextValue | null {
  return useContext(ArcPayContext);
}
