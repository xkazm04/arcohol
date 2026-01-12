// =============================================================================
// @arcpay/x402 - x402 API Monetization SDK
// =============================================================================

// Types
export type {
  X402Currency,
  X402Chain,
  X402Price,
  X402PriceFunction,
  X402PaymentRequirement,
  X402PaymentSignature,
  X402PaymentVerification,
  X402FacilitatorConfig,
  X402MiddlewareConfig,
  X402ClientConfig,
  X402Wallet,
  X402BudgetConfig,
  X402AutoApproveConfig,
  X402BudgetWarning,
  X402PaymentInfo,
  UseX402FetchConfig,
  UseX402FetchReturn,
} from './types';

export { X402_HEADERS } from './types';

// Utils
export {
  generatePaymentId,
  parsePaymentRequirement,
  encodePaymentRequirement,
  parsePaymentSignature,
  encodePaymentSignature,
  parsePriceToSmallestUnit,
  formatPriceFromSmallestUnit,
  getCurrencyDecimals,
  validatePrice,
  getChainId,
  getUSDCAddress,
  isEVMChain,
  createExpiration,
  isExpired,
  validateSignatureMatchesRequirement,
} from './utils';

// Middleware
export {
  x402Middleware,
  expressMiddleware,
  withX402,
  nextjsMiddleware,
  dynamicPrice,
  X402Facilitator,
  createFacilitator,
} from './middleware';

export type { X402PaymentInfo as MiddlewarePaymentInfo, X402NextConfig } from './middleware';

// Client
export {
  X402Client,
  X402Error,
  X402PaymentRequiredError,
  X402BudgetError,
  createAgentWallet,
} from './client';
