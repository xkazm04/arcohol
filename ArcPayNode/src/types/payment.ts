/**
 * Payment related types
 */

import type { Currency, Metadata, PaymentStatus, Timestamps } from './common';

export interface Payment extends Timestamps {
  id: string;
  amount: string;
  currency: Currency;
  status: PaymentStatus;
  recipient: string;
  sender?: string;
  description?: string;
  txHash?: string;
  blockNumber?: number;
  metadata?: Metadata;
}

export interface CreatePaymentParams {
  amount: string;
  currency?: Currency;
  recipient: string;
  sender?: string;
  description?: string;
  metadata?: Metadata;
  idempotencyKey?: string;
}

export interface ListPaymentsParams {
  limit?: number;
  startingAfter?: string;
  endingBefore?: string;
  status?: PaymentStatus;
  recipient?: string;
  sender?: string;
  createdAfter?: Date;
  createdBefore?: Date;
}

// Payment Intent - for client-side completion
export interface PaymentIntent extends Timestamps {
  id: string;
  amount: string;
  currency: Currency;
  status: PaymentIntentStatus;
  clientSecret: string;
  recipient?: string;
  description?: string;
  metadata?: Metadata;
  paymentId?: string; // Linked payment when completed
  expiresAt: Date;
}

export type PaymentIntentStatus =
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'processing'
  | 'succeeded'
  | 'canceled'
  | 'expired';

export interface CreatePaymentIntentParams {
  amount: string;
  currency?: Currency;
  recipient?: string;
  description?: string;
  metadata?: Metadata;
  expiresIn?: number; // Seconds until expiration
}

// Payment Link - shareable URL
export interface PaymentLink extends Timestamps {
  id: string;
  url: string;
  amount: string;
  currency: Currency;
  active: boolean;
  description?: string;
  successUrl?: string;
  cancelUrl?: string;
  expiresAt?: Date;
  collectEmail?: boolean;
  collectName?: boolean;
  allowPromotionCodes?: boolean;
  metadata?: Metadata;
  completedPayments: number;
  totalCollected: string;
}

export interface CreatePaymentLinkParams {
  amount: string;
  currency?: Currency;
  description?: string;
  successUrl?: string;
  cancelUrl?: string;
  expiresAt?: Date;
  collectEmail?: boolean;
  collectName?: boolean;
  allowPromotionCodes?: boolean;
  metadata?: Metadata;
  maxCompletions?: number; // null = unlimited
}

export interface UpdatePaymentLinkParams {
  active?: boolean;
  description?: string;
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Metadata;
}

export interface ListPaymentLinksParams {
  limit?: number;
  startingAfter?: string;
  active?: boolean;
}
