'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { usePortalAuth } from '@/features/portal/context/PortalAuthContext';
import { InvoiceCard } from '@/components/portal/InvoiceCard';

interface Invoice {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  dueDate?: string;
  issueDate: string;
  paidAt?: string;
}

interface PageProps {
  params: Promise<{ orgSlug: string }>;
}

export default function PortalPage({ params }: PageProps) {
  const { authenticated, loading, login, customerId, organizationId } = usePortalAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orgSlug, setOrgSlug] = useState<string>('');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Get org slug
  useEffect(() => {
    params.then(p => setOrgSlug(p.orgSlug));
  }, [params]);

  // Handle magic link token
  useEffect(() => {
    const token = searchParams.get('token');
    if (token && !authenticated && !loading) {
      login(token).then(success => {
        if (!success) {
          setAuthError('Invalid or expired link. Please request a new one.');
        } else {
          // Remove token from URL
          router.replace(`/portal/${orgSlug}`);
        }
      });
    }
  }, [searchParams, authenticated, loading, login, router, orgSlug]);

  // Fetch invoices when authenticated
  useEffect(() => {
    if (authenticated && customerId && organizationId && orgSlug) {
      setIsLoadingInvoices(true);
      fetch(`/api/portal/${orgSlug}/invoices`)
        .then(res => res.json())
        .then(data => {
          setInvoices(data.invoices || []);
        })
        .catch(console.error)
        .finally(() => setIsLoadingInvoices(false));
    }
  }, [authenticated, customerId, organizationId, orgSlug]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  // Auth error state
  if (authError) {
    return <AuthErrorView error={authError} orgSlug={orgSlug} />;
  }

  // Not authenticated - show login form
  if (!authenticated) {
    return <LoginView orgSlug={orgSlug} />;
  }

  // Authenticated - show invoices
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-white">Your Invoices</h1>
        <span className="text-xs text-slate-500">
          {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
        </span>
      </div>

      {isLoadingInvoices ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500">No invoices found.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {invoices.map((invoice, index) => (
            <motion.div
              key={invoice.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <InvoiceCard
                invoice={invoice}
                orgSlug={orgSlug}
              />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function LoginView({ orgSlug }: { orgSlug: string }) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/portal/auth/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, organizationSlug: orgSlug }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch {
      setError('Failed to send magic link');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto text-center py-12"
      >
        <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Check your email</h2>
        <p className="text-slate-400 text-sm">
          We've sent a magic link to <span className="text-white">{email}</span>.
          Click the link to sign in.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto py-12"
    >
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-white mb-2">Sign in to view your invoices</h2>
        <p className="text-slate-400 text-sm">
          Enter your email to receive a secure sign-in link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-xs text-slate-400 mb-1.5">
            Email address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20"
            placeholder="you@company.com"
          />
        </div>

        {error && (
          <p className="text-red-400 text-xs">{error}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {isSubmitting ? 'Sending...' : 'Send Magic Link'}
        </button>
      </form>
    </motion.div>
  );
}

function AuthErrorView({ error, orgSlug }: { error: string; orgSlug: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto text-center py-12"
    >
      <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">Link expired</h2>
      <p className="text-slate-400 text-sm mb-6">{error}</p>
      <a
        href={`/portal/${orgSlug}`}
        className="inline-block px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg transition-colors"
      >
        Request new link
      </a>
    </motion.div>
  );
}
