import type {
  X402PaymentRequirement,
  X402PaymentSignature,
  X402PaymentVerification,
  X402FacilitatorConfig,
} from '../types';

/**
 * Facilitator client for verifying and settling x402 payments
 */
export class X402Facilitator {
  private readonly url: string;
  private readonly apiKey?: string;
  private readonly headers: Record<string, string>;

  constructor(config: X402FacilitatorConfig | string) {
    if (typeof config === 'string') {
      this.url = config;
      this.headers = {};
    } else {
      this.url = config.url;
      this.apiKey = config.apiKey;
      this.headers = config.headers || {};
    }
  }

  /**
   * Verify a payment signature with the facilitator
   */
  async verifyPayment(
    signature: X402PaymentSignature,
    requirement: X402PaymentRequirement
  ): Promise<X402PaymentVerification> {
    const response = await fetch(`${this.url}/v1/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
        ...this.headers,
      },
      body: JSON.stringify({
        signature,
        requirement,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Facilitator verification failed: ${error}`);
    }

    return response.json();
  }

  /**
   * Settle a verified payment (transfer funds to recipient)
   */
  async settlePayment(paymentId: string): Promise<{ txHash: string; settled: boolean }> {
    const response = await fetch(`${this.url}/v1/settle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
        ...this.headers,
      },
      body: JSON.stringify({ paymentId }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Facilitator settlement failed: ${error}`);
    }

    return response.json();
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<{
    status: 'pending' | 'verified' | 'settled' | 'expired' | 'failed';
    verification?: X402PaymentVerification;
    txHash?: string;
  }> {
    const response = await fetch(`${this.url}/v1/payments/${paymentId}`, {
      headers: {
        ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
        ...this.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get payment status`);
    }

    return response.json();
  }
}

/**
 * Create facilitator instance from config
 */
export function createFacilitator(config: X402FacilitatorConfig | string): X402Facilitator {
  return new X402Facilitator(config);
}
