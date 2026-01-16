import { ethers } from 'ethers';
import {
  getProvider,
  ERC20_ABI,
  USDC_ADDRESSES,
  toUsdcUnits,
  fromUsdcUnits,
} from '@/lib/blockchain';
import type { AllowanceCheckResult } from '../types';

/**
 * Service for checking USDC allowances on-chain
 */
export class AllowanceChecker {
  /**
   * Check if a customer wallet has sufficient USDC allowance for the merchant
   */
  async checkAllowance(
    customerWallet: string,
    merchantWallet: string,
    amount: number,
    chain: string
  ): Promise<AllowanceCheckResult> {
    const provider = getProvider(chain);
    const usdcAddress = USDC_ADDRESSES[chain];

    if (!usdcAddress) {
      throw new Error(`USDC address not configured for chain: ${chain}`);
    }

    const usdc = new ethers.Contract(usdcAddress, ERC20_ABI, provider);
    const requiredAmount = toUsdcUnits(amount);

    try {
      // Get allowance
      const allowance: bigint = await usdc.allowance(customerWallet, merchantWallet);

      // Get balance (optional, for more detailed check)
      const balance: bigint = await usdc.balanceOf(customerWallet);

      const sufficient = allowance >= requiredAmount;
      const balanceSufficient = balance >= requiredAmount;

      return {
        wallet: customerWallet,
        spender: merchantWallet,
        allowance: allowance.toString(),
        requiredAmount: requiredAmount.toString(),
        sufficient,
        balance: balance.toString(),
        balanceSufficient,
      };
    } catch (error) {
      console.error('Allowance check failed:', error);
      throw new Error(
        `Failed to check allowance: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Batch check allowances for multiple subscriptions
   */
  async batchCheckAllowances(
    subscriptions: Array<{
      id: string;
      customerWallet: string;
      merchantWallet: string;
      amount: number;
      chain: string;
    }>
  ): Promise<Map<string, AllowanceCheckResult>> {
    const results = new Map<string, AllowanceCheckResult>();

    // Group by chain for efficiency
    const byChain = new Map<string, typeof subscriptions>();
    for (const sub of subscriptions) {
      const group = byChain.get(sub.chain) || [];
      group.push(sub);
      byChain.set(sub.chain, group);
    }

    // Process each chain group
    for (const [chain, subs] of byChain) {
      const provider = getProvider(chain);
      const usdcAddress = USDC_ADDRESSES[chain];

      if (!usdcAddress) {
        console.error(`USDC address not configured for chain: ${chain}`);
        continue;
      }

      const usdc = new ethers.Contract(usdcAddress, ERC20_ABI, provider);

      // Check each subscription in the chain group
      await Promise.all(
        subs.map(async (sub) => {
          try {
            const requiredAmount = toUsdcUnits(sub.amount);
            const [allowance, balance] = await Promise.all([
              usdc.allowance(sub.customerWallet, sub.merchantWallet) as Promise<bigint>,
              usdc.balanceOf(sub.customerWallet) as Promise<bigint>,
            ]);

            results.set(sub.id, {
              wallet: sub.customerWallet,
              spender: sub.merchantWallet,
              allowance: allowance.toString(),
              requiredAmount: requiredAmount.toString(),
              sufficient: allowance >= requiredAmount,
              balance: balance.toString(),
              balanceSufficient: balance >= requiredAmount,
            });
          } catch (error) {
            console.error(`Allowance check failed for subscription ${sub.id}:`, error);
            // Mark as insufficient on error
            results.set(sub.id, {
              wallet: sub.customerWallet,
              spender: sub.merchantWallet,
              allowance: '0',
              requiredAmount: toUsdcUnits(sub.amount).toString(),
              sufficient: false,
              balance: '0',
              balanceSufficient: false,
            });
          }
        })
      );
    }

    return results;
  }

  /**
   * Get human-readable allowance info
   */
  formatAllowanceResult(result: AllowanceCheckResult): string {
    const allowance = fromUsdcUnits(BigInt(result.allowance));
    const required = fromUsdcUnits(BigInt(result.requiredAmount));
    const balance = result.balance ? fromUsdcUnits(BigInt(result.balance)) : 'unknown';

    if (result.sufficient && result.balanceSufficient) {
      return `OK: Allowance $${allowance.toFixed(2)}, Balance $${balance}, Required $${required.toFixed(2)}`;
    }

    if (!result.sufficient) {
      return `INSUFFICIENT ALLOWANCE: $${allowance.toFixed(2)} < $${required.toFixed(2)} required`;
    }

    return `INSUFFICIENT BALANCE: $${balance} < $${required.toFixed(2)} required`;
  }
}

// Export singleton instance
export const allowanceChecker = new AllowanceChecker();
