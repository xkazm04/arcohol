export interface PaymentRequest {
  id: string;
  amount: string;
  recipient: string;
  description?: string;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
  status: 'pending' | 'completed' | 'expired' | 'cancelled';
  createdAt: Date;
  qrCode?: string;
}

export interface PaymentRequestParams {
  amount: string | number;
  recipient: string;
  description?: string;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface OnrampOptions {
  amount?: number;
  currency?: string;
  provider?: 'coinbase' | 'transak';
}

export interface OnrampResult {
  success: boolean;
  transactionId?: string;
  amount: number;
  currency: string;
  provider: string;
  transactionHash?: string;
  status?: 'completed' | 'pending' | 'failed';
  walletAddress?: string;
}

export interface OfframpOptions {
  amount?: number;
  currency?: string;
  cryptoCurrency?: string;
  bankAccount?: string;
}

export interface OfframpResult {
  success: boolean;
  transactionId?: string;
  amount: number;
  currency: string;
  provider: string;
  transactionHash?: string;
  cryptoAmount?: number;
  cryptoCurrency?: string;
  status?: 'completed' | 'pending' | 'failed';
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  normalizedValue?: string;
}
