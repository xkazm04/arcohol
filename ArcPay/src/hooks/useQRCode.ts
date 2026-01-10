import { useMemo } from 'react';
import { useWallet } from './useWallet';
import type { PaymentRequest } from '../types';

export interface UseQRCodeReturn {
  walletQR: string | null;
  generatePaymentQR: (request: PaymentRequest) => string;
  generateAddressQR: (address: string, amount?: number) => string;
}

export function useQRCode(): UseQRCodeReturn {
  const { wallet } = useWallet();

  const walletQR = useMemo(() => {
    if (!wallet?.address) return null;
    return `ethereum:${wallet.address}`;
  }, [wallet?.address]);

  const generatePaymentQR = (request: PaymentRequest): string => {
    const data = {
      type: 'arcpay',
      version: '1',
      id: request.id,
      amount: request.amount,
      recipient: request.recipient,
      description: request.description,
      expiresAt: request.expiresAt?.toISOString(),
    };

    return `arcpay:${btoa(JSON.stringify(data))}`;
  };

  const generateAddressQR = (address: string, amount?: number): string => {
    let qr = `ethereum:${address}`;
    if (amount) {
      qr += `?value=${amount}`;
    }
    return qr;
  };

  return {
    walletQR,
    generatePaymentQR,
    generateAddressQR,
  };
}
