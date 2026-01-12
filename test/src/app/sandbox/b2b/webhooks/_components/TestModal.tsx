import { mockEndpoints } from '../_lib';

type TestResult = 'idle' | 'testing' | 'success' | 'failed';

interface TestModalProps {
  onClose: () => void;
  testResult: TestResult;
  onTest: () => void;
}

export function TestModal({ onClose, testResult, onTest }: TestModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 max-w-md w-full mx-4">
        <h2 className="text-lg font-bold text-white mb-4">Test Webhook</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Select Endpoint</label>
            <select className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm">
              {mockEndpoints.map(ep => <option key={ep.id} value={ep.id}>{ep.url}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Event Type</label>
            <select className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm">
              <option>invoice.paid</option>
              <option>credits.deposited</option>
              <option>dispute.created</option>
            </select>
          </div>
          {testResult !== 'idle' && (
            <div className={`p-3 rounded-lg border ${
              testResult === 'testing' ? 'bg-amber-500/10 border-amber-500/20' :
              testResult === 'success' ? 'bg-green-500/10 border-green-500/20' :
              'bg-red-500/10 border-red-500/20'
            }`}>
              <div className="flex items-center gap-2">
                {testResult === 'testing' && <div className="w-4 h-4 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />}
                {testResult === 'success' && <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                <span className={`text-sm ${testResult === 'testing' ? 'text-amber-400' : testResult === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {testResult === 'testing' ? 'Sending test event...' : testResult === 'success' ? 'Webhook delivered successfully (200 OK)' : 'Delivery failed'}
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg">Close</button>
          <button onClick={onTest} disabled={testResult === 'testing'} className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm rounded-lg disabled:opacity-50">Send Test</button>
        </div>
      </div>
    </div>
  );
}
