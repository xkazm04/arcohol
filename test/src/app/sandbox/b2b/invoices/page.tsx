'use client';

import { useState } from 'react';
import { useInvoices } from '@/mocks/MockB2BProvider';
import { InvoiceForm, InvoicePreview, InvoiceList } from './_components';

export default function InvoicesPage() {
  const { invoices, isCreating, createInvoice } = useInvoices();

  const [formData, setFormData] = useState({
    amount: '10000',
    reference: 'INV-2024-001',
    buyerEmail: 'buyer@acme.com',
    buyerCompany: 'Acme Corp',
  });

  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  const showPreview = true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createInvoice({
      amount: parseFloat(formData.amount),
      reference: formData.reference,
      buyerEmail: formData.buyerEmail,
      buyerCompany: formData.buyerCompany,
    });

    const match = formData.reference.match(/(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10) + 1;
      setFormData((prev) => ({
        ...prev,
        reference: prev.reference.replace(/\d+$/, num.toString().padStart(3, '0')),
      }));
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white mb-1">Invoices</h1>
          <p className="text-sm text-slate-400">Create, track, and manage commercial invoices</p>
        </div>
        <div className="flex bg-slate-900/40 p-1 rounded-lg border border-slate-800/60">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'create' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            Create New
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'list' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            History ({invoices.length})
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className={`${showPreview ? 'col-span-12 md:col-span-5' : 'col-span-12'} flex flex-col gap-6 transition-all duration-300`}>
          {activeTab === 'create' ? (
            <InvoiceForm
              formData={formData}
              isCreating={isCreating}
              onFormChange={setFormData}
              onSubmit={handleSubmit}
            />
          ) : (
            <InvoiceList invoices={invoices} />
          )}
        </div>

        {/* Documentary Preview */}
        {showPreview && (
          <InvoicePreview
            reference={formData.reference}
            amount={formData.amount}
            buyerCompany={formData.buyerCompany}
            buyerEmail={formData.buyerEmail}
          />
        )}
      </div>
    </div>
  );
}
