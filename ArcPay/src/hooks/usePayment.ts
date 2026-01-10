import { useCallback, useMemo } from 'react';
import { useArcPay } from '../providers/ArcPayProvider';
import { useWallet } from './useWallet';
import { useTransfer } from './useTransfer';
import { PaymentProcessor } from '../core/PaymentProcessor';
import type {
  PaymentRequest,
  PaymentRequestParams,
  TransactionResult,
} from '../types';

export interface UsePaymentReturn {
  createPaymentRequest: (params: PaymentRequestParams) => PaymentRequest;
  payRequest: (request: PaymentRequest) => Promise<TransactionResult>;
  getPaymentQR: (request: PaymentRequest) => string;
  parsePaymentRequest: (data: string) => PaymentRequest | null;
}

export function usePayment(): UsePaymentReturn {
  const { circleClient, arcClient } = useArcPay();
  const { wallet } = useWallet();
  const { transfer } = useTransfer();

  const paymentProcessor = useMemo(() => {
    if (!wallet?.id) return null;
    return new PaymentProcessor({
      circleClient,
      arcClient,
      walletId: wallet.id,
    });
  }, [circleClient, arcClient, wallet?.id]);

  const createPaymentRequest = useCallback(
    (params: PaymentRequestParams): PaymentRequest => {
      if (!paymentProcessor) {
        const id = crypto.randomUUID();
        return {
          id,
          amount:
            typeof params.amount === 'number'
              ? params.amount.toFixed(2)
              : params.amount,
          recipient: params.recipient,
          description: params.description,
          expiresAt: params.expiresAt,
          metadata: params.metadata,
          status: 'pending',
          createdAt: new Date(),
        };
      }
      return paymentProcessor.createPaymentRequest(params);
    },
    [paymentProcessor]
  );

  const payRequest = useCallback(
    async (request: PaymentRequest): Promise<TransactionResult> => {
      return transfer({
        to: request.recipient,
        amount: request.amount,
        memo: request.description,
      });
    },
    [transfer]
  );

  const getPaymentQR = useCallback(
    (request: PaymentRequest): string => {
      if (!paymentProcessor) {
        const data = {
          type: 'arcpay',
          version: '1',
          id: request.id,
          amount: request.amount,
          recipient: request.recipient,
        };
        return `arcpay:${btoa(JSON.stringify(data))}`;
      }
      return paymentProcessor.generatePaymentQRData(request);
    },
    [paymentProcessor]
  );

  const parsePaymentRequest = useCallback(
    (data: string): PaymentRequest | null => {
      if (!paymentProcessor) {
        try {
          if (!data.startsWith('arcpay:')) return null;
          const payload = JSON.parse(atob(data.slice(7)));
          return {
            id: payload.id,
            amount: payload.amount,
            recipient: payload.recipient,
            description: payload.description,
            expiresAt: payload.expiresAt ? new Date(payload.expiresAt) : undefined,
            status: 'pending',
            createdAt: new Date(),
          };
        } catch {
          return null;
        }
      }
      return paymentProcessor.parsePaymentRequest(data);
    },
    [paymentProcessor]
  );

  return {
    createPaymentRequest,
    payRequest,
    getPaymentQR,
    parsePaymentRequest,
  };
}
