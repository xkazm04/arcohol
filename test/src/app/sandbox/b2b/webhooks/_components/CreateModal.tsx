import { availableEvents } from '../_lib';

interface CreateModalProps {
  onClose: () => void;
  selectedEvents: string[];
  onToggleEvent: (event: string) => void;
}

export function CreateModal({ onClose, selectedEvents, onToggleEvent }: CreateModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-white mb-4">Add Webhook Endpoint</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Endpoint URL</label>
            <input type="url" placeholder="https://your-server.com/webhooks" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-2 block">Events to Subscribe</label>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {availableEvents.map((category) => (
                <div key={category.category}>
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">{category.category}</div>
                  <div className="flex flex-wrap gap-2">
                    {category.events.map((event) => (
                      <button
                        key={event}
                        onClick={() => onToggleEvent(event)}
                        className={`px-2 py-1 text-xs rounded border transition-all ${
                          selectedEvents.includes(event)
                            ? 'bg-amber-500/10 border-amber-500/50 text-amber-400'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {event}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg">Cancel</button>
          <button className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm rounded-lg">Create Endpoint</button>
        </div>
      </div>
    </div>
  );
}
