/**
 * Common types used across the SDK
 */

export interface PaginationParams {
  limit?: number;
  startingAfter?: string;
  endingBefore?: string;
}

export interface PaginatedList<T> {
  data: T[];
  hasMore: boolean;
  totalCount?: number;
}

export interface ArcPayConfig {
  secretKey: string;
  webhookSecret?: string;
  apiVersion?: string;
  baseUrl?: string;
  timeout?: number;
}

export interface ApiResponse<T> {
  data: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export type Currency = 'USDC' | 'USDT' | 'DAI';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'canceled'
  | 'refunded';

export interface Metadata {
  [key: string]: string | number | boolean | null;
}

export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}
