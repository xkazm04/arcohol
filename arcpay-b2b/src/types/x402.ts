/**
 * x402 Types
 *
 * Types for Circle Gateway x402 integration supporting gasless
 * micropayments and cross-chain treasury operations.
 */

import type { Chain, Timestamped, Identifiable } from './common';

// ==========================================================================
// Gateway Balance
// ==========================================================================

/**
 * Gateway wallet balance breakdown
 */
export interface GatewayBalance {
  /** Total balance in the Gateway */
  total: string;
  /** Balance available for payments or withdrawals */
  available: string;
  /** Balance locked in pending withdrawals */
  withdrawing: string;
  /** Balance ready to finalize withdrawal */
  withdrawable: string;
  /** Formatted amounts for display */
  formatted: {
    total: string;
    available: string;
    withdrawing: string;
    withdrawable: string;
  };
}

/**
 * Combined wallet and Gateway balances
 */
export interface CombinedBalances {
  /** Native wallet USDC balance */
  wallet: {
    balance: string;
    formatted: string;
  };
  /** Gateway contract balance */
  gateway: GatewayBalance;
}

// ==========================================================================
// Supported Networks
// ==========================================================================

/**
 * Supported network configuration
 */
export interface SupportedNetwork {
  /** Chain ID (e.g., 5042002 for Arc Testnet) */
  chainId: number;
  /** Network identifier (e.g., 'eip155:5042002') */
  network: string;
  /** Human-readable name */
  name: string;
  /** Whether gasless batching is supported */
  batchingEnabled: boolean;
  /** USDC contract address on this chain */
  usdcAddress: string;
  /** Gateway contract address on this chain */
  gatewayAddress?: string;
}

// ==========================================================================
// Payment Verification
// ==========================================================================

/**
 * Payment requirements for 402 response
 */
export interface PaymentRequirements {
  /** x402 protocol version */
  x402Version: number;
  /** Payment scheme (e.g., 'exact') */
  scheme: string;
  /** Network identifier */
  network: string;
  /** Maximum amount required in base units */
  maxAmountRequired: string;
  /** Resource description */
  resource: string;
  /** Seller's wallet address */
  payTo: string;
  /** Additional scheme-specific configuration */
  extra?: {
    name?: string;
    version?: string;
    verifyingContract?: string;
  };
}

/**
 * Payment payload from buyer
 */
export interface PaymentPayload {
  /** Payer's wallet address */
  payer: string;
  /** Amount in base units */
  amount: string;
  /** Recipient's wallet address */
  payTo: string;
  /** Network identifier */
  network: string;
  /** EIP-3009 signature */
  signature: string;
  /** Valid from timestamp */
  validFrom?: number;
  /** Valid to timestamp */
  validTo?: number;
  /** Nonce for signature */
  nonce?: string;
}

/**
 * Payment verification result
 */
export interface VerifyResult {
  /** Whether the payment signature is valid */
  isValid: boolean;
  /** Reason for invalid payment */
  invalidReason?: string;
  /** Verified payer address */
  payer?: string;
}

/**
 * Payment settlement result
 */
export interface SettleResult {
  /** Whether settlement was successful */
  success: boolean;
  /** Error reason if failed */
  errorReason?: string;
  /** Payer address */
  payer?: string;
  /** Transaction hash */
  transaction: string;
}

// ==========================================================================
// Cross-Chain Withdrawal
// ==========================================================================

/**
 * Parameters for cross-chain withdrawal
 */
export interface CrossChainWithdrawParams {
  /** Amount to withdraw in human-readable format (e.g., '100.00') */
  amount: string;
  /** Source chain for the withdrawal */
  sourceChain: Chain;
  /** Destination chain to receive funds */
  destinationChain: Chain;
  /** Recipient address on destination chain */
  recipient: string;
}

/**
 * Result of cross-chain withdrawal
 */
export interface CrossChainWithdrawResult {
  /** Withdrawal ID */
  id: string;
  /** Amount withdrawn */
  amount: string;
  /** Formatted amount */
  formattedAmount: string;
  /** Source chain */
  sourceChain: Chain;
  /** Destination chain */
  destinationChain: Chain;
  /** Recipient address */
  recipient: string;
  /** Mint transaction hash on destination */
  mintTxHash?: string;
  /** Withdrawal status */
  status: 'pending' | 'processing' | 'completed' | 'failed';
  /** Estimated completion time */
  estimatedCompletionAt?: string;
  /** Timestamps */
  createdAt: string;
  completedAt?: string;
}

// ==========================================================================
// Gateway Configuration
// ==========================================================================

/**
 * Gateway seller configuration
 */
export interface GatewaySellerConfig extends Identifiable, Timestamped {
  /** Organization ID */
  organizationId: string;
  /** Seller's wallet address */
  sellerAddress: string;
  /** Whether Gateway payments are enabled */
  enabled: boolean;
  /** Networks to accept payments from */
  networks: string[];
  /** Default resource description */
  description?: string;
}

/**
 * Parameters to create or update seller config
 */
export interface UpsertSellerConfigParams {
  /** Seller's wallet address */
  sellerAddress: string;
  /** Networks to accept payments from */
  networks?: string[];
  /** Default resource description */
  description?: string;
  /** Whether to enable Gateway payments */
  enabled?: boolean;
}

// ==========================================================================
// Gateway Payments
// ==========================================================================

/**
 * Gateway payment record
 */
export interface GatewayPayment extends Identifiable, Timestamped {
  /** Organization ID */
  organizationId: string;
  /** Payer's wallet address */
  payer: string;
  /** Amount paid */
  amount: string;
  /** Formatted amount */
  formattedAmount: string;
  /** Network the payment was made on */
  network: string;
  /** Settlement transaction hash */
  transaction: string;
  /** API endpoint that was paid for */
  endpoint?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Parameters to list Gateway payments
 */
export interface ListGatewayPaymentsParams {
  /** Filter by payer address */
  payer?: string;
  /** Filter by network */
  network?: string;
  /** Filter by endpoint */
  endpoint?: string;
  /** Filter payments after this date */
  after?: Date;
  /** Filter payments before this date */
  before?: Date;
  /** Maximum number of results */
  limit?: number;
  /** Cursor for pagination */
  cursor?: string;
}

// ==========================================================================
// Event Types
// ==========================================================================

/**
 * x402-related webhook event types
 */
export type X402EventType =
  | 'x402.payment.received'
  | 'x402.payment.settled'
  | 'x402.payment.failed'
  | 'x402.withdrawal.initiated'
  | 'x402.withdrawal.completed'
  | 'x402.withdrawal.failed';

/**
 * x402 webhook event
 */
export interface X402Event {
  /** Event type */
  type: X402EventType;
  /** Event payload */
  data: GatewayPayment | CrossChainWithdrawResult;
}
