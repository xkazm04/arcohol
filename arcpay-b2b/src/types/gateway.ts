/**
 * Merchant Gateway Types
 * Direction 3: B2B Checkout + Instant Settlement
 */

import type {
  BlockchainAddress,
  Chain,
  Currency,
  Identifiable,
  Metadata,
  Money,
  PaginationParams,
  PaymentStatus,
  SettlementStatus,
  Timestamped
} from './common';

// ============================================================================
// Invoice
// ============================================================================

export interface Invoice extends Identifiable, Timestamped {
  /** Merchant ID */
  merchantId: string;
  /** Invoice reference number */
  reference: string;
  /** Invoice amount */
  amount: Money;
  /** Fee amount */
  fee: Money;
  /** Net amount to merchant */
  netAmount: Money;
  /** Invoice status */
  status: InvoiceStatus;
  /** Payment status */
  paymentStatus: PaymentStatus;
  /** Settlement status */
  settlementStatus: SettlementStatus;
  /** Buyer information */
  buyer: BuyerInfo;
  /** Line items */
  lineItems: LineItem[];
  /** Due date */
  dueDate: Date;
  /** Payment URL */
  paymentUrl: string;
  /** QR code data URL */
  qrCode: string;
  /** Payment details (after payment) */
  payment?: PaymentDetails;
  /** Settlement details (after settlement) */
  settlement?: SettlementDetails;
  /** Invoice metadata */
  metadata?: Metadata;
}

export type InvoiceStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'paid'
  | 'partially_paid'
  | 'overdue'
  | 'canceled'
  | 'refunded';

export interface BuyerInfo {
  /** Company name */
  company?: string;
  /** Contact name */
  name?: string;
  /** Email address */
  email: string;
  /** Wallet address (if known) */
  walletAddress?: string;
}

export interface LineItem {
  /** Item description */
  description: string;
  /** Quantity */
  quantity: number;
  /** Unit price */
  unitPrice: Money;
  /** Total (quantity * unitPrice) */
  total: Money;
}

// ============================================================================
// Payment Details
// ============================================================================

export interface PaymentDetails {
  /** Payment ID */
  id: string;
  /** Transaction hash */
  txHash: string;
  /** Chain used for payment */
  chain: Chain;
  /** Payer wallet address */
  payerAddress: string;
  /** Amount paid */
  amount: Money;
  /** Payment timestamp */
  paidAt: Date;
}

export interface SettlementDetails {
  /** Settlement ID */
  id: string;
  /** Transaction hash */
  txHash: string;
  /** Chain used for settlement */
  chain: Chain;
  /** Destination address */
  destinationAddress: string;
  /** Amount settled */
  amount: Money;
  /** Settlement timestamp */
  settledAt: Date;
  /** Settlement latency in seconds */
  latencySeconds: number;
}

// ============================================================================
// Invoice Operations
// ============================================================================

export interface CreateInvoiceParams {
  /** Invoice amount */
  amount: number;
  /** Currency (default: USD) */
  currency?: Currency;
  /** Invoice reference number */
  reference: string;
  /** Buyer information */
  buyer: BuyerInfo;
  /** Line items */
  lineItems: CreateLineItemParams[];
  /** Due date */
  dueDate: Date;
  /** Metadata */
  metadata?: Metadata;
  /** Send email to buyer */
  sendEmail?: boolean;
}

export interface CreateLineItemParams {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface UpdateInvoiceParams {
  /** Update buyer info */
  buyer?: Partial<BuyerInfo>;
  /** Update line items */
  lineItems?: CreateLineItemParams[];
  /** Update due date */
  dueDate?: Date;
  /** Update metadata */
  metadata?: Metadata;
}

export interface ListInvoicesParams extends PaginationParams {
  /** Filter by status */
  status?: InvoiceStatus;
  /** Filter by payment status */
  paymentStatus?: PaymentStatus;
  /** Filter by buyer email */
  buyerEmail?: string;
  /** Filter by date range */
  startDate?: Date;
  endDate?: Date;
}

// ============================================================================
// Merchant Settings
// ============================================================================

export interface MerchantSettings extends Identifiable, Timestamped {
  /** Organization ID */
  organizationId: string;
  /** Merchant name */
  name: string;
  /** Settlement configuration */
  settlement: SettlementConfig;
  /** Accepted chains */
  acceptedChains: Chain[];
  /** Branding */
  branding?: MerchantBranding;
  /** Dispute protection enabled */
  disputeProtection: boolean;
  /** Fee rate (percentage) */
  feeRate: number;
}

export interface SettlementConfig {
  /** Settlement wallet address */
  destination: BlockchainAddress;
  /** Enable instant settlement */
  instant: boolean;
  /** Settlement currency */
  currency: Currency;
  /** Minimum amount for settlement */
  minimumAmount?: number;
}

export interface MerchantBranding {
  /** Logo URL */
  logoUrl?: string;
  /** Primary color */
  primaryColor?: string;
  /** Company website */
  websiteUrl?: string;
}

export interface UpdateMerchantSettingsParams {
  name?: string;
  settlement?: Partial<SettlementConfig>;
  acceptedChains?: Chain[];
  branding?: Partial<MerchantBranding>;
  disputeProtection?: boolean;
}

// ============================================================================
// Batch Payments
// ============================================================================

export interface BatchPayment extends Identifiable, Timestamped {
  /** Merchant ID */
  merchantId: string;
  /** Batch reference */
  reference: string;
  /** Payments in batch */
  payments: BatchPaymentItem[];
  /** Total amount */
  totalAmount: Money;
  /** Total fee */
  totalFee: Money;
  /** Batch status */
  status: BatchStatus;
  /** Transaction hash (when processed) */
  txHash?: string;
  /** Processing timestamp */
  processedAt?: Date;
}

export type BatchStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'partially_completed'
  | 'failed';

export interface BatchPaymentItem {
  /** Recipient address */
  recipient: string;
  /** Amount */
  amount: Money;
  /** Memo/description */
  memo?: string;
  /** Item status */
  status: PaymentStatus;
  /** Transaction hash (if separate) */
  txHash?: string;
}

export interface CreateBatchPaymentParams {
  /** Batch reference */
  reference: string;
  /** Payments to process */
  payments: CreateBatchPaymentItemParams[];
  /** Metadata */
  metadata?: Metadata;
}

export interface CreateBatchPaymentItemParams {
  /** Recipient address */
  recipient: string;
  /** Amount */
  amount: number;
  /** Memo */
  memo?: string;
}

export interface ListBatchPaymentsParams extends PaginationParams {
  /** Filter by status */
  status?: BatchStatus;
  /** Filter by date range */
  startDate?: Date;
  endDate?: Date;
}

// ============================================================================
// Gateway Events (for webhooks)
// ============================================================================

export type GatewayEventType =
  | 'invoice.created'
  | 'invoice.sent'
  | 'invoice.viewed'
  | 'invoice.paid'
  | 'invoice.overdue'
  | 'invoice.canceled'
  | 'settlement.pending'
  | 'settlement.completed'
  | 'settlement.failed'
  | 'batch.created'
  | 'batch.processing'
  | 'batch.completed'
  | 'batch.failed';

export interface GatewayEvent {
  type: GatewayEventType;
  resourceId: string;
  data: Record<string, unknown>;
  timestamp: Date;
}
