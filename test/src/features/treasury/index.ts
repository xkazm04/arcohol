/**
 * Treasury Feature Module
 *
 * Provides treasury management functionality including:
 * - Treasury stats and balances
 * - Treasury Agent for automated USDC/USDY staking
 * - Scheduled unstakes
 */

// Types
export type {
  ChainEnvironment,
  ChainConfig,
  TreasuryStats,
  TreasuryAgentConfig,
  AgentActionType,
  AgentTriggerType,
  AgentActionStatus,
  TreasuryAgentAction,
  ScheduledUnstake,
  UpdateAgentConfigParams,
  CreateScheduledUnstakeParams,
  TriggerActionParams,
  ActivityLogItem,
  YieldDataPoint,
  TreasuryActivityItem,
} from './types';

// Hooks
export { useTreasuryStats } from './hooks/useTreasuryStats';
export { useTreasuryAgent } from './hooks/useTreasuryAgent';
export { useScheduledUnstakes } from './hooks/useScheduledUnstakes';

// Chain configurations
export const CHAIN_CONFIGS = {
  'arc-testnet': {
    id: 'arc-testnet' as const,
    name: 'Arc Testnet',
    chainId: 1244,
    rpcUrl: 'https://rpc.testnet.arc.network',
    blockExplorer: 'https://testnet.arcscan.app',
    contracts: {
      usdc: '0x...', // TODO: Add real addresses
      usdy: '0x...',
      swapRouter: '0x...',
    },
  },
  'arc-mainnet': {
    id: 'arc-mainnet' as const,
    name: 'Arc Mainnet',
    chainId: 1243,
    rpcUrl: 'https://rpc.arc.network',
    blockExplorer: 'https://arcscan.app',
    contracts: {
      usdc: '0x...',
      usdy: '0x...',
      swapRouter: '0x...',
    },
  },
} as const;
