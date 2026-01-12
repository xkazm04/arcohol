import type { ChainAllocation, BridgeTransaction } from './types';

export const chainAllocations: ChainAllocation[] = [
  { chain: 'Arc', chainId: 1, balance: '125,000.00', percentage: 50, color: 'cyan', icon: 'A', status: 'connected' },
  { chain: 'Base', chainId: 8453, balance: '62,500.00', percentage: 25, color: 'blue', icon: 'B', status: 'connected' },
  { chain: 'Ethereum', chainId: 1, balance: '37,500.00', percentage: 15, color: 'purple', icon: 'E', status: 'connected' },
  { chain: 'Polygon', chainId: 137, balance: '25,000.00', percentage: 10, color: 'violet', icon: 'P', status: 'connected' },
];

export const recentBridges: BridgeTransaction[] = [
  { id: 1, from: 'Ethereum', to: 'Arc', amount: '10,000.00', status: 'completed', time: '5 min ago', txHash: '0x1234...abcd' },
  { id: 2, from: 'Base', to: 'Arc', amount: '5,000.00', status: 'completed', time: '2 hours ago', txHash: '0x5678...efgh' },
  { id: 3, from: 'Arc', to: 'Polygon', amount: '2,500.00', status: 'pending', time: '10 min ago', txHash: '0x9abc...ijkl' },
];

export function getChainColor(color: string): string {
  switch (color) {
    case 'cyan': return '#06b6d4';
    case 'blue': return '#3b82f6';
    case 'purple': return '#a855f7';
    case 'violet': return '#8b5cf6';
    default: return '#64748b';
  }
}
