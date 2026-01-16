'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { usePortalAuth } from '@/features/portal/context/PortalAuthContext';

interface Organization {
  name: string;
  slug: string;
  brandColor?: string;
}

interface PortalLayoutProps {
  children: React.ReactNode;
  organizationSlug: string;
}

export function PortalLayout({ children, organizationSlug }: PortalLayoutProps) {
  const { authenticated, logout } = usePortalAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);

  useEffect(() => {
    // Fetch organization details
    fetch(`/api/portal/${organizationSlug}/info`)
      .then((res) => res.json())
      .then((data) => {
        if (data.organization) {
          setOrganization(data.organization);
        }
      })
      .catch(console.error);
  }, [organizationSlug]);

  const brandColor = organization?.brandColor || '#0891b2';

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo / Org Name */}
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: brandColor }}
              >
                {organization?.name?.charAt(0) || 'A'}
              </div>
              <div>
                <span className="text-sm font-medium text-white">
                  {organization?.name || 'Loading...'}
                </span>
                <span className="text-xs text-slate-500 ml-2">Portal</span>
              </div>
            </div>

            {/* Nav / Actions */}
            {authenticated && (
              <div className="flex items-center gap-4">
                <nav className="flex items-center gap-1">
                  <NavLink href={`/portal/${organizationSlug}`} brandColor={brandColor}>
                    Invoices
                  </NavLink>
                  <NavLink href={`/portal/${organizationSlug}/subscriptions`} brandColor={brandColor}>
                    Subscriptions
                  </NavLink>
                </nav>
                <button
                  onClick={logout}
                  className="text-xs text-slate-500 hover:text-white transition-colors px-3 py-1.5"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-auto py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Powered by ArcPay</span>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-slate-400 transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-slate-400 transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavLink({
  href,
  children,
  brandColor,
}: {
  href: string;
  children: React.ReactNode;
  brandColor: string;
}) {
  // Simple client-side check for active state
  const isActive = typeof window !== 'undefined' && window.location.pathname === href;

  return (
    <motion.a
      href={href}
      className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
        isActive ? 'text-white' : 'text-slate-400 hover:text-white'
      }`}
      style={isActive ? { backgroundColor: `${brandColor}20` } : undefined}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.a>
  );
}
