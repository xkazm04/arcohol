import { type Chain } from 'viem';
import { CHAIN_IDS, RPC_URLS, BLOCK_EXPLORERS } from '../utils/constants';

export const arc: Chain = {
  id: CHAIN_IDS.arc,
  name: 'Arc',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 6 },
  rpcUrls: {
    default: { http: [RPC_URLS.arc] },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: BLOCK_EXPLORERS.arc },
  },
};

export const arcTestnet: Chain = {
  id: CHAIN_IDS.arcTestnet,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 6 },
  rpcUrls: {
    default: { http: [RPC_URLS.arcTestnet] },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: BLOCK_EXPLORERS.arcTestnet },
  },
  testnet: true,
};

export const base: Chain = {
  id: CHAIN_IDS.base,
  name: 'Base',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: [RPC_URLS.base] },
  },
  blockExplorers: {
    default: { name: 'BaseScan', url: BLOCK_EXPLORERS.base },
  },
};

export const baseSepolia: Chain = {
  id: CHAIN_IDS.baseSepolia,
  name: 'Base Sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: [RPC_URLS.baseSepolia] },
  },
  blockExplorers: {
    default: { name: 'BaseScan', url: BLOCK_EXPLORERS.baseSepolia },
  },
  testnet: true,
};

export function getChain(network: string): Chain {
  switch (network) {
    case 'arc-mainnet':
      return arc;
    case 'arc-testnet':
      return arcTestnet;
    case 'base-mainnet':
      return base;
    case 'base-sepolia':
      return baseSepolia;
    default:
      return arcTestnet;
  }
}
