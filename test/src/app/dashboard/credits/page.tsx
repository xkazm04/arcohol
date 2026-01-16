'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreditsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/treasury');
  }, [router]);

  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-400">Redirecting to Treasury...</p>
      </div>
    </div>
  );
}
