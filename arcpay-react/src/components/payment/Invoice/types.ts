import type { BrandConfig, SupportedCurrency, PaymentStatus, Money } from '../../../theme/types';
import type { PaymentResult } from '../Checkout/types';

/**
 * Invoice line item
 */
export interface InvoiceLineItem {
  id?: string;
  description: string;
  quantity?: number;
  unitPrice?: number;
  amount: number;
  taxRate?: number;
}

/**
 * Customer information
 */
export interface InvoiceCustomer {
  name: string;
  email?: string;
  address?: string;
  taxId?: string;
}

/**
 * Invoice data
 */
export interface InvoiceData {
  id?: string;
  reference: string;
  customer: InvoiceCustomer;
  items: InvoiceLineItem[];
  subtotal?: number;
  taxAmount?: number;
  total?: number;
  currency: SupportedCurrency;
  dueDate?: string;
  issuedDate?: string;
  notes?: string;
  terms?: string;
  status?: InvoiceStatus;
  paidAt?: string;
  paymentId?: string;
}

/**
 * Invoice status
 */
export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';

/**
 * Invoice component props
 */
export interface InvoiceProps {
  /** Invoice ID to fetch (mutually exclusive with invoice) */
  invoiceId?: string;

  /** Invoice data (mutually exclusive with invoiceId) */
  invoice?: InvoiceData;

  /** Brand customization */
  branding?: BrandConfig & {
    /** Company address for invoice header */
    companyAddress?: string;
    /** Company email */
    companyEmail?: string;
    /** Company phone */
    companyPhone?: string;
    /** Company tax ID */
    companyTaxId?: string;
  };

  /** Show PDF download button */
  showPdfDownload?: boolean;

  /** Show print button */
  showPrint?: boolean;

  /** Show pay button */
  showPayButton?: boolean;

  /** Show QR code for payment */
  showQRCode?: boolean;

  /** Recipient address for payment */
  recipient?: string;

  /** Callback when invoice is paid */
  onPaid?: (payment: PaymentResult) => void;

  /** Callback when PDF is downloaded */
  onDownload?: () => void;

  /** Callback when invoice is printed */
  onPrint?: () => void;

  /** Additional CSS class */
  className?: string;

  /** Custom styles */
  style?: React.CSSProperties;

  /** Test mode */
  testMode?: boolean;
}

/**
 * Invoice header props
 */
export interface InvoiceHeaderProps {
  branding?: InvoiceProps['branding'];
  reference: string;
  issuedDate?: string;
  dueDate?: string;
  status?: InvoiceStatus;
}

/**
 * Invoice customer props
 */
export interface InvoiceCustomerProps {
  customer: InvoiceCustomer;
}

/**
 * Line items table props
 */
export interface LineItemsProps {
  items: InvoiceLineItem[];
  currency: SupportedCurrency;
}

/**
 * Invoice totals props
 */
export interface InvoiceTotalsProps {
  subtotal: number;
  taxAmount?: number;
  total: number;
  currency: SupportedCurrency;
  amountPaid?: number;
}
