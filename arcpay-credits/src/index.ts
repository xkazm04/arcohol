// =====================================================
// @arcpay/credits - Credit-Based API Monetization
// =====================================================

// Types
export type {
  // Core types
  CreditTransactionType,
  CreditAccount,
  CreditEndpoint,
  CreditTransaction,
  UsageLog,

  // Configuration
  CreditsDatabaseAdapter,
  ApiKeyWithCredits,

  // Parameters
  CreateAccountParams,
  UpdateAccountParams,
  CreateEndpointParams,
  UpdateEndpointParams,
  DeductCreditsParams,
  DeductCreditsResult,
  AddCreditsParams,
  AddCreditsResult,
  RefundCreditsParams,
  ListTransactionsParams,
  LogUsageParams,
  UsageStatsParams,
  UsageStats,

  // Middleware types
  CreditsMiddlewareConfig,
  CreditsRequest,
  CreditPaymentInfo,
  DeductionInfo,
  InsufficientCreditsInfo,
} from './types';

// Error classes
export {
  CreditsError,
  InsufficientCreditsError,
  AccountNotFoundError,
  AccountSuspendedError,
  InvalidApiKeyError,
  EndpointNotConfiguredError,
} from './types';

// Client
export { SupabaseCreditsClient, createCreditsClient } from './client';
export type { SupabaseCreditsClientConfig } from './client';

// Middleware
export {
  creditsMiddleware,
  expressCreditsMiddleware,
  setCustomerId,
} from './middleware/express';

export {
  withCredits,
  nextjsCreditsMiddleware,
  dynamicPrice,
} from './middleware/nextjs';
export type { CreditsContext, CreditsHandler } from './middleware/nextjs';
