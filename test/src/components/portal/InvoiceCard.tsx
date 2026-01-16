'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface Invoice {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  dueDate?: string;
  issueDate: string;
  paidAt?: string;
}

interface InvoiceCardProps {
  invoice: Invoice;
  orgSlug: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: 'text-slate-400', bg: 'bg-slate-500/10' },
  sent: { label: 'Pending', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  viewed: { label: 'Viewed', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  paid: { label: 'Paid', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  partially_paid: { label: 'Partial', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  overdue: { label: 'Overdue', color: 'text-red-400', bg: 'bg-red-500/10' },
  canceled: { label: 'Canceled', color: 'text-slate-400', bg: 'bg-slate-500/10' },
};

export function InvoiceCard({ invoice, orgSlug }: InvoiceCardProps) {
  const status = statusConfig[invoice.status] || statusConfig.draft;
  const isPending = ['sent', 'viewed', 'overdue', 'partially_paid'].includes(invoice.status);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoice.currency || 'USD',
    }).format(amount);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isOverdue =
    invoice.status !== 'paid' &&
    invoice.dueDate &&
    new Date(invoice.dueDate) < new Date();

  return (
    <Link href={`/portal/${orgSlug}/invoices/${invoice.id}`}>
      <motion.div
        whileHover={{ scale: 1.01, x: 3 }}
        whileTap={{ scale: 0.99 }}
        className={`bg-slate-900/50 border rounded-xl p-4 transition-colors cursor-pointer ${
          isOverdue
            ? 'border-red-500/30 hover:border-red-500/50'
            : 'border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center gap-4">
            {/* Status indicator */}
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${status.bg}`}
            >
              {invoice.status === 'paid' ? (
                <svg className={`w-5 h-5 ${status.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : isOverdue ? (
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className={`w-5 h-5 ${status.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
            </div>

            {/* Invoice info */}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">
                  #{invoice.reference}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-medium ${status.bg} ${status.color}`}
                >
                  {isOverdue && invoice.status !== 'paid' ? 'OVERDUE' : status.label.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-slate-500">
                  Issued {formatDate(invoice.issueDate)}
                </span>
                {invoice.dueDate && invoice.status !== 'paid' && (
                  <>
                    <span className="text-slate-700">•</span>
                    <span className={`text-xs ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
                      Due {formatDate(invoice.dueDate)}
                    </span>
                  </>
                )}
                {invoice.paidAt && (
                  <>
                    <span className="text-slate-700">•</span>
                    <span className="text-xs text-emerald-400">
                      Paid {formatDate(invoice.paidAt)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-lg font-semibold text-white">
                {formatCurrency(invoice.amount)}
              </div>
              <div className="text-xs text-slate-500">{invoice.currency || 'USDC'}</div>
            </div>

            {/* Pay button for pending invoices */}
            {isPending && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-medium rounded-lg"
                onClick={(e) => e.stopPropagation()}
              >
                Pay Now
              </motion.div>
            )}

            {/* Arrow for navigation */}
            <svg
              className="w-5 h-5 text-slate-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
