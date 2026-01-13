'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInvoices } from '@/mocks/MockB2BProvider';
import { InvoiceForm, InvoicePreview, InvoiceList } from './_components';
import { staggerContainer, listItem } from '@/components/dashboard';

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
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="h-[calc(100vh-100px)] flex flex-col gap-4"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between shrink-0"
      >
        <div>
          <h1
            className="text-lg font-semibold text-white mb-1"
            style={{ textShadow: '0 0 20px rgba(6, 182, 212, 0.3)' }}
          >
            Invoices
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">Create, track, and manage commercial invoices</p>
        </div>
        <div className="relative flex bg-slate-900/50 p-1 rounded-lg border border-slate-800/40">
          {['create', 'list'].map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab as 'create' | 'list')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative px-3 py-1.5 text-[11px] font-medium rounded-md transition-all ${
                activeTab === tab
                  ? 'text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="activeInvoiceTab"
                  className="absolute inset-0 bg-cyan-500/20 border border-cyan-500/30 rounded-md"
                  style={{ boxShadow: '0 0 15px rgba(6, 182, 212, 0.2)' }}
                />
              )}
              <span className="relative z-10">
                {tab === 'create' ? 'Create New' : `History (${invoices.length})`}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      <div className="flex-1 min-h-0 grid grid-cols-12 gap-4">
        {/* Main Content Area */}
        <motion.div
          variants={listItem}
          className={`${showPreview ? 'col-span-12 md:col-span-5' : 'col-span-12'} flex flex-col gap-4 transition-all duration-300`}
        >
          <AnimatePresence mode="wait">
            {activeTab === 'create' ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <InvoiceForm
                  formData={formData}
                  isCreating={isCreating}
                  onFormChange={setFormData}
                  onSubmit={handleSubmit}
                />
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <InvoiceList invoices={invoices} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Documentary Preview */}
        {showPreview && (
          <motion.div variants={listItem} className="col-span-12 md:col-span-7">
            <InvoicePreview
              reference={formData.reference}
              amount={formData.amount}
              buyerCompany={formData.buyerCompany}
              buyerEmail={formData.buyerEmail}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
