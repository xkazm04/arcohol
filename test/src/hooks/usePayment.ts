'use client';

import { useModeStore } from '@/store/modeStore';
import { useWallet as useMockWallet, useBalance as useMockBalance, useTransfer as useMockTransfer, useTransactionHistory as useMockHistory } from '@/mocks/MockArcPayProvider';
import { useTestnetWallet, useTestnetBalance, useTestnetTransfer, useTestnetTransactionHistory } from '@/providers/TestnetWalletProvider';

// Unified wallet hook
export function usePaymentWallet() {
  const mode = useModeStore((state) => state.mode);

  // We need to call both hooks unconditionally (React rules)
  // but we'll only use the appropriate one based on mode
  const mockWallet = useMockWallet();

  let testnetWallet;
  try {
    testnetWallet = useTestnetWallet();
  } catch {
    testnetWallet = null;
  }

  if (mode === 'testnet' && testnetWallet) {
    return testnetWallet;
  }

  return mockWallet;
}

// Unified balance hook
export function usePaymentBalance() {
  const mode = useModeStore((state) => state.mode);

  const mockBalance = useMockBalance();

  let testnetBalance;
  try {
    testnetBalance = useTestnetBalance();
  } catch {
    testnetBalance = null;
  }

  if (mode === 'testnet' && testnetBalance) {
    return testnetBalance;
  }

  return mockBalance;
}

// Unified transfer hook
export function usePaymentTransfer() {
  const mode = useModeStore((state) => state.mode);

  const mockTransfer = useMockTransfer();

  let testnetTransfer;
  try {
    testnetTransfer = useTestnetTransfer();
  } catch {
    testnetTransfer = null;
  }

  if (mode === 'testnet' && testnetTransfer) {
    return testnetTransfer;
  }

  return mockTransfer;
}

// Unified transaction history hook
export function usePaymentHistory() {
  const mode = useModeStore((state) => state.mode);

  const mockHistory = useMockHistory();

  let testnetHistory;
  try {
    testnetHistory = useTestnetTransactionHistory();
  } catch {
    testnetHistory = null;
  }

  if (mode === 'testnet' && testnetHistory) {
    return testnetHistory;
  }

  return mockHistory;
}
