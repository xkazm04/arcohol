import type { ArcPayTheme, ThemeColors, ThemeFonts, ThemeFontSizes, ThemeSpacing, ThemeBorderRadius, ThemeShadows, ThemeTransitions } from './types';

/**
 * Default color palette (light theme)
 */
export const defaultColors: ThemeColors = {
  primary: '#2563eb',
  primaryHover: '#1d4ed8',
  primaryActive: '#1e40af',
  secondary: '#64748b',
  secondaryHover: '#475569',
  success: '#10b981',
  successLight: '#d1fae5',
  error: '#ef4444',
  errorLight: '#fee2e2',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  info: '#3b82f6',
  infoLight: '#dbeafe',
  background: '#ffffff',
  surface: '#f8fafc',
  surfaceHover: '#f1f5f9',
  surfaceActive: '#e2e8f0',
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  textInverse: '#ffffff',
  border: '#e2e8f0',
  borderFocus: '#2563eb',
  borderError: '#ef4444',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

/**
 * Dark theme colors
 */
export const darkColors: ThemeColors = {
  primary: '#3b82f6',
  primaryHover: '#60a5fa',
  primaryActive: '#2563eb',
  secondary: '#94a3b8',
  secondaryHover: '#cbd5e1',
  success: '#34d399',
  successLight: '#064e3b',
  error: '#f87171',
  errorLight: '#7f1d1d',
  warning: '#fbbf24',
  warningLight: '#78350f',
  info: '#60a5fa',
  infoLight: '#1e3a5f',
  background: '#0f172a',
  surface: '#1e293b',
  surfaceHover: '#334155',
  surfaceActive: '#475569',
  text: '#f8fafc',
  textSecondary: '#cbd5e1',
  textMuted: '#64748b',
  textInverse: '#0f172a',
  border: '#334155',
  borderFocus: '#3b82f6',
  borderError: '#f87171',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

/**
 * Default fonts
 */
export const defaultFonts: ThemeFonts = {
  body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
};

/**
 * Default font sizes
 */
export const defaultFontSizes: ThemeFontSizes = {
  xs: '0.75rem',
  sm: '0.875rem',
  md: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
};

/**
 * Default spacing
 */
export const defaultSpacing: ThemeSpacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
};

/**
 * Default border radius
 */
export const defaultBorderRadius: ThemeBorderRadius = {
  none: '0',
  sm: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  full: '9999px',
};

/**
 * Default shadows
 */
export const defaultShadows: ThemeShadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
};

/**
 * Default transitions
 */
export const defaultTransitions: ThemeTransitions = {
  fast: '150ms ease-in-out',
  normal: '200ms ease-in-out',
  slow: '300ms ease-in-out',
};

/**
 * Complete default light theme
 */
export const lightTheme: ArcPayTheme = {
  colors: defaultColors,
  fonts: defaultFonts,
  fontSizes: defaultFontSizes,
  spacing: defaultSpacing,
  borderRadius: defaultBorderRadius,
  shadows: defaultShadows,
  transitions: defaultTransitions,
};

/**
 * Complete default dark theme
 */
export const darkTheme: ArcPayTheme = {
  colors: darkColors,
  fonts: defaultFonts,
  fontSizes: defaultFontSizes,
  spacing: defaultSpacing,
  borderRadius: defaultBorderRadius,
  shadows: defaultShadows,
  transitions: defaultTransitions,
};

/**
 * Deep merge two theme objects
 */
export function mergeTheme(
  base: ArcPayTheme,
  overrides?: Partial<ArcPayTheme>
): ArcPayTheme {
  if (!overrides) return base;

  return {
    colors: { ...base.colors, ...overrides.colors },
    fonts: { ...base.fonts, ...overrides.fonts },
    fontSizes: { ...base.fontSizes, ...overrides.fontSizes },
    spacing: { ...base.spacing, ...overrides.spacing },
    borderRadius: { ...base.borderRadius, ...overrides.borderRadius },
    shadows: { ...base.shadows, ...overrides.shadows },
    transitions: { ...base.transitions, ...overrides.transitions },
    components: { ...base.components, ...overrides.components },
  };
}
