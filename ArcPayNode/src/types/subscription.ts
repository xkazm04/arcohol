/**
 * Subscription related types
 */

import type { Currency, Metadata, Timestamps } from './common';

// Subscription Plan
export interface SubscriptionPlan extends Timestamps {
  id: string;
  merchantId: string;
  name: string;
  description?: string;
  amount: string;
  currency: Currency;
  interval: SubscriptionInterval;
  intervalCount: number;
  trialDays: number;
  active: boolean;
  metadata?: Metadata;
}

export type SubscriptionInterval = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface CreatePlanParams {
  name: string;
  description?: string;
  amount: string;
  currency?: Currency;
  interval: SubscriptionInterval;
  intervalCount?: number;
  trialDays?: number;
  metadata?: Metadata;
}

export interface UpdatePlanParams {
  name?: string;
  description?: string;
  active?: boolean;
  metadata?: Metadata;
}

export interface ListPlansParams {
  limit?: number;
  startingAfter?: string;
  active?: boolean;
}

// Subscription
export interface Subscription extends Timestamps {
  id: string;
  planId: string;
  plan?: SubscriptionPlan;
  customerId: string;
  customerWallet: string;
  merchantWallet: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  trialStart?: Date;
  trialEnd?: Date;
  pausedAt?: Date;
  resumesAt?: Date;
  approvalTxHash?: string;
  lastPaymentAt?: Date;
  lastPaymentId?: string;
  nextPaymentAt?: Date;
  failedPaymentCount: number;
  metadata?: Metadata;
}

export type SubscriptionStatus =
  | 'incomplete'        // Waiting for approval
  | 'trialing'          // In trial period
  | 'active'            // Active and paid
  | 'past_due'          // Payment failed, retrying
  | 'paused'            // Temporarily paused
  | 'canceled'          // Canceled
  | 'unpaid'            // Failed all retry attempts
  | 'expired';          // Trial expired without payment

export interface CreateSubscriptionParams {
  planId: string;
  customerWallet: string;
  customerId?: string;
  skipTrial?: boolean;
  trialDays?: number;  // Override plan trial days
  metadata?: Metadata;
}

export interface UpdateSubscriptionParams {
  planId?: string;      // Change plan
  cancelAtPeriodEnd?: boolean;
  metadata?: Metadata;
}

export interface ListSubscriptionsParams {
  limit?: number;
  startingAfter?: string;
  customerId?: string;
  customerWallet?: string;
  planId?: string;
  status?: SubscriptionStatus | SubscriptionStatus[];
}

export interface CancelSubscriptionParams {
  cancelAtPeriodEnd?: boolean;  // true = cancel at end, false = immediate
  reason?: string;
}

export interface PauseSubscriptionParams {
  resumesAt?: Date;  // Optional date to auto-resume
  reason?: string;
}

// Subscription Events (for history)
export interface SubscriptionEvent extends Timestamps {
  id: string;
  subscriptionId: string;
  type: SubscriptionEventType;
  data: Record<string, unknown>;
}

export type SubscriptionEventType =
  | 'subscription.created'
  | 'subscription.activated'
  | 'subscription.trial_started'
  | 'subscription.trial_ended'
  | 'subscription.renewed'
  | 'subscription.payment_succeeded'
  | 'subscription.payment_failed'
  | 'subscription.past_due'
  | 'subscription.canceled'
  | 'subscription.paused'
  | 'subscription.resumed'
  | 'subscription.plan_changed'
  | 'subscription.expired';

// Invoice (generated for each payment period)
export interface SubscriptionInvoice extends Timestamps {
  id: string;
  subscriptionId: string;
  customerId: string;
  amount: string;
  currency: Currency;
  status: InvoiceStatus;
  periodStart: Date;
  periodEnd: Date;
  paymentId?: string;
  paidAt?: Date;
  dueDate: Date;
}

export type InvoiceStatus =
  | 'draft'
  | 'open'
  | 'paid'
  | 'void'
  | 'uncollectible';
