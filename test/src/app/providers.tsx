'use client';

import React from 'react';
import { MockArcPayProvider } from '@/mocks/MockArcPayProvider';
import { TestnetWalletProvider } from '@/providers/TestnetWalletProvider';
import { useModeStore } from '@/store/modeStore';

function ModeAwareProviders({ children }: { children: React.ReactNode }) {
  const mode = useModeStore((state) => state.mode);

  if (mode === 'testnet') {
    return <TestnetWalletProvider>{children}</TestnetWalletProvider>;
  }

  return (
    <MockArcPayProvider initialBalance="1250.00">
      {children}
    </MockArcPayProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return <ModeAwareProviders>{children}</ModeAwareProviders>;
}
