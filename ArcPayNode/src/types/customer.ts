/**
 * Customer related types
 */

import type { Metadata, Timestamps } from './common';

export interface Customer extends Timestamps {
  id: string;
  walletAddress: string;
  email?: string;
  name?: string;
  phone?: string;
  description?: string;
  metadata?: Metadata;
  // Computed fields
  totalSpent?: string;
  paymentCount?: number;
  activeSubscriptions?: number;
}

export interface CreateCustomerParams {
  walletAddress: string;
  email?: string;
  name?: string;
  phone?: string;
  description?: string;
  metadata?: Metadata;
}

export interface UpdateCustomerParams {
  email?: string;
  name?: string;
  phone?: string;
  description?: string;
  metadata?: Metadata;
}

export interface ListCustomersParams {
  limit?: number;
  startingAfter?: string;
  email?: string;
  walletAddress?: string;
  createdAfter?: Date;
  createdBefore?: Date;
}

// Customer Portal Session (for self-service)
export interface CustomerPortalSession {
  id: string;
  customerId: string;
  url: string;
  returnUrl: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface CreatePortalSessionParams {
  customerId: string;
  returnUrl: string;
}
