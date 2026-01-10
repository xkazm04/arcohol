import React, { createContext, useContext, useMemo, type PropsWithChildren } from 'react';
import type { ThemeConfig, ThemeName, ThemeOverride } from '../types/theme';
import { defaultTheme, darkTheme, minimalTheme } from '../styles/themes';

interface ThemeContextValue {
  theme: ThemeConfig;
  themeName: ThemeName | 'custom';
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getThemeByName(name: ThemeName): ThemeConfig {
  switch (name) {
    case 'dark':
      return darkTheme;
    case 'minimal':
      return minimalTheme;
    default:
      return defaultTheme;
  }
}

/**
 * Deep merge two theme objects, with source overriding target
 */
function deepMergeTheme(
  target: ThemeConfig,
  source: Partial<ThemeConfig>
): ThemeConfig {
  const result = { ...target } as ThemeConfig;

  for (const key of Object.keys(source) as (keyof ThemeConfig)[]) {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (
      sourceValue !== undefined &&
      typeof sourceValue === 'object' &&
      sourceValue !== null &&
      !Array.isArray(sourceValue) &&
      typeof targetValue === 'object' &&
      targetValue !== null
    ) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (result as any)[key] = deepMergeTheme(
        targetValue as unknown as ThemeConfig,
        sourceValue as unknown as Partial<ThemeConfig>
      );
    } else if (sourceValue !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (result as any)[key] = sourceValue;
    }
  }

  return result;
}

/**
 * Generate CSS custom properties from theme config
 */
function generateCssVariables(theme: ThemeConfig): React.CSSProperties {
  const { colors, fonts, radii, shadows, spacing, sizes, transitions, components } = theme;

  return {
    // Colors
    '--arcpay-color-primary': colors.primary,
    '--arcpay-color-primary-hover': colors.primaryHover,
    '--arcpay-color-primary-active': colors.primaryActive,
    '--arcpay-color-secondary': colors.secondary,
    '--arcpay-color-secondary-hover': colors.secondaryHover,
    '--arcpay-color-background': colors.background,
    '--arcpay-color-surface': colors.surface,
    '--arcpay-color-surface-hover': colors.surfaceHover,
    '--arcpay-color-surface-active': colors.surfaceActive,
    '--arcpay-color-text': colors.text,
    '--arcpay-color-text-secondary': colors.textSecondary,
    '--arcpay-color-text-muted': colors.textMuted,
    '--arcpay-color-text-inverse': colors.textInverse,
    '--arcpay-color-success': colors.success,
    '--arcpay-color-success-light': colors.successLight,
    '--arcpay-color-error': colors.error,
    '--arcpay-color-error-light': colors.errorLight,
    '--arcpay-color-warning': colors.warning,
    '--arcpay-color-warning-light': colors.warningLight,
    '--arcpay-color-info': colors.info,
    '--arcpay-color-info-light': colors.infoLight,
    '--arcpay-color-border': colors.border,
    '--arcpay-color-border-focus': colors.borderFocus,
    '--arcpay-color-overlay': colors.overlay,

    // Fonts
    '--arcpay-font-body': fonts.body,
    '--arcpay-font-heading': fonts.heading,
    '--arcpay-font-mono': fonts.mono,

    // Radii
    '--arcpay-radius-none': radii.none,
    '--arcpay-radius-sm': radii.sm,
    '--arcpay-radius-md': radii.md,
    '--arcpay-radius-lg': radii.lg,
    '--arcpay-radius-xl': radii.xl,
    '--arcpay-radius-full': radii.full,

    // Shadows
    '--arcpay-shadow-none': shadows.none,
    '--arcpay-shadow-sm': shadows.sm,
    '--arcpay-shadow-md': shadows.md,
    '--arcpay-shadow-lg': shadows.lg,
    '--arcpay-shadow-xl': shadows.xl,

    // Spacing
    '--arcpay-spacing-xs': spacing.xs,
    '--arcpay-spacing-sm': spacing.sm,
    '--arcpay-spacing-md': spacing.md,
    '--arcpay-spacing-lg': spacing.lg,
    '--arcpay-spacing-xl': spacing.xl,
    '--arcpay-spacing-2xl': spacing['2xl'],

    // Sizes
    '--arcpay-size-button-sm': sizes.buttonSm,
    '--arcpay-size-button-md': sizes.buttonMd,
    '--arcpay-size-button-lg': sizes.buttonLg,
    '--arcpay-size-input-sm': sizes.inputSm,
    '--arcpay-size-input-md': sizes.inputMd,
    '--arcpay-size-input-lg': sizes.inputLg,
    '--arcpay-size-icon-sm': sizes.iconSm,
    '--arcpay-size-icon-md': sizes.iconMd,
    '--arcpay-size-icon-lg': sizes.iconLg,

    // Transitions
    '--arcpay-transition-fast': transitions.fast,
    '--arcpay-transition-normal': transitions.normal,
    '--arcpay-transition-slow': transitions.slow,

    // Component tokens - Button
    '--arcpay-button-radius': components.button.borderRadius,
    '--arcpay-button-font-weight': components.button.fontWeight,
    '--arcpay-button-padding-x': components.button.paddingX,
    '--arcpay-button-padding-y': components.button.paddingY,

    // Component tokens - Input
    '--arcpay-input-radius': components.input.borderRadius,
    '--arcpay-input-border-width': components.input.borderWidth,
    '--arcpay-input-padding-x': components.input.paddingX,
    '--arcpay-input-padding-y': components.input.paddingY,

    // Component tokens - Card
    '--arcpay-card-radius': components.card.borderRadius,
    '--arcpay-card-padding': components.card.padding,
    '--arcpay-card-shadow': components.card.shadow,

    // Component tokens - Modal
    '--arcpay-modal-radius': components.modal.borderRadius,
    '--arcpay-modal-padding': components.modal.padding,
    '--arcpay-modal-shadow': components.modal.shadow,
    '--arcpay-modal-backdrop': components.modal.backdropColor,
  } as React.CSSProperties;
}

export interface ThemeProviderProps {
  /**
   * Theme name or custom theme configuration
   * - Use 'default', 'dark', or 'minimal' for preset themes
   * - Pass a ThemeOverride object to customize specific tokens
   */
  theme?: ThemeName | ThemeOverride;

  /**
   * Base theme to use when providing overrides
   * Defaults to 'default'
   */
  baseTheme?: ThemeName;
}

export function ThemeProvider({
  children,
  theme = 'default',
  baseTheme = 'default',
}: PropsWithChildren<ThemeProviderProps>) {
  const themeValue = useMemo<ThemeContextValue>(() => {
    if (typeof theme === 'string') {
      return {
        theme: getThemeByName(theme),
        themeName: theme,
      };
    }

    // Custom theme - merge overrides with base theme
    const base = getThemeByName(baseTheme);
    return {
      theme: deepMergeTheme(base, theme as Partial<ThemeConfig>),
      themeName: 'custom',
    };
  }, [theme, baseTheme]);

  const cssVariables = useMemo(
    () => generateCssVariables(themeValue.theme),
    [themeValue.theme]
  );

  return (
    <ThemeContext.Provider value={themeValue}>
      <div className="arcpay-root" style={cssVariables}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

/**
 * Hook to access individual theme tokens
 */
export function useThemeToken<K extends keyof ThemeConfig>(
  category: K
): ThemeConfig[K] {
  const { theme } = useTheme();
  return theme[category];
}
