// =============================================================================
// @arcpay/crosschain - Cross-Chain Treasury Router
// =============================================================================

// Types
export type {
  SupportedChain,
  SupportedCurrency,
  RoutingStrategy,
  ChainConfig,
  ChainBalance,
  Money,
  MultiChainTreasuryConfig,
  RoutingConfig,
  RebalancingConfig,
  AlertConfig,
  TreasuryOverview,
  AllocationComparison,
  CrossChainPaymentRequest,
  RouteOption,
  SelectedRoute,
  RouteStep,
  CrossChainPayment,
  RebalancePlan,
  RebalanceMove,
  RebalanceResult,
  BridgeProvider,
  BridgeQuoteParams,
  BridgeQuote,
  BridgeExecution,
  BridgeStatus,
  TreasuryCallbacks,
  TreasuryAlert,
} from './types';

// Treasury
export { MultiChainTreasury, TreasuryError } from './treasury';

// Router
export { PaymentRouter, RouterError } from './router';

// Bridges
export { CCTPBridgeProvider, BridgeAggregator } from './bridges';

// Utils
export {
  CHAIN_METADATA,
  USDC_ADDRESSES,
  CCTP_TOKEN_MESSENGER,
  formatMoney,
  sumMoney,
  getExplorerTxUrl,
  getExplorerAddressUrl,
  truncateAddress,
  estimateBridgeTime,
  isChainSupported,
} from './utils';
