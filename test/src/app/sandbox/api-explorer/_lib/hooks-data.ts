import type { HookInfo } from './types';

export const hooks: HookInfo[] = [
  {
    name: 'useWallet',
    description: 'Manage wallet connection',
    details: 'Core hook for wallet lifecycle management. Handles connection prompts, network switching, and session persistence across page reloads.',
    useCase: 'Any dApp requiring wallet connection - the foundation hook for all authenticated operations',
    returns: ['wallet', 'address', 'isConnected', 'connect()', 'disconnect()']
  },
  {
    name: 'useBalance',
    description: 'Fetch USDC balance',
    details: 'Real-time balance tracking with automatic refresh on transactions. Returns formatted and raw values for flexible display.',
    useCase: 'Account dashboards, checkout flows, and balance validation before transfers',
    returns: ['balance', 'balanceRaw', 'isLoading', 'refetch()']
  },
  {
    name: 'useTransfer',
    description: 'Execute transfers',
    details: 'Send tokens with built-in gas estimation and transaction tracking. Handles pending states and provides transaction receipts.',
    useCase: 'Payment forms, peer-to-peer transfers, and automated disbursements',
    returns: ['isTransferring', 'lastTransaction', 'transfer()']
  },
  {
    name: 'useTransactionHistory',
    description: 'Transaction history',
    details: 'Paginated transaction history with filtering by type and status. Supports infinite scroll loading patterns.',
    useCase: 'Activity feeds, transaction logs, and reconciliation interfaces',
    returns: ['transactions', 'isLoading', 'loadMore()']
  },
];
