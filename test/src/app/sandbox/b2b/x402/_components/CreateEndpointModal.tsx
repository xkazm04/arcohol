import type { PricingModel } from '../_lib';

interface CreateEndpointModalProps {
  onClose: () => void;
  selectedPricing: PricingModel;
  onPricingChange: (pricing: PricingModel) => void;
}

export function CreateEndpointModal({ onClose, selectedPricing, onPricingChange }: CreateEndpointModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 max-w-lg w-full mx-4">
        <h2 className="text-lg font-bold text-white mb-4">Add Monetized Endpoint</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Method</label>
              <select className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm">
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>DELETE</option>
              </select>
            </div>
            <div className="col-span-3">
              <label className="text-xs text-slate-400 mb-1 block">Path</label>
              <input type="text" placeholder="/api/v1/endpoint" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-2 block">Pricing Model</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onPricingChange('exact')}
                className={`p-3 rounded-lg border text-left transition-all ${selectedPricing === 'exact' ? 'bg-purple-500/10 border-purple-500/50' : 'bg-slate-800 border-slate-700'}`}
              >
                <div className="text-sm font-medium text-white">Exact Price</div>
                <div className="text-xs text-slate-500">Fixed per-request cost</div>
              </button>
              <button
                onClick={() => onPricingChange('dynamic')}
                className={`p-3 rounded-lg border text-left transition-all ${selectedPricing === 'dynamic' ? 'bg-purple-500/10 border-purple-500/50' : 'bg-slate-800 border-slate-700'}`}
              >
                <div className="text-sm font-medium text-white">Dynamic</div>
                <div className="text-xs text-slate-500">Usage-based formula</div>
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Price per Request</label>
            <div className="flex gap-2">
              <input type="number" placeholder="0.05" step="0.01" className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
              <select className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm">
                <option>USDC</option>
                <option>USDY</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg">Cancel</button>
          <button className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg">Create Endpoint</button>
        </div>
      </div>
    </div>
  );
}
