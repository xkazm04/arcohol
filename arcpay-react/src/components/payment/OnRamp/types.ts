import type { SupportedChain, SupportedCurrency, Money } from '../../../theme/types';

/**
 * Supported on-ramp providers
 */
export type OnRampProvider = 'moonpay' | 'transak' | 'coinbase' | 'circle';

/**
 * On-ramp transaction status
 */
export type OnRampStatus =
  | 'idle'
  | 'selecting_provider'
  | 'fetching_quote'
  | 'awaiting_payment'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

/**
 * Fiat currency codes
 */
export type FiatCurrency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';

/**
 * Payment method for fiat
 */
export type FiatPaymentMethod = 'card' | 'bank_transfer' | 'apple_pay' | 'google_pay';

/**
 * On-ramp provider configuration
 */
export interface OnRampProviderConfig {
  /** Provider identifier */
  provider: OnRampProvider;
  /** Display name */
  name: string;
  /** Provider logo URL */
  logo: string;
  /** Supported fiat currencies */
  supportedFiatCurrencies: FiatCurrency[];
  /** Supported crypto currencies */
  supportedCryptoCurrencies: SupportedCurrency[];
  /** Supported chains */
  supportedChains: SupportedChain[];
  /** Supported payment methods */
  supportedPaymentMethods: FiatPaymentMethod[];
  /** Minimum purchase amount in USD */
  minAmount: number;
  /** Maximum purchase amount in USD */
  maxAmount: number;
  /** Estimated fee percentage */
  feePercent: number;
  /** Whether provider is available */
  available: boolean;
  /** Provider-specific API key (optional, uses ArcPay's if not provided) */
  apiKey?: string;
}

/**
 * Quote for on-ramp purchase
 */
export interface OnRampQuote {
  /** Quote ID from provider */
  quoteId: string;
  /** Provider used */
  provider: OnRampProvider;
  /** Fiat amount to pay */
  fiatAmount: number;
  /** Fiat currency */
  fiatCurrency: FiatCurrency;
  /** Crypto amount to receive */
  cryptoAmount: string;
  /** Crypto currency */
  cryptoCurrency: SupportedCurrency;
  /** Destination chain */
  chain: SupportedChain;
  /** Network fee */
  networkFee: number;
  /** Provider fee */
  providerFee: number;
  /** Total fees */
  totalFees: number;
  /** Exchange rate */
  exchangeRate: number;
  /** Quote expiry timestamp */
  expiresAt: Date;
  /** Whether quote is still valid */
  isValid: boolean;
}

/**
 * On-ramp transaction result
 */
export interface OnRampTransaction {
  /** Transaction ID */
  id: string;
  /** Provider used */
  provider: OnRampProvider;
  /** Transaction status */
  status: 'pending' | 'processing' | 'completed' | 'failed';
  /** Fiat amount paid */
  fiatAmount: number;
  /** Fiat currency */
  fiatCurrency: FiatCurrency;
  /** Crypto amount received */
  cryptoAmount: string;
  /** Crypto currency */
  cryptoCurrency: SupportedCurrency;
  /** Destination chain */
  chain: SupportedChain;
  /** Destination wallet address */
  walletAddress: string;
  /** Blockchain transaction hash (if completed) */
  txHash?: string;
  /** Created timestamp */
  createdAt: Date;
  /** Completed timestamp */
  completedAt?: Date;
  /** Error message if failed */
  errorMessage?: string;
}

/**
 * On-ramp error
 */
export interface OnRampError {
  /** Error code */
  code: 'provider_unavailable' | 'quote_expired' | 'payment_failed' | 'kyc_required' | 'limit_exceeded' | 'unsupported_region' | 'network_error';
  /** Error message */
  message: string;
  /** Provider that errored */
  provider?: OnRampProvider;
  /** Whether error is recoverable */
  recoverable: boolean;
}

/**
 * Props for FiatOnRamp component
 */
export interface FiatOnRampProps {
  /** Amount of crypto needed */
  amount: string;
  /** Crypto currency to purchase */
  currency: SupportedCurrency;
  /** Target chain */
  chain: SupportedChain;
  /** Destination wallet address */
  walletAddress: string;
  /** Preferred fiat currency */
  fiatCurrency?: FiatCurrency;
  /** Preferred provider (optional) */
  preferredProvider?: OnRampProvider;
  /** Allowed providers (defaults to all) */
  allowedProviders?: OnRampProvider[];
  /** Called when purchase completes */
  onSuccess?: (transaction: OnRampTransaction) => void;
  /** Called on error */
  onError?: (error: OnRampError) => void;
  /** Called when user cancels */
  onCancel?: () => void;
  /** Whether to show provider selection */
  showProviderSelection?: boolean;
  /** Custom class name */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

/**
 * Props for OnRampProviderCard component
 */
export interface OnRampProviderCardProps {
  /** Provider configuration */
  provider: OnRampProviderConfig;
  /** Quote for this provider (if available) */
  quote?: OnRampQuote;
  /** Whether this provider is selected */
  isSelected?: boolean;
  /** Whether loading quote */
  isLoading?: boolean;
  /** Called when provider is selected */
  onSelect?: (provider: OnRampProvider) => void;
}

/**
 * Props for OnRampCheckout - enhanced Checkout with on-ramp
 */
export interface OnRampCheckoutProps {
  /** Whether to enable on-ramp when balance is insufficient */
  enableOnRamp?: boolean;
  /** Threshold below which to show on-ramp option (as percentage of total) */
  onRampThreshold?: number;
  /** Preferred on-ramp provider */
  preferredOnRampProvider?: OnRampProvider;
  /** Allowed on-ramp providers */
  allowedOnRampProviders?: OnRampProvider[];
  /** Fiat currency for on-ramp */
  fiatCurrency?: FiatCurrency;
}

/**
 * Balance check result
 */
export interface BalanceCheckResult {
  /** Current balance */
  balance: Money;
  /** Amount needed */
  amountNeeded: Money;
  /** Shortfall (if any) */
  shortfall: Money | null;
  /** Whether balance is sufficient */
  isSufficient: boolean;
  /** Recommended on-ramp amount (includes buffer) */
  recommendedOnRampAmount: string;
}
