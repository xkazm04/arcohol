export interface ChainAllocation {
  chain: string;
  chainId: number;
  balance: string;
  percentage: number;
  color: string;
  icon: string;
  status: 'connected' | 'pending' | 'disconnected';
}

export interface BridgeTransaction {
  id: number;
  from: string;
  to: string;
  amount: string;
  status: 'completed' | 'pending';
  time: string;
  txHash: string;
}
