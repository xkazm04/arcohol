export function TreasuryLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-slate-800 rounded-full" />
          <div className="absolute inset-0 border-4 border-green-500 rounded-full border-t-transparent animate-spin" />
          <div className="absolute inset-4 bg-slate-800 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-green-500">$</span>
          </div>
        </div>
        <div className="text-xs font-mono text-slate-500 animate-pulse">ACCESSING VAULT...</div>
      </div>
    </div>
  );
}
