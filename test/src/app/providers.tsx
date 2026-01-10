'use client';

import React from 'react';
import { MockArcPayProvider } from '@/mocks/MockArcPayProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MockArcPayProvider initialBalance="1250.00">
      {children}
    </MockArcPayProvider>
  );
}
