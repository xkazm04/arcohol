// =============================================================================
// @arcpay/react - Embedded Finance React SDK
// =============================================================================

// Provider
export { ArcPayProvider, useArcPay, useArcPayOptional, type ArcPayProviderProps } from './provider';

// Theme
export {
  // Provider
  ArcPayThemeProvider,
  useTheme,
  useThemedStyles,
  ThemeConsumer,
  type ArcPayThemeProviderProps,
  type ThemeConsumerProps,

  // Types
  type ArcPayTheme,
  type ThemeColors,
  type ThemeFonts,
  type ThemeFontSizes,
  type ThemeSpacing,
  type ThemeBorderRadius,
  type ThemeShadows,
  type ThemeTransitions,
  type ComponentOverrides,
  type ComponentOverride,
  type BrandConfig,
  type CheckoutConfig,
  type InvoiceConfig,
  type SubscriptionConfig,
  type SupportedChain,
  type SupportedCurrency,
  type Money,
  type PaymentStatus,
  type ArcPayProviderConfig,

  // Defaults & Presets
  lightTheme,
  darkTheme,
  minimalTheme,
  stripeTheme,
  coinbaseTheme,
  circleTheme,
  presets,
  createBrandTheme,
  getPresetTheme,
  createTheme,
  mergeTheme,
  type ThemePreset,
} from './theme';

// Primitive components
export {
  Button,
  type ButtonProps,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  type CardProps,
  type CardHeaderProps,
  type CardTitleProps,
  type CardDescriptionProps,
  Input,
  Textarea,
  type InputProps,
  type TextareaProps,
  Modal,
  type ModalProps,
  Select,
  type SelectProps,
  type SelectOption,
  Spinner,
  LoadingOverlay,
  type SpinnerProps,
  type LoadingOverlayProps,
  Badge,
  StatusBadge,
  type BadgeProps,
  type StatusBadgeProps,
  type StatusType,
} from './components/primitives';

// Payment components
export {
  Checkout,
  ChainSelector,
  ChainSelectorCompact,
  ChainIcon,
  CHAIN_INFO,
  CartSummary,
  PaymentSummary,
  PaymentAmount,
  type CartItem,
  type PaymentResult,
  type CheckoutError,
  type CheckoutProps,
  type CheckoutState,
  type ChainSelectorProps,
  type CartSummaryProps,
  type PaymentMethodSelectorProps,
  Invoice,
  InvoiceHeader,
  InvoiceBillTo,
  LineItems,
  InvoiceTotals,
  type InvoiceLineItem,
  type InvoiceCustomer,
  type InvoiceData,
  type InvoiceStatus,
  type InvoiceProps,
  type InvoiceHeaderProps,
  type InvoiceCustomerProps,
  type LineItemsProps,
  type InvoiceTotalsProps,
  // On-Ramp (Fiat to Crypto)
  FiatOnRamp,
  OnRampProviderCard,
  type OnRampProvider,
  type OnRampStatus,
  type FiatCurrency,
  type FiatPaymentMethod,
  type OnRampProviderConfig,
  type OnRampQuote,
  type OnRampTransaction,
  type OnRampError,
  type FiatOnRampProps,
  type OnRampProviderCardProps,
  type OnRampCheckoutProps,
  type BalanceCheckResult,
} from './components/payment';

// Subscription components
export {
  SubscriptionManager,
  PlanSelector,
  PlanCard,
  CurrentPlan,
  UsageDisplay,
  BillingHistory,
  type Plan,
  type Subscription,
  type SubscriptionStatus,
  type UsageData,
  type BillingRecord,
  type SubscriptionManagerProps,
  type PlanSelectorProps,
  type PlanCardProps,
  type CurrentPlanProps,
  type UsageDisplayProps,
  type BillingHistoryProps,
} from './components/subscription';

// Wallet components
export {
  Balance,
  TransactionHistory,
  type BalanceProps,
  type TransactionHistoryProps,
} from './components/wallet';

// Headless hooks
export {
  // Checkout
  useCheckout,
  type UseCheckoutOptions,
  type UseCheckoutReturn,

  // Invoice
  useInvoice,
  type UseInvoiceOptions,
  type UseInvoiceReturn,

  // Subscription
  useSubscription,
  type UseSubscriptionOptions,
  type UseSubscriptionReturn,

  // Payment Modal
  usePaymentModal,
  useQuickPay,
  type PaymentModalConfig,
  type UsePaymentModalReturn,
  type UseQuickPayOptions,
  type UseQuickPayReturn,

  // Balance
  useBalance,
  useChainBalance,
  type ChainBalance,
  type UseBalanceOptions,
  type UseBalanceReturn,

  // Transaction History
  useTransactionHistory,
  type Transaction,
  type TransactionFilter,
  type UseTransactionHistoryOptions,
  type UseTransactionHistoryReturn,

  // Wallet Connection
  useWalletConnection,
  type WalletConnectionState,
  type UseWalletConnectionOptions,
  type UseWalletConnectionReturn,

  // On-Ramp (Fiat to Crypto)
  useOnRamp,
  useBalanceCheck,
  PROVIDER_CONFIGS,
  type UseOnRampOptions,
  type UseOnRampReturn,
} from './hooks';
