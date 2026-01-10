import { createPublicClient, http, type PublicClient, type Address } from 'viem';
import { arc, arcTestnet, getChain } from './chains';
import { ERC20_ABI, USDC_ADDRESSES } from '../utils/constants';
import type { TransactionReceipt } from '../types';

export interface ArcClientConfig {
  network?: 'mainnet' | 'testnet' | string;
  rpcUrl?: string;
}

export class ArcClient {
  private publicClient: PublicClient;
  private network: string;
  private usdcAddress: Address;

  constructor(config: ArcClientConfig = {}) {
    this.network = config.network || 'testnet';
    const chain = getChain(
      this.network === 'mainnet' ? 'arc-mainnet' : 'arc-testnet'
    );

    this.publicClient = createPublicClient({
      chain,
      transport: http(config.rpcUrl),
    });

    this.usdcAddress =
      this.network === 'mainnet'
        ? USDC_ADDRESSES.arc
        : USDC_ADDRESSES.arcTestnet;
  }

  async getUSDCBalance(address: string): Promise<bigint> {
    return this.publicClient.readContract({
      address: this.usdcAddress,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [address as Address],
    }) as Promise<bigint>;
  }

  async waitForTransaction(hash: string): Promise<TransactionReceipt> {
    const receipt = await this.publicClient.waitForTransactionReceipt({
      hash: hash as `0x${string}`,
    });

    return {
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      blockHash: receipt.blockHash,
      status: receipt.status,
      gasUsed: receipt.gasUsed,
    };
  }

  async getBlockNumber(): Promise<bigint> {
    return this.publicClient.getBlockNumber();
  }

  getExplorerUrl(hash: string): string {
    const baseUrl =
      this.network === 'mainnet'
        ? 'https://arcscan.app'
        : 'https://testnet.arcscan.app';
    return `${baseUrl}/tx/${hash}`;
  }

  getAddressExplorerUrl(address: string): string {
    const baseUrl =
      this.network === 'mainnet'
        ? 'https://arcscan.app'
        : 'https://testnet.arcscan.app';
    return `${baseUrl}/address/${address}`;
  }
}
