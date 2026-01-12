import type { ArcPayTheme, ThemeColors } from './types';
import { lightTheme, darkTheme, mergeTheme } from './defaults';

/**
 * Minimal theme with reduced visual elements
 */
export const minimalTheme: ArcPayTheme = mergeTheme(lightTheme, {
  borderRadius: {
    none: '0',
    sm: '0',
    md: '0.125rem',
    lg: '0.25rem',
    xl: '0.375rem',
    '2xl': '0.5rem',
    full: '9999px',
  },
  shadows: {
    none: 'none',
    sm: 'none',
    md: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    lg: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
    xl: '0 2px 4px 0 rgb(0 0 0 / 0.1)',
  },
});

/**
 * Adjust color luminance
 */
function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + percent));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/**
 * Create a brand theme from a primary color
 */
export function createBrandTheme(
  brandColor: string,
  mode: 'light' | 'dark' = 'light'
): Partial<ArcPayTheme> {
  const baseTheme = mode === 'light' ? lightTheme : darkTheme;

  const brandColors: Partial<ThemeColors> = {
    primary: brandColor,
    primaryHover: adjustColor(brandColor, mode === 'light' ? -20 : 20),
    primaryActive: adjustColor(brandColor, mode === 'light' ? -40 : 40),
    borderFocus: brandColor,
  };

  return {
    colors: { ...baseTheme.colors, ...brandColors },
  };
}

/**
 * Stripe-inspired theme
 */
export const stripeTheme: ArcPayTheme = mergeTheme(lightTheme, {
  colors: {
    ...lightTheme.colors,
    primary: '#635bff',
    primaryHover: '#5147e5',
    primaryActive: '#4b3fd1',
    borderFocus: '#635bff',
  },
  borderRadius: {
    ...lightTheme.borderRadius,
    md: '0.5rem',
    lg: '0.75rem',
  },
});

/**
 * Coinbase-inspired theme
 */
export const coinbaseTheme: ArcPayTheme = mergeTheme(lightTheme, {
  colors: {
    ...lightTheme.colors,
    primary: '#0052ff',
    primaryHover: '#0047e0',
    primaryActive: '#003dc2',
    borderFocus: '#0052ff',
  },
});

/**
 * Circle-inspired theme
 */
export const circleTheme: ArcPayTheme = mergeTheme(lightTheme, {
  colors: {
    ...lightTheme.colors,
    primary: '#00d395',
    primaryHover: '#00be85',
    primaryActive: '#00a975',
    success: '#00d395',
    borderFocus: '#00d395',
  },
});

/**
 * All preset themes
 */
export const presets = {
  light: lightTheme,
  dark: darkTheme,
  minimal: minimalTheme,
  stripe: stripeTheme,
  coinbase: coinbaseTheme,
  circle: circleTheme,
} as const;

export type ThemePreset = keyof typeof presets;

/**
 * Get a preset theme by name
 */
export function getPresetTheme(preset: ThemePreset): ArcPayTheme {
  return presets[preset];
}

/**
 * Create a theme from preset with overrides
 */
export function createTheme(
  preset: ThemePreset,
  overrides?: Partial<ArcPayTheme>
): ArcPayTheme {
  return mergeTheme(presets[preset], overrides);
}
