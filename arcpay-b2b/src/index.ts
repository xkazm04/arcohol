/**
 * @arcpay/b2b - ArcPay B2B SDK
 *
 * Payment infrastructure for business-to-business transactions.
 * Includes credit accounts, usage metering, dispute resolution,
 * merchant gateway, and treasury management.
 *
 * @example
 * ```typescript
 * import { ArcPayB2B } from '@arcpay/b2b';
 *
 * const arcpay = new ArcPayB2B({
 *   secretKey: process.env.ARCPAY_SECRET_KEY!,
 * });
 *
 * // Create a credit account
 * const account = await arcpay.credits.createAccount({
 *   organizationId: 'org_xxx',
 *   name: 'Main Account',
 * });
 *
 * // Record usage
 * await arcpay.credits.recordUsage(account.id, {
 *   meter: 'api_call',
 *   count: 100,
 * });
 *
 * // Create an invoice
 * const invoice = await arcpay.gateway.createInvoice({
 *   amount: 10000,
 *   reference: 'INV-001',
 *   buyer: { email: 'buyer@example.com' },
 *   lineItems: [{ description: 'Annual License', quantity: 1, unitPrice: 10000 }],
 *   dueDate: new Date('2024-02-01'),
 * });
 * ```
 */

// ==========================================================================
// Main Client
// ==========================================================================

export { ArcPayB2B, ArcPayB2B as default } from './client';

// ==========================================================================
// Resources
// ==========================================================================

export {
  CreditsResource,
  UsageMeter,
  DisputesResource,
  DisputeProtection,
  GatewayResource,
  MerchantGateway,
  TreasuryResource,
  Treasury,
  WebhooksResource,
  X402Resource,
  X402Gateway,
  SUPPORTED_NETWORKS,
} from './resources';

// ==========================================================================
// Types - Common
// ==========================================================================

export type {
  ArcPayB2BConfig,
  PaginationParams,
  PaginatedList,
  ApiResponse,
  ApiError,
  Currency,
  Money,
  PaymentStatus,
  SettlementStatus,
  Metadata,
  Identifiable,
  Timestamped,
  BlockchainAddress,
  Chain,
  Organization,
} from './types';

// ==========================================================================
// Types - Credits
// ==========================================================================

export type {
  CreditAccount,
  CreditAccountStatus,
  CreditAccountSettings,
  AutoTopUpConfig,
  CreateCreditAccountParams,
  UpdateCreditAccountParams,
  DepositParams,
  DepositMethod,
  Deposit,
  DepositStatus,
  ListCreditAccountsParams,
  RateCard,
  Rate,
  RateTier,
  UsageRecord,
  RecordUsageParams,
  UsageSummary,
  UsageSummaryItem,
  ListUsageParams,
  BalanceSnapshot,
  TransferToYieldParams,
  TransferFromYieldParams,
  CreditEventType,
  CreditEvent,
} from './types';

// ==========================================================================
// Types - Disputes
// ==========================================================================

export type {
  Dispute,
  DisputeCategory,
  DisputeStatus,
  DesiredResolution,
  Evidence,
  EvidenceType,
  MerchantResponse,
  AIEvaluation,
  EvaluationFactors,
  PartyHistoryAnalysis,
  EvidenceQualityAnalysis,
  TransactionAnalysis,
  DisputeResolution,
  CreateDisputeParams,
  CreateEvidenceParams,
  RespondToDisputeParams,
  ListDisputesParams,
  DisputeProtectionSettings,
  UpdateDisputeProtectionParams,
  DeliveryProof,
  DeliveryType,
  DeliveryProofDetails,
  RegisterDeliveryParams,
  DisputeEventType,
  DisputeEvent,
} from './types';

// ==========================================================================
// Types - Gateway
// ==========================================================================

export type {
  Invoice,
  InvoiceStatus,
  BuyerInfo,
  LineItem,
  PaymentDetails,
  SettlementDetails,
  CreateInvoiceParams,
  CreateLineItemParams,
  UpdateInvoiceParams,
  ListInvoicesParams,
  MerchantSettings,
  SettlementConfig,
  MerchantBranding,
  UpdateMerchantSettingsParams,
  BatchPayment,
  BatchStatus,
  BatchPaymentItem,
  CreateBatchPaymentParams,
  CreateBatchPaymentItemParams,
  ListBatchPaymentsParams,
  GatewayEventType,
  GatewayEvent,
} from './types';

// ==========================================================================
// Types - Treasury
// ==========================================================================

export type {
  TreasuryAccount,
  TreasuryStatus,
  TreasuryFund,
  TreasuryVault,
  TreasuryStrategy,
  OperatingStrategy,
  ReserveStrategy,
  VaultStrategy,
  RebalanceFrequency,
  CreateTreasuryParams,
  UpdateTreasuryParams,
  TreasuryOverview,
  FundOverview,
  VaultOverview,
  TreasuryTransaction,
  TreasuryTransactionType,
  TreasuryFundType,
  TreasuryTransactionStatus,
  TreasuryPaymentParams,
  TreasuryPaymentResult,
  PaymentSourceBreakdown,
  ConversionDetails,
  RebalanceRequest,
  RebalanceResult,
  RebalanceSchedule,
  TreasuryAlert,
  TreasuryAlertType,
  AlertSeverity,
  ListTreasuryTransactionsParams,
  TreasuryEventType,
  TreasuryEvent,
} from './types';

// ==========================================================================
// Types - Webhooks
// ==========================================================================

export type {
  WebhookEventType,
  WebhookEvent,
  WebhookEndpoint,
  WebhookEndpointStatus,
  CreateWebhookEndpointParams,
  UpdateWebhookEndpointParams,
  WebhookDelivery,
  WebhookDeliveryStatus,
  WebhookSignatureHeader,
  VerifyWebhookParams,
  WebhookHandler,
  WebhookHandlers,
} from './types';

// ==========================================================================
// Types - x402 Gateway
// ==========================================================================

export type {
  GatewayBalance,
  CombinedBalances,
  SupportedNetwork,
  PaymentRequirements,
  PaymentPayload,
  VerifyResult,
  SettleResult,
  CrossChainWithdrawParams,
  CrossChainWithdrawResult,
  GatewaySellerConfig,
  UpsertSellerConfigParams,
  GatewayPayment,
  ListGatewayPaymentsParams,
  X402EventType,
  X402Event,
} from './types';

// ==========================================================================
// Errors
// ==========================================================================

export {
  ArcPayB2BError,
  AuthenticationError,
  InvalidRequestError,
  NotFoundError,
  RateLimitError,
  NetworkError,
  TimeoutError,
  WebhookSignatureError,
  InsufficientCreditsError,
  DisputeError,
  TreasuryError,
  SettlementError,
} from './utils/errors';

// ==========================================================================
// Utilities
// ==========================================================================

export {
  verifySignature,
  generateSignatureHeader,
  generateWebhookSecret,
} from './utils/crypto';

export {
  validateSecretKey,
  validatePublicKey,
} from './utils/validation';
