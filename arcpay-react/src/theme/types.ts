import type { CSSProperties } from 'react';

/**
 * Complete theme configuration for ArcPay components
 */
export interface ArcPayTheme {
  colors: ThemeColors;
  fonts: ThemeFonts;
  fontSizes: ThemeFontSizes;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  shadows: ThemeShadows;
  transitions: ThemeTransitions;
  components?: ComponentOverrides;
}

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  primaryActive: string;
  secondary: string;
  secondaryHover: string;
  success: string;
  successLight: string;
  error: string;
  errorLight: string;
  warning: string;
  warningLight: string;
  info: string;
  infoLight: string;
  background: string;
  surface: string;
  surfaceHover: string;
  surfaceActive: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  border: string;
  borderFocus: string;
  borderError: string;
  overlay: string;
}

export interface ThemeFonts {
  body: string;
  heading: string;
  mono: string;
}

export interface ThemeFontSizes {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
}

export interface ThemeBorderRadius {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  full: string;
}

export interface ThemeShadows {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface ThemeTransitions {
  fast: string;
  normal: string;
  slow: string;
}

/**
 * Component-specific style overrides
 */
export interface ComponentOverrides {
  Button?: ComponentOverride;
  Card?: ComponentOverride;
  Input?: ComponentOverride;
  Modal?: ComponentOverride;
  Select?: ComponentOverride;
  Checkbox?: ComponentOverride;
  Badge?: ComponentOverride;
  Tooltip?: ComponentOverride;
}

export interface ComponentOverride {
  className?: string;
  style?: CSSProperties;
  variants?: Record<string, ComponentOverride>;
}

/**
 * Brand configuration for white-labeling
 */
export interface BrandConfig {
  logo?: string;
  logoAlt?: string;
  companyName?: string;
  companyAddress?: string;
  accentColor?: string;
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  fontFamily?: string;
}

/**
 * Checkout configuration
 */
export interface CheckoutConfig {
  allowChainSwitch?: boolean;
  defaultChain?: SupportedChain;
  showFees?: boolean;
  showQRCode?: boolean;
  confirmationTimeout?: number;
}

/**
 * Invoice configuration
 */
export interface InvoiceConfig {
  showDownload?: boolean;
  showPrint?: boolean;
  showQRCode?: boolean;
  currency?: string;
  locale?: string;
}

/**
 * Subscription configuration
 */
export interface SubscriptionConfig {
  showUsage?: boolean;
  showBillingHistory?: boolean;
  allowCancellation?: boolean;
  showAnnualDiscount?: boolean;
  annualDiscountPercent?: number;
}

/**
 * Supported blockchain chains
 */
export type SupportedChain =
  | 'arc'
  | 'ethereum'
  | 'polygon'
  | 'arbitrum'
  | 'optimism'
  | 'avalanche'
  | 'solana';

/**
 * Supported currencies
 */
export type SupportedCurrency = 'USDC' | 'USDT' | 'DAI' | 'EURC';

/**
 * Money type
 */
export interface Money {
  amount: string;
  currency: SupportedCurrency;
}

/**
 * Payment status
 */
export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'confirming'
  | 'confirmed'
  | 'failed'
  | 'expired'
  | 'refunded';

/**
 * Provider configuration
 */
export interface ArcPayProviderConfig {
  publicKey: string;
  environment?: 'sandbox' | 'production';
  theme?: Partial<ArcPayTheme>;
  brand?: BrandConfig;
  checkout?: CheckoutConfig;
  invoice?: InvoiceConfig;
  subscription?: SubscriptionConfig;
  locale?: string;
  onError?: (error: Error) => void;
}
