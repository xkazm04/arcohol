'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  StatCard,
  StatusBadge,
  Card,
  CardHeader,
  Modal,
  FilterTabs,
  GlowButton,
  FormInput,
  FormSelect,
  staggerContainer,
  listItem,
} from '@/components/dashboard';
import { useInvoices } from '@/features/invoices';
import type { InvoiceStatus } from '@/features/invoices';

export default function InvoicesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    invoices,
    total,
    isLoading,
    error,
    refetch,
    getInvoice,
    isFetchingSingle,
    sendInvoice,
    isSending,
    markAsPaid,
    isMarkingPaid,
    deleteInvoice,
    isDeleting,
  } = useInvoices();

  // Calculate stats
  const stats = useMemo(() => {
    const outstanding = invoices
      .filter((inv) => ['sent', 'viewed', 'overdue'].includes(inv.status))
      .reduce((sum, inv) => sum + inv.amount, 0);

    const paid30d = invoices
      .filter((inv) => {
        if (inv.status !== 'paid' || !inv.paidAt) return false;
        const paidDate = new Date(inv.paidAt);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return paidDate >= thirtyDaysAgo;
      })
      .reduce((sum, inv) => sum + inv.amount, 0);

    const pending = invoices.filter((inv) => ['sent', 'viewed', 'draft'].includes(inv.status)).length;
    const overdue = invoices.filter((inv) => inv.status === 'overdue').length;

    return { outstanding, paid30d, pending, overdue };
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // Status filter
      if (filter !== 'all') {
        if (filter === 'pending' && !['sent', 'viewed', 'draft'].includes(inv.status)) {
          return false;
        } else if (filter !== 'pending' && inv.status !== filter) {
          return false;
        }
      }
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const customerName = inv.customer?.companyName || inv.customer?.contactName || '';
        if (
          !customerName.toLowerCase().includes(query) &&
          !inv.reference.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [invoices, filter, searchQuery]);

  const handleViewInvoice = async (id: string) => {
    setSelectedInvoiceId(id);
    setShowDetailModal(true);
  };

  const handleSendInvoice = async (id: string) => {
    const result = await sendInvoice(id);
    if (result) {
      refetch();
    }
  };

  const handleMarkPaid = async (id: string) => {
    const result = await markAsPaid(id);
    if (result) {
      refetch();
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (confirm('Are you sure you want to delete this draft invoice?')) {
      const result = await deleteInvoice(id);
      if (result) {
        refetch();
      }
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4 max-w-6xl"
    >
      {/* Compact Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-white">Invoices</h1>
          <FilterTabs
            tabs={[
              { id: 'all', label: 'All' },
              { id: 'pending', label: 'Pending' },
              { id: 'paid', label: 'Paid' },
              { id: 'overdue', label: 'Overdue' },
            ]}
            activeTab={filter}
            onChange={setFilter}
          />
        </div>
        <GlowButton
          onClick={() => setShowCreateModal(true)}
          icon={
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          New Invoice
        </GlowButton>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={staggerContainer} className="grid grid-cols-4 gap-3">
        <StatCard
          label="Outstanding"
          value={`$${stats.outstanding.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          accent="cyan"
          delay={0}
        />
        <StatCard
          label="Paid (30d)"
          value={`$${stats.paid30d.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          accent="emerald"
          delay={0.05}
        />
        <StatCard label="Pending" value={stats.pending.toString()} subValue="invoices" accent="amber" delay={0.1} />
        <StatCard
          label="Overdue"
          value={stats.overdue.toString()}
          subValue={stats.overdue > 0 ? 'action needed' : ''}
          accent="red"
          delay={0.15}
        />
      </motion.div>

      {/* Invoice Table */}
      <Card accent="cyan" delay={0.2} className="overflow-hidden">
        <CardHeader
          title="All Invoices"
          action={
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="px-2.5 py-1 bg-slate-800/60 border border-slate-700/50 rounded text-[11px] text-white placeholder-slate-500 w-40 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
          }
        />

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-slate-800/20 border-b border-slate-800/40 text-[10px] font-medium text-slate-500 uppercase">
          <div className="col-span-2">Invoice</div>
          <div className="col-span-3">Customer</div>
          <div className="col-span-2 text-right">Amount</div>
          <div className="col-span-2 text-center">Status</div>
          <div className="col-span-2 text-right">Date</div>
          <div className="col-span-1"></div>
        </div>

        {/* Table Body */}
        {isLoading ? (
          <div className="px-6 py-12 text-center">
            <div className="w-8 h-8 mx-auto border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Loading invoices...</p>
          </div>
        ) : error ? (
          <div className="px-6 py-12 text-center">
            <p className="text-red-400 text-sm mb-2">Failed to load invoices</p>
            <GlowButton variant="secondary" onClick={refetch}>
              Retry
            </GlowButton>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg
              className="w-12 h-12 mx-auto text-slate-600 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-slate-400 text-sm mb-1">No invoices found</p>
            <p className="text-slate-500 text-xs">Create an invoice to get started</p>
          </div>
        ) : (
          <motion.div variants={staggerContainer} className="divide-y divide-slate-800/30">
            {filteredInvoices.map((invoice) => (
              <motion.div
                key={invoice.id}
                variants={listItem}
                whileHover={{ x: 3, backgroundColor: 'rgba(51, 65, 85, 0.2)' }}
                onClick={() => handleViewInvoice(invoice.id)}
                className="grid grid-cols-12 gap-2 px-3 py-2.5 items-center cursor-pointer transition-colors group"
              >
                <div className="col-span-2">
                  <span className="text-xs font-mono text-white">{invoice.reference}</span>
                </div>
                <div className="col-span-3">
                  <span className="text-xs text-slate-300">
                    {invoice.customer?.companyName || invoice.customer?.contactName || invoice.buyer?.company || 'Unknown'}
                  </span>
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-xs font-mono text-white">
                    ${invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="col-span-2 text-center">
                  <StatusBadge status={invoice.status as any} />
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-xs text-slate-500">
                    {invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : '-'}
                  </span>
                </div>
                <div className="col-span-1 text-right">
                  <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    {invoice.status === 'draft' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendInvoice(invoice.id);
                          }}
                          disabled={isSending}
                          className="p-1 hover:bg-slate-700/50 rounded text-slate-400 hover:text-cyan-400"
                          title="Send Invoice"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteInvoice(invoice.id);
                          }}
                          disabled={isDeleting}
                          className="p-1 hover:bg-slate-700/50 rounded text-slate-400 hover:text-red-400"
                          title="Delete"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </>
                    )}
                    {['sent', 'viewed'].includes(invoice.status) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkPaid(invoice.id);
                        }}
                        disabled={isMarkingPaid}
                        className="p-1 hover:bg-slate-700/50 rounded text-slate-400 hover:text-emerald-400"
                        title="Mark as Paid"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-1 hover:bg-slate-700/50 rounded text-slate-400 hover:text-white"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Table Footer */}
        <div className="px-3 py-2 border-t border-slate-800/40 flex items-center justify-between text-[10px] text-slate-500">
          <span>
            Showing {filteredInvoices.length} of {total} invoices
          </span>
          <div className="flex gap-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-2 py-0.5 hover:bg-slate-800 rounded transition-colors"
            >
              Prev
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-2 py-0.5 hover:bg-slate-800 rounded transition-colors"
            >
              Next
            </motion.button>
          </div>
        </div>
      </Card>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="New Invoice"
        subtitle="Create a new invoice for your customer"
        footer={
          <>
            <GlowButton variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </GlowButton>
            <GlowButton onClick={() => setShowCreateModal(false)}>Create Invoice</GlowButton>
          </>
        }
      >
        <div className="space-y-4">
          <FormInput label="Customer" placeholder="Company name" />
          <FormInput label="Email" type="email" placeholder="billing@company.com" />
          <div className="grid grid-cols-2 gap-3">
            <FormInput label="Amount" type="number" placeholder="0.00" prefix="$" />
            <FormSelect
              label="Due"
              options={[
                { value: 'net30', label: 'Net 30' },
                { value: 'net15', label: 'Net 15' },
                { value: 'receipt', label: 'Due on receipt' },
              ]}
              value="net30"
            />
          </div>
        </div>
      </Modal>

      {/* Detail Modal (Placeholder) */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedInvoiceId(null);
        }}
        title="Invoice Details"
        subtitle={selectedInvoiceId ? `Viewing invoice` : ''}
      >
        {isFetchingSingle ? (
          <div className="py-8 text-center">
            <div className="w-8 h-8 mx-auto border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Loading invoice details...</p>
          </div>
        ) : (
          <div className="text-slate-400 text-sm">
            <p>Invoice details will be displayed here.</p>
            <p className="mt-2 text-xs text-slate-500">
              Full invoice view with line items, payment history, and actions.
            </p>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
