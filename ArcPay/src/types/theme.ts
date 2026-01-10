// =============================================================================
// Core Design Tokens
// =============================================================================

export interface ThemeColors {
  // Brand colors
  primary: string;
  primaryHover: string;
  primaryActive: string;
  secondary: string;
  secondaryHover: string;

  // Backgrounds
  background: string;
  surface: string;
  surfaceHover: string;
  surfaceActive: string;

  // Text
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  // Semantic
  success: string;
  successLight: string;
  error: string;
  errorLight: string;
  warning: string;
  warningLight: string;
  info: string;
  infoLight: string;

  // Borders
  border: string;
  borderFocus: string;

  // Overlays
  overlay: string;
}

export interface ThemeFonts {
  body: string;
  heading: string;
  mono: string;
}

export interface ThemeRadii {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

export interface ThemeShadows {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export interface ThemeSizes {
  buttonSm: string;
  buttonMd: string;
  buttonLg: string;
  inputSm: string;
  inputMd: string;
  inputLg: string;
  iconSm: string;
  iconMd: string;
  iconLg: string;
}

export interface ThemeTransitions {
  fast: string;
  normal: string;
  slow: string;
}

// =============================================================================
// Component-Specific Tokens
// =============================================================================

export interface ButtonTokens {
  borderRadius: string;
  fontWeight: string;
  paddingX: string;
  paddingY: string;
}

export interface InputTokens {
  borderRadius: string;
  borderWidth: string;
  paddingX: string;
  paddingY: string;
}

export interface CardTokens {
  borderRadius: string;
  padding: string;
  shadow: string;
}

export interface ModalTokens {
  borderRadius: string;
  padding: string;
  shadow: string;
  backdropColor: string;
}

export interface ComponentTokens {
  button: ButtonTokens;
  input: InputTokens;
  card: CardTokens;
  modal: ModalTokens;
}

// =============================================================================
// Theme Configuration
// =============================================================================

export interface ThemeConfig {
  colors: ThemeColors;
  fonts: ThemeFonts;
  radii: ThemeRadii;
  shadows: ThemeShadows;
  spacing: ThemeSpacing;
  sizes: ThemeSizes;
  transitions: ThemeTransitions;
  components: ComponentTokens;
}

/**
 * Deep partial type for theme overrides
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Theme override type - allows partial overrides of any theme property
 */
export type ThemeOverride = DeepPartial<ThemeConfig>;

export type ThemeName = 'default' | 'dark' | 'minimal';
