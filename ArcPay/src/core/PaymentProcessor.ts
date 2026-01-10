import type { CircleClient } from './CircleClient';
import type { ArcClient } from './ArcClient';
import type {
  TransferParams,
  TransactionResult,
  PaymentRequest,
  PaymentRequestParams,
} from '../types';
import { validateRecipient, validateAmount } from '../utils/validation';
import { ArcPayError } from '../types/config';

export interface PaymentProcessorConfig {
  circleClient: CircleClient;
  arcClient: ArcClient;
  walletId: string;
}

export class PaymentProcessor {
  private circleClient: CircleClient;
  private arcClient: ArcClient;
  private walletId: string;

  constructor(config: PaymentProcessorConfig) {
    this.circleClient = config.circleClient;
    this.arcClient = config.arcClient;
    this.walletId = config.walletId;
  }

  async transfer(params: TransferParams): Promise<TransactionResult> {
    const recipient = params.recipient || params.to || '';
    const recipientValidation = validateRecipient(recipient);
    if (!recipientValidation.isValid) {
      throw new ArcPayError(
        recipientValidation.error || 'Invalid recipient',
        'INVALID_RECIPIENT'
      );
    }

    const balance = await this.circleClient.getUSDCBalance(this.walletId);
    const amountValidation = validateAmount(params.amount, { balance });
    if (!amountValidation.isValid) {
      throw new ArcPayError(
        amountValidation.error || 'Invalid amount',
        'INVALID_AMOUNT'
      );
    }

    try {
      const transaction = await this.circleClient.transfer(this.walletId, {
        ...params,
        to: recipientValidation.normalizedValue || params.to,
        amount: amountValidation.normalizedValue || String(params.amount),
      });

      return {
        transaction,
        hash: transaction.hash,
        success: true,
      };
    } catch (error) {
      throw new ArcPayError(
        error instanceof Error ? error.message : 'Transfer failed',
        'TRANSFER_FAILED',
        { originalError: error }
      );
    }
  }

  async estimateFee(_params: TransferParams): Promise<string> {
    // For Circle-managed wallets, fees are typically handled by Circle
    // Return a nominal fee estimate
    return '0.00';
  }

  createPaymentRequest(params: PaymentRequestParams): PaymentRequest {
    const id = crypto.randomUUID();
    const amount =
      typeof params.amount === 'number'
        ? params.amount.toFixed(2)
        : params.amount;

    const request: PaymentRequest = {
      id,
      amount,
      recipient: params.recipient,
      description: params.description,
      expiresAt: params.expiresAt,
      metadata: params.metadata,
      status: 'pending',
      createdAt: new Date(),
    };

    request.qrCode = this.generatePaymentQRData(request);

    return request;
  }

  generatePaymentQRData(request: PaymentRequest): string {
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
  }

  parsePaymentRequest(data: string): PaymentRequest | null {
    try {
      if (!data.startsWith('arcpay:')) {
        return null;
      }

      const payload = JSON.parse(atob(data.slice(7)));

      return {
        id: payload.id,
        amount: payload.amount,
        recipient: payload.recipient,
        description: payload.description,
        expiresAt: payload.expiresAt ? new Date(payload.expiresAt) : undefined,
        metadata: payload.metadata,
        status: 'pending',
        createdAt: new Date(),
      };
    } catch {
      return null;
    }
  }

  async payRequest(request: PaymentRequest): Promise<TransactionResult> {
    if (request.status !== 'pending') {
      throw new ArcPayError(
        'Payment request is no longer valid',
        'INVALID_REQUEST'
      );
    }

    if (request.expiresAt && new Date() > request.expiresAt) {
      throw new ArcPayError('Payment request has expired', 'REQUEST_EXPIRED');
    }

    return this.transfer({
      to: request.recipient,
      amount: request.amount,
      memo: request.description,
    });
  }
}
