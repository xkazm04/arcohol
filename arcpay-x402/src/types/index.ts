// =============================================================================
// x402 Protocol Types
// =============================================================================

/**
 * Supported currencies for x402 payments
 */
export type X402Currency = 'USDC' | 'USDT' | 'DAI' | 'ETH';

/**
 * Supported chains for x402 payments
 */
export type X402Chain =
  | 'ethereum'
  | 'base'
  | 'arbitrum'
  | 'polygon'
  | 'optimism'
  | 'avalanche'
  | 'solana';

/**
 * Price specification for x402 endpoints
 */
export interface X402Price {
  /** Amount in decimal string (e.g., "0.01" for 1 cent) */
  amount: string;
  /** Currency (default: USDC) */
  currency?: X402Currency;
  /** Accepted chains (default: all) */
  chains?: X402Chain[];
}

/**
 * Dynamic pricing function
 */
export type X402PriceFunction<TRequest = unknown> = (
  request: TRequest
) => X402Price | Promise<X402Price>;

/**
 * Payment requirement returned in 402 response
 */
export interface X402PaymentRequirement {
  /** Protocol version */
  version: '1.0';
  /** Unique payment request ID */
  paymentId: string;
  /** Payment amount */
  amount: string;
  /** Currency */
  currency: X402Currency;
  /** Recipient address */
  recipient: string;
  /** Accepted chains */
  chains: X402Chain[];
  /** Facilitator URL */
  facilitator: string;
  /** Request expiration (ISO timestamp) */
  expiresAt: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Payment signature submitted by client
 */
export interface X402PaymentSignature {
  /** Payment request ID (must match requirement) */
  paymentId: string;
  /** Chain used for payment */
  chain: X402Chain;
  /** Payer address */
  payer: string;
  /** Transaction hash or signed permit */
  proof: string;
  /** Signature type */
  proofType: 'transaction' | 'permit' | 'authorization';
  /** Signature timestamp */
  timestamp: number;
}

/**
 * Payment verification result
 */
export interface X402PaymentVerification {
  /** Whether payment is valid */
  valid: boolean;
  /** Payment ID */
  paymentId: string;
  /** Amount paid */
  amount: string;
  /** Currency */
  currency: X402Currency;
  /** Payer address */
  payer: string;
  /** Chain used */
  chain: X402Chain;
  /** Transaction hash (if settled) */
  txHash?: string;
  /** Error message if invalid */
  error?: string;
}

/**
 * Facilitator configuration
 */
export interface X402FacilitatorConfig {
  /** Facilitator URL */
  url: string;
  /** API key (if required) */
  apiKey?: string;
  /** Custom headers */
  headers?: Record<string, string>;
}

/**
 * x402 middleware configuration
 */
export interface X402MiddlewareConfig {
  /** Price for requests (static or dynamic) */
  price: X402Price | X402PriceFunction;
  /** Recipient wallet address */
  recipient: string;
  /** Facilitator configuration */
  facilitator: X402FacilitatorConfig | string;
  /** Accepted chains (default: all) */
  chains?: X402Chain[];
  /** Skip payment for certain requests */
  skipIf?: (request: unknown) => boolean | Promise<boolean>;
  /** Payment validity duration in seconds (default: 300) */
  paymentTtl?: number;
  /** Callback on successful payment */
  onPayment?: (payment: X402PaymentVerification) => void | Promise<void>;
  /** Callback on payment error */
  onError?: (error: Error, request: unknown) => void | Promise<void>;
}

// =============================================================================
// Client Types
// =============================================================================

/**
 * Client configuration for making x402 requests
 */
export interface X402ClientConfig {
  /** Wallet for signing payments */
  wallet: X402Wallet;
  /** Default facilitator URL */
  facilitator?: string;
  /** Budget controls */
  budget?: X402BudgetConfig;
  /** Auto-approve payments under threshold */
  autoApprove?: X402AutoApproveConfig;
  /** Callbacks */
  onPayment?: (payment: X402PaymentInfo) => void;
  onBudgetWarning?: (warning: X402BudgetWarning) => void;
}

/**
 * Wallet interface for x402 payments
 */
export interface X402Wallet {
  /** Wallet address */
  address: string;
  /** Chain the wallet is connected to */
  chain: X402Chain;
  /** Sign a message */
  signMessage: (message: string) => Promise<string>;
  /** Sign typed data (EIP-712) */
  signTypedData?: (data: unknown) => Promise<string>;
  /** Send transaction */
  sendTransaction?: (tx: unknown) => Promise<string>;
  /** Get balance */
  getBalance?: (currency: X402Currency) => Promise<string>;
}

/**
 * Budget configuration
 */
export interface X402BudgetConfig {
  /** Maximum daily spending */
  daily?: number;
  /** Maximum per-request spending */
  perRequest?: number;
  /** Per-endpoint limits */
  perEndpoint?: Record<string, number>;
  /** Reset time (UTC hour, default: 0) */
  resetHour?: number;
}

/**
 * Auto-approve configuration
 */
export interface X402AutoApproveConfig {
  /** Auto-approve up to this amount per request */
  maxAmount: number;
  /** Require approval for new endpoints */
  newEndpointsRequireApproval?: boolean;
  /** Allowed endpoints (if not specified, all allowed) */
  allowedEndpoints?: string[];
}

/**
 * Budget warning
 */
export interface X402BudgetWarning {
  type: 'daily_limit_approaching' | 'daily_limit_reached' | 'endpoint_limit_reached';
  current: number;
  limit: number;
  endpoint?: string;
}

/**
 * Payment info for callbacks
 */
export interface X402PaymentInfo {
  paymentId: string;
  amount: string;
  currency: X402Currency;
  recipient: string;
  chain: X402Chain;
  txHash?: string;
  endpoint: string;
  timestamp: number;
}

// =============================================================================
// React Hook Types
// =============================================================================

/**
 * Hook configuration
 */
export interface UseX402FetchConfig {
  /** Wallet instance or connector */
  wallet?: X402Wallet;
  /** Auto-approve config */
  autoApprove?: X402AutoApproveConfig;
  /** Budget config */
  budget?: X402BudgetConfig;
  /** Show payment UI */
  showPaymentUI?: boolean;
}

/**
 * Hook return type
 */
export interface UseX402FetchReturn {
  /** Enhanced fetch function */
  fetch: (url: string, init?: RequestInit) => Promise<Response>;
  /** Whether a payment is pending user approval */
  isPaymentPending: boolean;
  /** Current pending payment details */
  pendingPayment: X402PaymentRequirement | null;
  /** Approve pending payment */
  approvePayment: () => Promise<void>;
  /** Reject pending payment */
  rejectPayment: () => void;
  /** Current balance (if wallet connected) */
  balance: string | null;
  /** Daily spending */
  dailySpending: number;
  /** Whether wallet is connected */
  isConnected: boolean;
  /** Error state */
  error: Error | null;
}

// =============================================================================
// HTTP Header Constants
// =============================================================================

export const X402_HEADERS = {
  /** Header containing payment requirement (402 response) */
  PAYMENT_REQUIRED: 'X-Payment-Required',
  /** Header containing payment signature (client request) */
  PAYMENT_SIGNATURE: 'X-Payment-Signature',
  /** Header containing payment ID (for tracking) */
  PAYMENT_ID: 'X-Payment-Id',
  /** Header containing payer address */
  PAYER_ADDRESS: 'X-Payer-Address',
} as const;
