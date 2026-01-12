'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PaymentMode = 'mock' | 'testnet';

interface ModeStore {
  mode: PaymentMode;
  setMode: (mode: PaymentMode) => void;
  toggleMode: () => void;
}

export const useModeStore = create<ModeStore>()(
  persist(
    (set) => ({
      mode: 'mock',
      setMode: (mode) => set({ mode }),
      toggleMode: () => set((state) => ({ mode: state.mode === 'mock' ? 'testnet' : 'mock' })),
    }),
    {
      name: 'arcpay-mode',
    }
  )
);
