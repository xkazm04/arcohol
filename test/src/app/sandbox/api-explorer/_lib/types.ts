export type HookName = 'useWallet' | 'useBalance' | 'useTransfer' | 'useTransactionHistory';

export interface HookInfo {
  name: HookName;
  description: string;
  details: string;
  useCase: string;
  returns: string[];
}

export interface LogEntry {
  id: number;
  msg: string;
  type: 'info' | 'success' | 'error';
  time: string;
}
