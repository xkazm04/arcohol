import type { ThemeConfig } from '../../types/theme';

export const minimalTheme: ThemeConfig = {
  colors: {
    // Brand colors
    primary: '#000000',
    primaryHover: '#1A1A1A',
    primaryActive: '#333333',
    secondary: '#666666',
    secondaryHover: '#555555',

    // Backgrounds
    background: '#FFFFFF',
    surface: '#FAFAFA',
    surfaceHover: '#F5F5F5',
    surfaceActive: '#EBEBEB',

    // Text
    text: '#000000',
    textSecondary: '#666666',
    textMuted: '#999999',
    textInverse: '#FFFFFF',

    // Semantic
    success: '#10B981',
    successLight: '#ECFDF5',
    error: '#EF4444',
    errorLight: '#FEF2F2',
    warning: '#F59E0B',
    warningLight: '#FFFBEB',
    info: '#3B82F6',
    infoLight: '#EFF6FF',

    // Borders
    border: '#E5E5E5',
    borderFocus: '#000000',

    // Overlays
    overlay: 'rgba(0, 0, 0, 0.4)',
  },
  fonts: {
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    heading:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"SF Mono", "Fira Code", "Fira Mono", Menlo, Monaco, Consolas, monospace',
  },
  radii: {
    none: '0',
    sm: '2px',
    md: '4px',
    lg: '6px',
    xl: '8px',
    full: '9999px',
  },
  shadows: {
    none: 'none',
    sm: 'none',
    md: '0 1px 3px rgba(0, 0, 0, 0.1)',
    lg: '0 4px 6px rgba(0, 0, 0, 0.1)',
    xl: '0 8px 12px rgba(0, 0, 0, 0.1)',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
  },
  sizes: {
    buttonSm: '28px',
    buttonMd: '36px',
    buttonLg: '44px',
    inputSm: '28px',
    inputMd: '36px',
    inputLg: '44px',
    iconSm: '14px',
    iconMd: '18px',
    iconLg: '22px',
  },
  transitions: {
    fast: '100ms ease',
    normal: '150ms ease',
    slow: '200ms ease',
  },
  components: {
    button: {
      borderRadius: '4px',
      fontWeight: '500',
      paddingX: '12px',
      paddingY: '8px',
    },
    input: {
      borderRadius: '4px',
      borderWidth: '1px',
      paddingX: '10px',
      paddingY: '8px',
    },
    card: {
      borderRadius: '6px',
      padding: '20px',
      shadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    modal: {
      borderRadius: '8px',
      padding: '20px',
      shadow: '0 8px 12px rgba(0, 0, 0, 0.1)',
      backdropColor: 'rgba(0, 0, 0, 0.4)',
    },
  },
};
