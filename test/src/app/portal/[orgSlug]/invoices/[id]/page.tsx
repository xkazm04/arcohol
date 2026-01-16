'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { usePortalAuth } from '@/features/portal/context/PortalAuthContext';
import { PaymentFlow } from '@/components/portal/PaymentFlow';

interface Invoice {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  dueDate?: string;
  issueDate: string;
  paidAt?: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  notes?: string;
  terms?: string;
  pdfUrl?: string;
}

interface PageProps {
  params: Promise<{ orgSlug: string; id: string }>;
}

export default function InvoiceDetailPage({ params }: PageProps) {
  const { authenticated, loading, login } = usePortalAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [pageParams, setPageParams] = useState<{ orgSlug: string; id: string } | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  // Get params
  useEffect(() => {
    params.then(p => setPageParams(p));
  }, [params]);

  // Handle magic link token
  useEffect(() => {
    const token = searchParams.get('token');
    if (token && !authenticated && !loading && pageParams) {
      login(token).then(success => {
        if (!success) {
          setError('Invalid or expired link.');
        } else {
          router.replace(`/portal/${pageParams.orgSlug}/invoices/${pageParams.id}`);
        }
      });
    }
  }, [searchParams, authenticated, loading, login, router, pageParams]);

  // Fetch invoice
  const fetchInvoice = useCallback(async () => {
    if (!pageParams || !authenticated) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/portal/${pageParams.orgSlug}/invoices/${pageParams.id}`);
      const data = await response.json();

      if (data.invoice) {
        setInvoice(data.invoice);
      } else {
        setError('Invoice not found');
      }
    } catch {
      setError('Failed to load invoice');
    } finally {
      setIsLoading(false);
    }
  }, [pageParams, authenticated]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  // Loading
  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated
  if (!authenticated) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Please sign in to view this invoice.</p>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!invoice || !pageParams) return null;

  const isPending = ['sent', 'viewed', 'overdue', 'partially_paid'].includes(invoice.status);
  const isOverdue = invoice.dueDate && new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid';

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency || 'USD' }).format(amount);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push(`/portal/${pageParams.orgSlug}`)}
          className="text-sm text-slate-400 hover:text-white flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to invoices
        </button>
        {invoice.pdfUrl && (
          <a
            href={invoice.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </a>
        )}
      </div>

      {/* Invoice Card */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        {/* Status Banner */}
        {isOverdue && (
          <div className="bg-red-500/10 border-b border-red-500/30 px-6 py-3">
            <p className="text-red-400 text-sm font-medium text-center">
              This invoice is overdue. Please pay as soon as possible.
            </p>
          </div>
        )}

        {invoice.status === 'paid' && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-6 py-3">
            <p className="text-emerald-400 text-sm font-medium text-center">
              This invoice has been paid. Thank you!
            </p>
          </div>
        )}

        {/* Header */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white mb-1">
                Invoice #{invoice.reference}
              </h1>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span>Issued {formatDate(invoice.issueDate)}</span>
                {invoice.dueDate && <span>Due {formatDate(invoice.dueDate)}</span>}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white mb-1">
                {formatCurrency(invoice.amount)}
              </div>
              <span className="text-sm text-slate-400">{invoice.currency || 'USDC'}</span>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-sm font-medium text-slate-400 mb-4">Items</h2>
          <div className="space-y-3">
            {invoice.lineItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex-1">
                  <span className="text-white">{item.description}</span>
                  <span className="text-slate-500 ml-2">x {item.quantity}</span>
                </div>
                <span className="text-white">{formatCurrency(item.total)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="p-6 border-b border-slate-800">
          <div className="space-y-2 max-w-xs ml-auto">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Subtotal</span>
              <span className="text-white">{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.taxAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Tax</span>
                <span className="text-white">{formatCurrency(invoice.taxAmount)}</span>
              </div>
            )}
            {invoice.discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Discount</span>
                <span className="text-emerald-400">-{formatCurrency(invoice.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-semibold pt-2 border-t border-slate-700">
              <span className="text-white">Total</span>
              <span className="text-cyan-400">{formatCurrency(invoice.amount)}</span>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        {(invoice.notes || invoice.terms) && (
          <div className="p-6 border-b border-slate-800 space-y-4">
            {invoice.notes && (
              <div>
                <h3 className="text-xs font-medium text-slate-400 mb-1">Notes</h3>
                <p className="text-sm text-slate-300">{invoice.notes}</p>
              </div>
            )}
            {invoice.terms && (
              <div>
                <h3 className="text-xs font-medium text-slate-400 mb-1">Terms</h3>
                <p className="text-sm text-slate-300">{invoice.terms}</p>
              </div>
            )}
          </div>
        )}

        {/* Payment CTA */}
        {isPending && (
          <div className="p-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowPayment(true)}
              className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-white text-base font-semibold rounded-lg transition-colors"
            >
              Pay {formatCurrency(invoice.amount)}
            </motion.button>
            <p className="text-xs text-slate-500 text-center mt-3">
              Secure payment via USDC stablecoin
            </p>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <PaymentFlow
          invoice={invoice}
          onClose={() => setShowPayment(false)}
          onSuccess={() => {
            setShowPayment(false);
            fetchInvoice();
          }}
        />
      )}
    </motion.div>
  );
}
