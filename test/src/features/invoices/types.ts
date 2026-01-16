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
// x402 Payment Types
// =====================================================

export type X402PaymentMethod = 'gateway' | 'direct';

export interface X402PaymentConfig {
  enabled: boolean;
  sellerAddress: string;
  network: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface X402InvoicePayment {
  invoiceId: string;
  paymentMethod: X402PaymentMethod;
  payerAddress: string;
  amount: string;
  network: string;
  signature?: string;
  transaction?: string;
  batchId?: string;
  settledAt?: string;
  status: 'pending' | 'batched' | 'settled' | 'failed';
}

export interface PayViaX402Params {
  payerAddress: string;
  signature: string;
  network?: string;
}

export interface X402PaymentRequirements {
  x402Version: number;
  scheme: string;
  network: string;
  maxAmountRequired: string;
  resource: string;
  description: string;
  payTo: string;
  maxTimeoutSeconds: number;
  extra?: {
    invoiceId: string;
    reference: string;
  };
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

// =====================================================
// Invoice Delivery Types
// =====================================================

export type DeliveryStatus = 'pending' | 'sent' | 'delivered' | 'failed';

export interface InvoiceDelivery {
  invoiceId: string;
  pdfUrl?: string;
  portalUrl?: string;
  deliveryStatus: DeliveryStatus;
  sentAt?: string;
  deliveredAt?: string;
  reminderCount: number;
  lastReminderAt?: string;
  recipientEmail: string;
  error?: string;
}

export interface SendInvoiceParams {
  email?: string; // Override customer email
  includePortalLink?: boolean;
  personalMessage?: string;
}

export interface SendReminderParams {
  email?: string;
  personalMessage?: string;
}

// =====================================================
// Direction 1: Invoice Lifecycle Automation Types
// =====================================================

// Reminder Rules
export type EscalationAction = 'mark_uncollectible' | 'pause' | 'none';

export interface ReminderRule {
  id: string;
  organizationId: string;
  name: string;
  isDefault: boolean;
  enabled: boolean;
  reminderDays: number[]; // e.g., [-3, 0, 3, 7, 14] - negative = before due date
  escalateAfterDays: number;
  escalationAction: EscalationAction;
  includePdf: boolean;
  ccInternalEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReminderRuleParams {
  name: string;
  isDefault?: boolean;
  enabled?: boolean;
  reminderDays: number[];
  escalateAfterDays?: number;
  escalationAction?: EscalationAction;
  includePdf?: boolean;
  ccInternalEmail?: string;
}

export interface UpdateReminderRuleParams {
  name?: string;
  isDefault?: boolean;
  enabled?: boolean;
  reminderDays?: number[];
  escalateAfterDays?: number;
  escalationAction?: EscalationAction;
  includePdf?: boolean;
  ccInternalEmail?: string;
}

// Scheduled Reminders
export type ReminderType = 'before_due' | 'on_due' | 'overdue';
export type ScheduledReminderStatus = 'pending' | 'sent' | 'skipped' | 'failed';

export interface ScheduledReminder {
  id: string;
  invoiceId: string;
  ruleId?: string;
  scheduledFor: string;
  reminderType: ReminderType;
  daysOffset: number;
  status: ScheduledReminderStatus;
  sentAt?: string;
  errorMessage?: string;
  createdAt: string;
}

// Invoice Templates
export type RecurrenceInterval = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface InvoiceTemplate {
  id: string;
  organizationId: string;
  name: string;
  customerId?: string;
  customer?: {
    id: string;
    companyName?: string;
    email: string;
  };
  lineItems: InvoiceLineItem[];
  notes?: string;
  terms?: string;
  taxRate?: number;
  currency: string;
  recurrenceEnabled: boolean;
  recurrenceInterval?: RecurrenceInterval;
  recurrenceDay?: number; // 1-28 for monthly, 1-7 for weekly
  nextInvoiceDate?: string;
  autoSend: boolean;
  daysUntilDue: number;
  reminderRuleId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateParams {
  name: string;
  customerId?: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  notes?: string;
  terms?: string;
  taxRate?: number;
  currency?: string;
  recurrenceEnabled?: boolean;
  recurrenceInterval?: RecurrenceInterval;
  recurrenceDay?: number;
  nextInvoiceDate?: string;
  autoSend?: boolean;
  daysUntilDue?: number;
  reminderRuleId?: string;
}

export interface UpdateTemplateParams {
  name?: string;
  customerId?: string;
  lineItems?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  notes?: string;
  terms?: string;
  taxRate?: number;
  currency?: string;
  recurrenceEnabled?: boolean;
  recurrenceInterval?: RecurrenceInterval;
  recurrenceDay?: number;
  nextInvoiceDate?: string;
  autoSend?: boolean;
  daysUntilDue?: number;
  reminderRuleId?: string;
}

// Bulk Operations
export type BulkAction = 'send' | 'remind' | 'cancel' | 'delete' | 'export';
export type ExportFormat = 'csv' | 'excel' | 'json' | 'pdf';

export interface BulkActionRequest {
  invoiceIds: string[];
  action: BulkAction;
  options?: {
    format?: ExportFormat;
    reason?: string;
  };
}

export interface BulkActionResult {
  success: boolean;
  processed: number;
  failed: number;
  errors?: Array<{ invoiceId: string; error: string }>;
  exportUrl?: string; // For export action
}

// =====================================================
// Direction 3: Accounting & Tax Compliance Types
// =====================================================

// Audit Trail
export type AuditEventType =
  | 'created'
  | 'updated'
  | 'sent'
  | 'viewed'
  | 'payment_received'
  | 'partially_paid'
  | 'paid'
  | 'refunded'
  | 'canceled'
  | 'reminder_sent'
  | 'reminder_scheduled'
  | 'status_changed'
  | 'due_date_changed'
  | 'amount_changed';

export type AuditActorType = 'user' | 'system' | 'customer' | 'api';

export interface AuditActor {
  type: AuditActorType;
  id?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditLogEntry {
  id: string;
  invoiceId: string;
  eventType: AuditEventType;
  actorType: AuditActorType;
  actorId?: string;
  actorEmail?: string;
  previousState?: Partial<Invoice>;
  newState?: Partial<Invoice>;
  changes?: Record<string, { from: unknown; to: unknown }>;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AuditLogParams {
  invoiceId: string;
  eventType: AuditEventType;
  actor: AuditActor;
  previousState?: Partial<Invoice>;
  newState?: Partial<Invoice>;
  metadata?: Record<string, unknown>;
}

// Tax Configuration
export type TaxType = 'sales_tax' | 'vat' | 'gst';

export interface TaxConfiguration {
  id: string;
  organizationId: string;
  name: string;
  regionCode: string; // 'US', 'EU', 'GB', 'AU', etc.
  taxType: TaxType;
  defaultRate: number; // Percentage (e.g., 20 for 20%)
  regionalRates?: Record<string, number>; // { "CA": 7.25, "NY": 8.0, ... }
  reverseChargeEnabled: boolean;
  reverseChargeThreshold?: number;
  isDefault: boolean;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaxConfigParams {
  name: string;
  regionCode: string;
  taxType: TaxType;
  defaultRate: number;
  regionalRates?: Record<string, number>;
  reverseChargeEnabled?: boolean;
  reverseChargeThreshold?: number;
  isDefault?: boolean;
  enabled?: boolean;
}

export interface UpdateTaxConfigParams {
  name?: string;
  regionCode?: string;
  taxType?: TaxType;
  defaultRate?: number;
  regionalRates?: Record<string, number>;
  reverseChargeEnabled?: boolean;
  reverseChargeThreshold?: number;
  isDefault?: boolean;
  enabled?: boolean;
}

// Customer Tax Settings
export interface CustomerTaxSettings {
  id: string;
  customerId: string;
  taxRegion: string;
  taxId?: string; // VAT number, EIN, etc.
  taxIdValidated: boolean;
  taxIdValidatedAt?: string;
  taxExempt: boolean;
  exemptionCertificateUrl?: string;
  exemptionExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCustomerTaxParams {
  taxRegion?: string;
  taxId?: string;
  taxExempt?: boolean;
  exemptionCertificateUrl?: string;
  exemptionExpiresAt?: string;
}

// Tax Calculation Result
export interface TaxBreakdownItem {
  name: string;
  rate: number;
  amount: number;
}

export interface TaxCalculation {
  taxAmount: number;
  taxRate: number;
  taxType: TaxType;
  breakdown: TaxBreakdownItem[];
  reverseCharge: boolean;
  exemptReason?: string;
}

export interface CalculateTaxParams {
  organizationId: string;
  customerId: string;
  subtotal: number;
  lineItems?: InvoiceLineItem[];
  shippingAddress?: {
    country: string;
    state?: string;
    city?: string;
    postalCode?: string;
  };
}

// Invoice Sequence (Legal Numbering)
export interface InvoiceSequence {
  id: string;
  organizationId: string;
  prefix: string;
  fiscalYear: number;
  currentNumber: number;
  numberPadding: number;
}

// Accounting Export
export interface ExportParams {
  organizationId: string;
  format: ExportFormat;
  fromDate?: string;
  toDate?: string;
  status?: InvoiceStatus[];
  includePayments?: boolean;
  includeLineItems?: boolean;
  includeAuditTrail?: boolean;
}

export interface ExportResult {
  success: boolean;
  url?: string;
  fileName?: string;
  recordCount: number;
  generatedAt: string;
}

// =====================================================
// Extended Invoice Type (with new fields)
// =====================================================

export interface InvoiceExtended extends Invoice {
  // Lifecycle automation fields
  scheduledSendAt?: string;
  autoSendReminders: boolean;
  reminderRuleId?: string;

  // Tax compliance fields
  taxRegion?: string;
  taxType?: TaxType;
  taxBreakdown?: TaxBreakdownItem[];
  reverseCharge: boolean;
  customerTaxId?: string;

  // Legal numbering
  invoiceNumber?: string; // Gapless legal number
}
