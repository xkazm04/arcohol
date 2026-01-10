/**
 * Common types shared across the B2B SDK
 */

// ============================================================================
// Configuration
// ============================================================================

export interface ArcPayB2BConfig {
  /** Secret API key (sk_...) */
  secretKey: string;
  /** API base URL (defaults to production) */
  baseUrl?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** API version */
  apiVersion?: string;
  /** Enable debug logging */
  debug?: boolean;
}

// ============================================================================
// Pagination
// ============================================================================

export interface PaginationParams {
  /** Maximum number of items to return (1-100) */
  limit?: number;
  /** Cursor for pagination */
  cursor?: string;
  /** Sort order */
  order?: 'asc' | 'desc';
}

export interface PaginatedList<T> {
  /** Array of items */
  data: T[];
  /** Whether there are more items available */
  hasMore: boolean;
  /** Total count of items (if available) */
  totalCount?: number;
  /** Cursor for next page */
  nextCursor?: string;
}

// ============================================================================
// API Response
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    requestId: string;
    timestamp: string;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  requestId?: string;
}

// ============================================================================
// Currency & Money
// ============================================================================

export type Currency = 'USDC' | 'USDY' | 'USD';

export interface Money {
  /** Amount as string to preserve precision */
  amount: string;
  /** Currency code */
  currency: Currency;
}

// ============================================================================
// Common Statuses
// ============================================================================

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'canceled'
  | 'refunded';

export type SettlementStatus =
  | 'pending'
  | 'processing'
  | 'settled'
  | 'failed';

// ============================================================================
// Metadata & IDs
// ============================================================================

export type Metadata = Record<string, string | number | boolean>;

export interface Identifiable {
  id: string;
}

export interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Address Types
// ============================================================================

export interface BlockchainAddress {
  /** Blockchain address (0x...) */
  address: string;
  /** Chain identifier */
  chain: Chain;
}

export type Chain =
  | 'arc'
  | 'ethereum'
  | 'base'
  | 'polygon'
  | 'arbitrum'
  | 'optimism';

// ============================================================================
// Organization
// ============================================================================

export interface Organization extends Identifiable, Timestamped {
  /** Organization name */
  name: string;
  /** Business email */
  email: string;
  /** Settlement wallet address */
  settlementAddress: BlockchainAddress;
  /** Organization metadata */
  metadata?: Metadata;
  /** Organization status */
  status: 'active' | 'suspended' | 'pending_verification';
}
