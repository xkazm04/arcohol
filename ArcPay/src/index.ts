// Providers
export { ArcPayProvider, useArcPay } from './providers';
export { ThemeProvider, useTheme, useThemeToken } from './providers';
export type { ThemeProviderProps } from './providers';

// Hooks
export {
  useWallet,
  useBalance,
  useTransfer,
  useOnramp,
  useOfframp,
  usePayment,
  useTransactionHistory,
  useContacts,
  useExchangeRate,
  useQRCode,
  useSubscription,
  useSubscriptionPlans,
  useHealthCheck,
} from './hooks';

// Health check types
export type {
  UseHealthCheckReturn,
  HealthCheckReport,
  CheckResult,
} from './hooks';

// Headless Components
export {
  useWalletButtonHeadless,
  usePayButtonHeadless,
  useWalletWidgetHeadless,
} from './headless';

export type {
  // Headless types
  HeadlessBaseProps,
  SlotComponent,
  WalletButtonRenderProps,
  WalletButtonHeadlessProps,
  PayButtonRenderProps,
  PayButtonHeadlessProps,
  WalletWidgetRenderProps,
  WalletWidgetSlots,
  WalletWidgetHeadlessProps,
  TransactionListRenderProps,
  TransactionListSlots,
  TransactionListHeadlessProps,
  BalanceDisplayRenderProps,
  BalanceDisplayHeadlessProps,
  UseWalletButtonHeadlessOptions,
  UsePayButtonHeadlessOptions,
  UseWalletWidgetHeadlessOptions,
} from './headless';

// Components - Wallet
export {
  WalletWidget,
  BalanceDisplay,
  WalletButton,
  AddressDisplay,
} from './components/wallet';

export type {
  WalletWidgetClassNames,
  WalletButtonClassNames,
} from './components/wallet';

// Components - Transfer
export {
  SendMoney,
  PaymentForm,
  PayButton,
  QRCodeDisplay,
  QRCodePayment,
  RecipientInput,
} from './components/transfer';

export type { PayButtonClassNames } from './components/transfer';

// Components - Ramps
export { FundWallet, CashOut, RampModal } from './components/ramps';

// Components - History
export {
  TransactionList,
  TransactionItem,
  TransactionDetail,
} from './components/history';

// Components - Subscription
export {
  PlanCard,
  PlanSelector,
  SubscriptionCard,
  SubscriptionCheckout,
} from './components/subscription';

// Components - UI
export { Button, Input, Modal, Spinner, Toast } from './components/ui';
export type { ButtonClassNames, ButtonVariant, ButtonSize } from './components/ui';

// Core
export {
  ArcClient,
  CircleClient,
  PaymentProcessor,
  TransactionBuilder,
  createTransactionBuilder,
  WalletConnectAdapter,
  createWalletConnectAdapter,
  ExternalWalletAdapter,
  createExternalWalletAdapter,
  detectInjectedWallet,
} from './core';

// Types
export type {
  // Wallet
  Wallet,
  CreateWalletOptions,
  WalletState,
  WalletBalance,
  // Transaction
  Transaction,
  TransactionState,
  TransactionType,
  TransactionReceipt,
  TransactionFilters,
  TransferParams,
  TransactionResult,
  // Payment
  PaymentRequest,
  PaymentRequestParams,
  OnrampOptions,
  OnrampResult,
  OfframpOptions,
  OfframpResult,
  ValidationResult,
  // Config
  ArcPayConfig,
  ArcPayError,
  NetworkType,
  WalletType,
  LocaleType,
  CurrencyType,
  CircleClientConfig,
  ArcClientConfig,
  // Theme
  ThemeConfig,
  ThemeColors,
  ThemeFonts,
  ThemeRadii,
  ThemeShadows,
  ThemeSpacing,
  ThemeSizes,
  ThemeTransitions,
  ThemeName,
  ThemeOverride,
  DeepPartial,
  ComponentTokens,
  ButtonTokens,
  InputTokens,
  CardTokens,
  ModalTokens,
  // Subscription
  SubscriptionInterval,
  SubscriptionStatus,
  SubscriptionPlan,
  Subscription,
  SubscriptionIntent,
  SubscriptionAction,
  SubscriptionApprovalResult,
  ManageSubscriptionResult,
  PlanSelectorProps,
  SubscriptionCardProps,
  SubscriptionCheckoutProps,
} from './types';

// Utilities
export {
  formatAmount,
  parseAmount,
  formatCurrency,
  formatAddress,
  formatDate,
  formatRelativeTime,
} from './utils/formatting';

export {
  isValidAddress,
  isValidEmail,
  validateRecipient,
  validateAmount,
} from './utils/validation';

// ClassName utilities
export {
  cn,
  mergeClassName,
  mergeSlotClassNames,
  createSlotClassNames,
} from './utils/cn';

export type {
  ClassNameStrategy,
  SlotClassNames,
} from './utils/cn';

// Themes
export { defaultTheme, darkTheme, minimalTheme } from './styles/themes';

// Internationalization
export { I18nProvider, useI18n, useTranslation } from './i18n';
export type { TranslationKeys, LocaleCode } from './i18n';

// Styles (CSS import)
import './styles/base.css';
