// =====================================================
// Invoice Types
// =====================================================

export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'partially_paid' | 'overdue' | 'canceled';

// =====================================================
// Line Item Types
// =====================================================

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// =====================================================
// Invoice Types
// =====================================================

export interface Invoice {
  id: string;
  organizationId: string;
  customerId?: string;
  customer?: {
    id: string;
    companyName?: string;
    contactName?: string;
    email: string;
    walletAddress?: string;
  };
  reference: string;
  buyer?: {
    company?: string;
    name?: string;
    email?: string;
    walletAddress?: string;
  };
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  amount: number;
  feeRate: number;
  feeAmount: number;
  netAmount: number;
  currency: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate?: string;
  viewedAt?: string;
  paidAt?: string;
  paymentUrl?: string;
  qrCode?: string;
  lineItems: InvoiceLineItem[];
  notes?: string;
  terms?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface InvoicePayment {
  id: string;
  amount: number;
  currency: string;
  txHash?: string;
  chain: string;
  payerAddress?: string;
  status: string;
  paidAt: string;
  confirmedAt?: string;
  createdAt: string;
}

// =====================================================
// Create/Update Params
// =====================================================

export interface CreateInvoiceParams {
  customerId: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  dueDate?: string;
  notes?: string;
  terms?: string;
  taxRate?: number;
  discountAmount?: number;
  currency?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateInvoiceParams {
  lineItems?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  dueDate?: string;
  notes?: string;
  terms?: string;
  taxRate?: number;
  discountAmount?: number;
  status?: InvoiceStatus;
  metadata?: Record<string, unknown>;
}

export interface MarkPaidParams {
  txHash?: string;
  payerAddress?: string;
  chain?: string;
  notes?: string;
}

// =====================================================
// List/Query Params
// =====================================================

export interface ListInvoicesParams {
  status?: InvoiceStatus;
  customerId?: string;
  limit?: number;
  offset?: number;
}
