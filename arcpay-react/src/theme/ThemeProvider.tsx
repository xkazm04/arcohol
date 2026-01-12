import React, { createContext, useContext, useMemo, type ReactNode, type CSSProperties } from 'react';
import type { ArcPayTheme } from './types';
import { lightTheme, mergeTheme } from './defaults';

/**
 * Theme context value
 */
interface ThemeContextValue {
  theme: ArcPayTheme;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Theme provider props
 */
export interface ArcPayThemeProviderProps {
  theme?: Partial<ArcPayTheme>;
  preset?: 'light' | 'dark';
  children: ReactNode;
}

/**
 * Theme provider component
 */
export function ArcPayThemeProvider({
  theme: themeOverrides,
  preset = 'light',
  children,
}: ArcPayThemeProviderProps) {
  const baseTheme = preset === 'dark'
    ? require('./defaults').darkTheme
    : lightTheme;

  const theme = useMemo(
    () => mergeTheme(baseTheme, themeOverrides),
    [baseTheme, themeOverrides]
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      isDark: preset === 'dark',
    }),
    [theme, preset]
  );

  const cssVariables = useMemo(() => themeToCSSVariables(theme), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      <div style={cssVariables} className="arcpay-root">
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

/**
 * Use theme hook
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    // Return default theme if used outside provider
    return {
      theme: lightTheme,
      isDark: false,
    };
  }

  return context;
}

/**
 * Use themed styles hook
 */
export function useThemedStyles<T extends Record<string, CSSProperties>>(
  stylesFn: (theme: ArcPayTheme) => T
): T {
  const { theme } = useTheme();
  return useMemo(() => stylesFn(theme), [theme, stylesFn]);
}

/**
 * Convert theme to CSS variables
 */
function themeToCSSVariables(theme: ArcPayTheme): CSSProperties {
  const vars: Record<string, string> = {};

  // Colors
  Object.entries(theme.colors).forEach(([key, value]) => {
    vars[`--arcpay-color-${camelToKebab(key)}`] = value;
  });

  // Fonts
  Object.entries(theme.fonts).forEach(([key, value]) => {
    vars[`--arcpay-font-${key}`] = value;
  });

  // Font sizes
  Object.entries(theme.fontSizes).forEach(([key, value]) => {
    vars[`--arcpay-font-size-${key}`] = value;
  });

  // Spacing
  Object.entries(theme.spacing).forEach(([key, value]) => {
    vars[`--arcpay-spacing-${key}`] = value;
  });

  // Border radius
  Object.entries(theme.borderRadius).forEach(([key, value]) => {
    vars[`--arcpay-radius-${key}`] = value;
  });

  // Shadows
  Object.entries(theme.shadows).forEach(([key, value]) => {
    vars[`--arcpay-shadow-${key}`] = value;
  });

  // Transitions
  Object.entries(theme.transitions).forEach(([key, value]) => {
    vars[`--arcpay-transition-${key}`] = value;
  });

  return vars as CSSProperties;
}

/**
 * Convert camelCase to kebab-case
 */
function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Theme consumer component for render props pattern
 */
export interface ThemeConsumerProps {
  children: (context: ThemeContextValue) => ReactNode;
}

export function ThemeConsumer({ children }: ThemeConsumerProps) {
  const context = useTheme();
  return <>{children(context)}</>;
}
