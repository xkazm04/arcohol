import type { SupportedChain, SupportedCurrency, Money, BrandConfig, PaymentStatus } from '../../../theme/types';
import type { OnRampProvider, FiatCurrency, OnRampTransaction, OnRampError } from '../OnRamp/types';

/**
 * Cart item for checkout
 */
export interface CartItem {
  id?: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  image?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Payment result after successful checkout
 */
export interface PaymentResult {
  id: string;
  status: PaymentStatus;
  amount: Money;
  chain: SupportedChain;
  txHash?: string;
  recipient: string;
  createdAt: Date;
  confirmedAt?: Date;
}

/**
 * Checkout error
 */
export interface CheckoutError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Checkout configuration
 */
export interface CheckoutConfig {
  recipient: string;
  currency?: SupportedCurrency;
  chains?: SupportedChain[];
  defaultChain?: SupportedChain;
  allowChainSwitch?: boolean;
  showFees?: boolean;
  showSummary?: boolean;
  showQRCode?: boolean;
  confirmationBlocks?: number;
  expirationMinutes?: number;
}

/**
 * Checkout component props
 */
export interface CheckoutProps {
  /** Cart items to checkout */
  items: CartItem[];

  /** Recipient wallet address */
  recipient: string;

  /** Payment currency */
  currency?: SupportedCurrency;

  /** Allowed blockchain chains */
  chains?: SupportedChain[];

  /** Default selected chain */
  defaultChain?: SupportedChain;

  /** Brand customization */
  branding?: BrandConfig;

  /** Show order summary */
  showSummary?: boolean;

  /** Show chain selector */
  showChainSelector?: boolean;

  /** Show estimated fees */
  showFees?: boolean;

  /** Show QR code for payment */
  showQRCode?: boolean;

  /** Callback on successful payment */
  onSuccess?: (payment: PaymentResult) => void;

  /** Callback on payment error */
  onError?: (error: CheckoutError) => void;

  /** Callback when checkout is cancelled */
  onCancel?: () => void;

  /** Additional CSS class */
  className?: string;

  /** Custom styles */
  style?: React.CSSProperties;

  /** Test mode */
  testMode?: boolean;

  // ============ On-Ramp Integration ============

  /** Enable fiat on-ramp when balance is insufficient */
  enableOnRamp?: boolean;

  /** User's wallet address (required for on-ramp) */
  walletAddress?: string;

  /** Preferred fiat currency for on-ramp */
  fiatCurrency?: FiatCurrency;

  /** Preferred on-ramp provider */
  preferredOnRampProvider?: OnRampProvider;

  /** Allowed on-ramp providers */
  allowedOnRampProviders?: OnRampProvider[];

  /** Callback when on-ramp purchase completes */
  onOnRampSuccess?: (transaction: OnRampTransaction) => void;

  /** Callback when on-ramp fails */
  onOnRampError?: (error: OnRampError) => void;
}

/**
 * Checkout state
 */
export interface CheckoutState {
  items: CartItem[];
  selectedChain: SupportedChain;
  currency: SupportedCurrency;
  subtotal: number;
  estimatedFee: number;
  total: number;
  status: 'idle' | 'connecting' | 'confirming' | 'processing' | 'success' | 'error' | 'insufficient_balance' | 'on_ramp';
  error?: CheckoutError;
  payment?: PaymentResult;
  /** User's balance (if checked) */
  balance?: string;
  /** Whether balance is sufficient */
  hasSufficientBalance?: boolean;
}

/**
 * Chain selector props
 */
export interface ChainSelectorProps {
  chains: SupportedChain[];
  selected: SupportedChain;
  onChange: (chain: SupportedChain) => void;
  disabled?: boolean;
}

/**
 * Cart summary props
 */
export interface CartSummaryProps {
  items: CartItem[];
  currency: SupportedCurrency;
  onRemoveItem?: (itemId: string) => void;
  onUpdateQuantity?: (itemId: string, quantity: number) => void;
  editable?: boolean;
}

/**
 * Payment method selector props
 */
export interface PaymentMethodSelectorProps {
  selectedChain: SupportedChain;
  onChainChange: (chain: SupportedChain) => void;
  chains: SupportedChain[];
  currency: SupportedCurrency;
  estimatedFee: number;
  showFees?: boolean;
}
