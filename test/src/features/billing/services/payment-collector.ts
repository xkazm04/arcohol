import { ethers } from 'ethers';
import {
  getProvider,
  getSigner,
  ERC20_ABI,
  USDC_ADDRESSES,
  toUsdcUnits,
  waitForTransaction,
} from '@/lib/blockchain';
import type { PaymentResult, PaymentError, PaymentErrorCode, BillingJob } from '../types';

/**
 * Service for collecting payments via USDC transferFrom
 */
export class PaymentCollector {
  private readonly confirmations: number;
  private readonly timeout: number;

  constructor(options?: { confirmations?: number; timeout?: number }) {
    this.confirmations = options?.confirmations ?? 1;
    this.timeout = options?.timeout ?? 60000;
  }

  /**
   * Execute a transferFrom to collect payment from customer to merchant
   */
  async collectPayment(job: BillingJob): Promise<PaymentResult> {
    const { customerWallet, merchantWallet, amount, chain } = job;

    const usdcAddress = USDC_ADDRESSES[chain];
    if (!usdcAddress) {
      return this.createError('NETWORK_ERROR', `USDC address not configured for chain: ${chain}`);
    }

    try {
      const signer = getSigner(chain);
      const usdc = new ethers.Contract(usdcAddress, ERC20_ABI, signer);
      const amountUnits = toUsdcUnits(amount);

      // First, verify allowance is still sufficient
      const allowance: bigint = await usdc.allowance(customerWallet, merchantWallet);
      if (allowance < amountUnits) {
        return this.createError(
          'INSUFFICIENT_ALLOWANCE',
          `Allowance ${allowance.toString()} is less than required ${amountUnits.toString()}`
        );
      }

      // Verify balance
      const balance: bigint = await usdc.balanceOf(customerWallet);
      if (balance < amountUnits) {
        return this.createError(
          'INSUFFICIENT_BALANCE',
          `Balance ${balance.toString()} is less than required ${amountUnits.toString()}`
        );
      }

      // Execute transferFrom
      console.log(
        `Collecting payment: ${amount} USDC from ${customerWallet} to ${merchantWallet}`
      );

      const tx = await usdc.transferFrom(customerWallet, merchantWallet, amountUnits);
      console.log(`Transaction submitted: ${tx.hash}`);

      // Wait for confirmation
      const provider = getProvider(chain);
      const receipt = await waitForTransaction(
        provider,
        tx.hash,
        this.confirmations,
        this.timeout
      );

      if (!receipt) {
        return this.createError('TIMEOUT', `Transaction ${tx.hash} not confirmed within timeout`);
      }

      if (receipt.status === 0) {
        return this.createError('TRANSACTION_REVERTED', `Transaction ${tx.hash} reverted`);
      }

      console.log(`Payment collected: ${tx.hash} confirmed at block ${receipt.blockNumber}`);

      return {
        success: true,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        confirmedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Payment collection failed:', error);
      return this.handleError(error);
    }
  }

  /**
   * Estimate gas for a transferFrom transaction
   */
  async estimateGas(
    customerWallet: string,
    merchantWallet: string,
    amount: number,
    chain: string
  ): Promise<{ gasLimit: bigint; gasPrice: bigint; totalCost: bigint } | null> {
    try {
      const provider = getProvider(chain);
      const usdcAddress = USDC_ADDRESSES[chain];
      if (!usdcAddress) return null;

      const usdc = new ethers.Contract(usdcAddress, ERC20_ABI, provider);
      const amountUnits = toUsdcUnits(amount);

      const [gasLimit, feeData] = await Promise.all([
        usdc.transferFrom.estimateGas(customerWallet, merchantWallet, amountUnits),
        provider.getFeeData(),
      ]);

      const gasPrice = feeData.gasPrice || BigInt(0);
      const totalCost = gasLimit * gasPrice;

      return { gasLimit, gasPrice, totalCost };
    } catch {
      return null;
    }
  }

  /**
   * Dry run to check if payment would succeed
   */
  async dryRun(job: BillingJob): Promise<{ wouldSucceed: boolean; reason?: string }> {
    const { customerWallet, merchantWallet, amount, chain } = job;

    const usdcAddress = USDC_ADDRESSES[chain];
    if (!usdcAddress) {
      return { wouldSucceed: false, reason: `USDC address not configured for chain: ${chain}` };
    }

    try {
      const provider = getProvider(chain);
      const usdc = new ethers.Contract(usdcAddress, ERC20_ABI, provider);
      const amountUnits = toUsdcUnits(amount);

      const [allowance, balance] = await Promise.all([
        usdc.allowance(customerWallet, merchantWallet) as Promise<bigint>,
        usdc.balanceOf(customerWallet) as Promise<bigint>,
      ]);

      if (allowance < amountUnits) {
        return {
          wouldSucceed: false,
          reason: `Insufficient allowance: ${allowance.toString()} < ${amountUnits.toString()}`,
        };
      }

      if (balance < amountUnits) {
        return {
          wouldSucceed: false,
          reason: `Insufficient balance: ${balance.toString()} < ${amountUnits.toString()}`,
        };
      }

      return { wouldSucceed: true };
    } catch (error) {
      return {
        wouldSucceed: false,
        reason: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private createError(code: PaymentErrorCode, message: string): PaymentResult {
    return {
      success: false,
      error: { code, message },
    };
  }

  private handleError(error: unknown): PaymentResult {
    if (error instanceof Error) {
      // Check for specific error types
      if (error.message.includes('insufficient funds')) {
        return this.createError('INSUFFICIENT_BALANCE', error.message);
      }
      if (error.message.includes('allowance')) {
        return this.createError('INSUFFICIENT_ALLOWANCE', error.message);
      }
      if (error.message.includes('reverted')) {
        return this.createError('TRANSACTION_REVERTED', error.message);
      }
      if (error.message.includes('network') || error.message.includes('timeout')) {
        return this.createError('NETWORK_ERROR', error.message);
      }

      return this.createError('TRANSACTION_FAILED', error.message);
    }

    return this.createError('UNKNOWN', 'An unknown error occurred');
  }
}

// Export singleton instance
export const paymentCollector = new PaymentCollector();
