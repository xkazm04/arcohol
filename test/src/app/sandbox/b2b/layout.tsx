'use client';

import { MockB2BProvider } from '@/mocks/MockB2BProvider';

export default function B2BLayout({ children }: { children: React.ReactNode }) {
  return (
    <MockB2BProvider>
      {children}
    </MockB2BProvider>
  );
}
