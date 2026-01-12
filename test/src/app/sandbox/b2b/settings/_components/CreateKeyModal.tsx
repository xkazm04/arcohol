interface CreateKeyModalProps {
  onClose: () => void;
}

export function CreateKeyModal({ onClose }: CreateKeyModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 max-w-md w-full mx-4">
        <h2 className="text-lg font-bold text-white mb-4">Create API Key</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Key Name</label>
            <input type="text" placeholder="e.g., Production Server" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-2 block">Permissions</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded bg-slate-800 border-slate-700" />
                <span className="text-sm text-slate-300">Read</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded bg-slate-800 border-slate-700" />
                <span className="text-sm text-slate-300">Write</span>
              </label>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg">Cancel</button>
          <button className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm rounded-lg">Create Key</button>
        </div>
      </div>
    </div>
  );
}
