'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface PortalSession {
  authenticated: boolean;
  organizationId: string | null;
  customerId: string | null;
  loading: boolean;
}

interface PortalAuthContextType extends PortalSession {
  login: (token: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const PortalAuthContext = createContext<PortalAuthContextType | null>(null);

export function PortalAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<PortalSession>({
    authenticated: false,
    organizationId: null,
    customerId: null,
    loading: true,
  });

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch('/api/portal/auth/verify', { method: 'POST' });
      const data = await response.json();

      if (data.authenticated) {
        setSession({
          authenticated: true,
          organizationId: data.organizationId,
          customerId: data.customerId,
          loading: false,
        });
      } else {
        setSession({
          authenticated: false,
          organizationId: null,
          customerId: null,
          loading: false,
        });
      }
    } catch {
      setSession({
        authenticated: false,
        organizationId: null,
        customerId: null,
        loading: false,
      });
    }
  }, []);

  const login = useCallback(async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/portal/auth/verify?token=${token}`);
      const data = await response.json();

      if (data.success) {
        setSession({
          authenticated: true,
          organizationId: data.organizationId,
          customerId: data.customerId,
          loading: false,
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/portal/auth/verify', { method: 'DELETE' });
    } finally {
      setSession({
        authenticated: false,
        organizationId: null,
        customerId: null,
        loading: false,
      });
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <PortalAuthContext.Provider
      value={{
        ...session,
        login,
        logout,
        checkSession,
      }}
    >
      {children}
    </PortalAuthContext.Provider>
  );
}

export function usePortalAuth() {
  const context = useContext(PortalAuthContext);
  if (!context) {
    throw new Error('usePortalAuth must be used within a PortalAuthProvider');
  }
  return context;
}
