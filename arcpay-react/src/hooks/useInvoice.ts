import { useState, useCallback, useMemo, useEffect } from 'react';
import type { SupportedCurrency } from '../theme/types';
import type { InvoiceData, InvoiceLineItem } from '../components/payment/Invoice/types';
import type { PaymentResult, CheckoutError } from '../components/payment/Checkout/types';

/**
 * Invoice options
 */
export interface UseInvoiceOptions {
  invoiceId?: string;
  invoice?: InvoiceData;
  recipient?: string;
  onPaid?: (payment: PaymentResult) => void;
  onError?: (error: CheckoutError) => void;
}

/**
 * Invoice return type
 */
export interface UseInvoiceReturn {
  // Invoice data
  invoice: InvoiceData | null;
  isLoading: boolean;
  error: CheckoutError | null;

  // Calculated totals
  subtotal: number;
  taxAmount: number;
  total: number;
  amountDue: number;

  // Payment state
  isPaid: boolean;
  isProcessing: boolean;
  payment: PaymentResult | null;

  // Actions
  pay: () => Promise<PaymentResult | null>;
  downloadPdf: () => void;
  print: () => void;
  getQRCode: () => string;
  refresh: () => Promise<void>;
}

/**
 * Headless invoice hook
 */
export function useInvoice(options: UseInvoiceOptions): UseInvoiceReturn {
  const {
    invoiceId,
    invoice: providedInvoice,
    recipient,
    onPaid,
    onError,
  } = options;

  // State
  const [invoice, setInvoice] = useState<InvoiceData | null>(providedInvoice || null);
  const [isLoading, setIsLoading] = useState(!!invoiceId && !providedInvoice);
  const [error, setError] = useState<CheckoutError | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [payment, setPayment] = useState<PaymentResult | null>(null);
  const [isPaid, setIsPaid] = useState(providedInvoice?.status === 'paid');

  // Fetch invoice if ID provided
  useEffect(() => {
    if (invoiceId && !providedInvoice) {
      setIsLoading(true);
      // In real implementation, fetch from API
      // For demo, simulate loading
      setTimeout(() => {
        setIsLoading(false);
        // Would set invoice data here from API response
      }, 1000);
    }
  }, [invoiceId, providedInvoice]);

  // Update invoice if provided invoice changes
  useEffect(() => {
    if (providedInvoice) {
      setInvoice(providedInvoice);
      setIsPaid(providedInvoice.status === 'paid');
    }
  }, [providedInvoice]);

  // Calculate totals
  const { subtotal, taxAmount, total, amountDue } = useMemo(() => {
    if (!invoice) {
      return { subtotal: 0, taxAmount: 0, total: 0, amountDue: 0 };
    }

    // Use provided totals or calculate
    if (invoice.total !== undefined) {
      const sub = invoice.subtotal ?? invoice.total;
      const tax = invoice.taxAmount ?? 0;
      return {
        subtotal: sub,
        taxAmount: tax,
        total: invoice.total,
        amountDue: isPaid ? 0 : invoice.total,
      };
    }

    // Calculate from items
    const sub = invoice.items.reduce((sum, item) => sum + item.amount, 0);
    const tax = invoice.items.reduce((sum, item) => {
      if (item.taxRate) {
        return sum + item.amount * (item.taxRate / 100);
      }
      return sum;
    }, 0);
    const t = sub + tax;

    return {
      subtotal: sub,
      taxAmount: tax,
      total: t,
      amountDue: isPaid ? 0 : t,
    };
  }, [invoice, isPaid]);

  // Pay invoice
  const pay = useCallback(async (): Promise<PaymentResult | null> => {
    if (!invoice || isPaid) {
      return null;
    }

    if (!recipient) {
      const err: CheckoutError = {
        code: 'NO_RECIPIENT',
        message: 'No recipient address provided',
      };
      setError(err);
      onError?.(err);
      return null;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Simulate payment
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockPayment: PaymentResult = {
        id: `pay_${Math.random().toString(36).slice(2)}`,
        status: 'confirmed',
        amount: { amount: total.toFixed(2), currency: invoice.currency },
        chain: 'base',
        txHash: `0x${Math.random().toString(16).slice(2)}`,
        recipient,
        createdAt: new Date(),
        confirmedAt: new Date(),
      };

      setPayment(mockPayment);
      setIsPaid(true);
      setIsProcessing(false);
      onPaid?.(mockPayment);
      return mockPayment;
    } catch (err) {
      const checkoutError: CheckoutError = {
        code: 'PAYMENT_FAILED',
        message: err instanceof Error ? err.message : 'Payment failed',
      };
      setError(checkoutError);
      setIsProcessing(false);
      onError?.(checkoutError);
      return null;
    }
  }, [invoice, isPaid, recipient, total, onPaid, onError]);

  // Download PDF
  const downloadPdf = useCallback(() => {
    if (!invoice) return;

    // In real implementation, generate PDF using jspdf or call API
    console.log('PDF download requested for invoice:', invoice.reference);

    // Create a simple text download for demo
    const content = `
Invoice: ${invoice.reference}
Customer: ${invoice.customer.name}
Total: ${total} ${invoice.currency}
Status: ${isPaid ? 'Paid' : 'Pending'}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoice.reference}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [invoice, total, isPaid]);

  // Print
  const print = useCallback(() => {
    window.print();
  }, []);

  // Get QR code data
  const getQRCode = useCallback((): string => {
    if (!invoice || !recipient) {
      return '';
    }
    // Return payment URL for QR code
    return `ethereum:${recipient}?value=${total}&data=${invoice.reference}`;
  }, [invoice, recipient, total]);

  // Refresh invoice data
  const refresh = useCallback(async () => {
    if (!invoiceId) return;

    setIsLoading(true);
    try {
      // In real implementation, fetch from API
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Would update invoice data here
    } finally {
      setIsLoading(false);
    }
  }, [invoiceId]);

  return {
    // Data
    invoice,
    isLoading,
    error,

    // Totals
    subtotal,
    taxAmount,
    total,
    amountDue,

    // State
    isPaid,
    isProcessing,
    payment,

    // Actions
    pay,
    downloadPdf,
    print,
    getQRCode,
    refresh,
  };
}
