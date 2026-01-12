// Types
export type {
  ArcPayTheme,
  ThemeColors,
  ThemeFonts,
  ThemeFontSizes,
  ThemeSpacing,
  ThemeBorderRadius,
  ThemeShadows,
  ThemeTransitions,
  ComponentOverrides,
  ComponentOverride,
  BrandConfig,
  CheckoutConfig,
  InvoiceConfig,
  SubscriptionConfig,
  SupportedChain,
  SupportedCurrency,
  Money,
  PaymentStatus,
  ArcPayProviderConfig,
} from './types';

// Defaults
export {
  lightTheme,
  darkTheme,
  defaultColors,
  darkColors,
  defaultFonts,
  defaultFontSizes,
  defaultSpacing,
  defaultBorderRadius,
  defaultShadows,
  defaultTransitions,
  mergeTheme,
} from './defaults';

// Presets
export {
  minimalTheme,
  stripeTheme,
  coinbaseTheme,
  circleTheme,
  presets,
  createBrandTheme,
  getPresetTheme,
  createTheme,
  type ThemePreset,
} from './presets';

// Provider
export {
  ArcPayThemeProvider,
  useTheme,
  useThemedStyles,
  ThemeConsumer,
  type ArcPayThemeProviderProps,
  type ThemeConsumerProps,
} from './ThemeProvider';
