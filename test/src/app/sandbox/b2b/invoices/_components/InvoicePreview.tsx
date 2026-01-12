interface InvoicePreviewProps {
  reference: string;
  amount: string;
  buyerCompany: string;
  buyerEmail: string;
}

export function InvoicePreview({ reference, amount, buyerCompany, buyerEmail }: InvoicePreviewProps) {
  return (
    <div className="hidden md:flex md:col-span-7 bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-800/60 flex-col overflow-hidden">
      <div className="bg-slate-900/60 border-b border-slate-800/60 px-4 py-3 flex justify-between items-center">
        <span className="text-xs font-mono text-slate-500 uppercase">Document Preview</span>
        <div className="flex gap-2">
          <button className="text-slate-400 hover:text-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg></button>
          <button className="text-slate-400 hover:text-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg></button>
        </div>
      </div>

      {/* Mock PDF Viewer */}
      <div className="flex-1 bg-slate-950 p-8 overflow-y-auto flex justify-center">
        <div className="w-full max-w-sm bg-white text-slate-900 shadow-2xl min-h-[500px] p-8 relative flex flex-col">
          {/* Invoice Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="text-2xl font-bold tracking-tight text-slate-900">INVOICE</div>
              <div className="text-xs text-slate-500 mt-1">#{reference}</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg text-slate-900">ArcPay Inc.</div>
              <div className="text-[10px] text-slate-500">123 Payment St<br />San Francisco, CA</div>
            </div>
          </div>

          {/* Bill To */}
          <div className="mb-8 p-4 bg-slate-50 rounded-lg">
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">Bill To</div>
            <div className="font-bold text-sm">{buyerCompany || 'Start typing...'}</div>
            <div className="text-xs text-slate-500">{buyerEmail}</div>
          </div>

          {/* Line Items */}
          <div className="mb-8">
            <div className="flex border-b border-slate-200 pb-2 mb-2 text-[10px] font-bold text-slate-400 uppercase">
              <span className="flex-1">Description</span>
              <span className="w-20 text-right">Amount</span>
            </div>
            <div className="flex text-sm py-2">
              <span className="flex-1 font-medium">Platform Services</span>
              <span className="w-20 text-right font-mono">${parseFloat(amount).toLocaleString()}</span>
            </div>
          </div>

          {/* Total */}
          <div className="mt-auto border-t-2 border-slate-900 pt-4">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-900">Total Due</span>
              <span className="font-bold text-2xl text-slate-900">${parseFloat(amount).toLocaleString()}</span>
            </div>
            <div className="mt-6 flex justify-center">
              <div className="bg-slate-900 text-white text-[10px] font-bold px-4 py-2 rounded-full">
                PAY WITH CRYPTO OR FIAT
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
