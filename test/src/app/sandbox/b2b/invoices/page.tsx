'use client';

import { useState } from 'react';
import { useInvoices } from '@/mocks/MockB2BProvider';

const statusColors: Record<string, string> = {
  draft: 'bg-zinc-700 text-zinc-300',
  sent: 'bg-blue-500/20 text-blue-400',
  paid: 'bg-green-500/20 text-green-400',
  overdue: 'bg-red-500/20 text-red-400',
  canceled: 'bg-zinc-700 text-zinc-400',
};

export default function InvoicesPage() {
  const { invoices, isCreating, createInvoice } = useInvoices();

  const [formData, setFormData] = useState({
    amount: '10000',
    reference: 'INV-2024-001',
    buyerEmail: 'buyer@acme.com',
    buyerCompany: 'Acme Corp',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createInvoice({
      amount: parseFloat(formData.amount),
      reference: formData.reference,
      buyerEmail: formData.buyerEmail,
      buyerCompany: formData.buyerCompany,
    });

    // Increment reference number
    const match = formData.reference.match(/(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10) + 1;
      setFormData((prev) => ({
        ...prev,
        reference: prev.reference.replace(/\d+$/, num.toString().padStart(3, '0')),
      }));
    }
  };

  const feeAmount = (parseFloat(formData.amount) * 0.001).toFixed(2);
  const netAmount = (parseFloat(formData.amount) - parseFloat(feeAmount)).toFixed(2);
  const stripeFee = (parseFloat(formData.amount) * 0.029 + 0.30).toFixed(2);
  const savings = (parseFloat(stripeFee) - parseFloat(feeAmount)).toFixed(2);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Invoices</h1>
        <p className="text-zinc-400">
          Create B2B invoices with instant settlement via Circle Gateway
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Invoice Form */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Create Invoice</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Amount (USD)</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="10000"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Reference</label>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => setFormData((prev) => ({ ...prev, reference: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="INV-2024-001"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Buyer Email</label>
                <input
                  type="email"
                  value={formData.buyerEmail}
                  onChange={(e) => setFormData((prev) => ({ ...prev, buyerEmail: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="buyer@acme.com"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Company</label>
                <input
                  type="text"
                  value={formData.buyerCompany}
                  onChange={(e) => setFormData((prev) => ({ ...prev, buyerCompany: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Acme Corp"
                />
              </div>
            </div>

            {/* Fee Breakdown */}
            <div className="bg-zinc-800 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Subtotal</span>
                <span className="text-white">${parseFloat(formData.amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Arc Fee (0.1%)</span>
                <span className="text-green-400">-${feeAmount}</span>
              </div>
              <div className="h-px bg-zinc-700 my-2" />
              <div className="flex justify-between">
                <span className="text-zinc-400">You Receive</span>
                <span className="text-white font-medium">${parseFloat(netAmount).toLocaleString()}</span>
              </div>
            </div>

            {/* Savings Comparison */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-zinc-400">vs Stripe (2.9% + $0.30)</p>
                  <p className="text-xs text-zinc-500">Would pay ${stripeFee}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-400">Save ${savings}</p>
                  <p className="text-xs text-zinc-500">per invoice</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              {isCreating ? 'Creating...' : 'Create Invoice'}
            </button>
          </form>
        </div>

        {/* Invoice List */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Invoices</h2>

          {invoices.length > 0 ? (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="bg-zinc-800 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-white">{invoice.reference}</p>
                      <p className="text-sm text-zinc-500">{invoice.buyer.company}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${statusColors[invoice.status]}`}>
                      {invoice.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">{invoice.buyer.email}</span>
                    <span className="text-white font-medium">${invoice.amount.amount}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-zinc-700 flex items-center justify-between text-xs">
                    <span className="text-zinc-500">
                      Due: {invoice.dueDate.toLocaleDateString()}
                    </span>
                    <a
                      href={invoice.paymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Payment Link →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-500">
              <p className="text-4xl mb-2">📄</p>
              <p>No invoices yet</p>
              <p className="text-sm">Create your first invoice to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Settlement Info */}
      <div className="bg-gradient-to-r from-blue-600/20 to-green-600/20 rounded-xl border border-blue-500/30 p-6">
        <h2 className="text-lg font-semibold text-white mb-2">Instant Settlement</h2>
        <p className="text-zinc-400 mb-4">
          Unlike traditional rails (T+2), Arc settles payments instantly via Circle Gateway.
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-2xl font-bold text-blue-400">&lt;5s</p>
            <p className="text-sm text-zinc-400">Settlement time</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-400">0.1%</p>
            <p className="text-sm text-zinc-400">Transaction fee</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-400">5+</p>
            <p className="text-sm text-zinc-400">Chains supported</p>
          </div>
        </div>
      </div>

      {/* Code Example */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-800/50">
          <span className="text-sm text-zinc-400">Invoice Creation Example</span>
        </div>
        <pre className="p-4 text-sm overflow-x-auto">
          <code className="text-zinc-300">{`const invoice = await arcpay.gateway.createInvoice({
  amount: 10000,
  currency: 'USD',
  reference: 'INV-2024-001',
  buyer: {
    company: 'Acme Corp',
    email: 'ap@acme.com',
  },
  lineItems: [
    { description: 'Annual SaaS License', quantity: 1, unitPrice: 8000 },
    { description: 'Implementation', quantity: 1, unitPrice: 2000 },
  ],
  dueDate: new Date('2024-02-08'),
  sendEmail: true, // Send invoice email to buyer
});

// Returns: { paymentUrl, qrCode, fee, netAmount, ... }`}</code>
        </pre>
      </div>
    </div>
  );
}
