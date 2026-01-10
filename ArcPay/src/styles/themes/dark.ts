import type { ThemeConfig } from '../../types/theme';

export const darkTheme: ThemeConfig = {
  colors: {
    // Brand colors
    primary: '#5C8DFF',
    primaryHover: '#7BA3FF',
    primaryActive: '#4A7AE8',
    secondary: '#00D632',
    secondaryHover: '#00E83A',

    // Backgrounds
    background: '#0A0B0D',
    surface: '#1A1B1F',
    surfaceHover: '#25262B',
    surfaceActive: '#2F3035',

    // Text
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    textInverse: '#0A0B0D',

    // Semantic
    success: '#00D632',
    successLight: '#0D2A1A',
    error: '#FF6B6B',
    errorLight: '#2A1A1A',
    warning: '#FFD93D',
    warningLight: '#2A2A1A',
    info: '#5C8DFF',
    infoLight: '#1A1D2A',

    // Borders
    border: '#2D2E32',
    borderFocus: '#5C8DFF',

    // Overlays
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
  fonts: {
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    heading:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"SF Mono", "Fira Code", "Fira Mono", Menlo, Monaco, Consolas, monospace',
  },
  radii: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.4)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.5)',
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
    buttonSm: '32px',
    buttonMd: '40px',
    buttonLg: '48px',
    inputSm: '32px',
    inputMd: '40px',
    inputLg: '48px',
    iconSm: '16px',
    iconMd: '20px',
    iconLg: '24px',
  },
  transitions: {
    fast: '150ms ease',
    normal: '200ms ease',
    slow: '300ms ease',
  },
  components: {
    button: {
      borderRadius: '8px',
      fontWeight: '600',
      paddingX: '16px',
      paddingY: '10px',
    },
    input: {
      borderRadius: '8px',
      borderWidth: '1px',
      paddingX: '12px',
      paddingY: '10px',
    },
    card: {
      borderRadius: '12px',
      padding: '24px',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    },
    modal: {
      borderRadius: '16px',
      padding: '24px',
      shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.5)',
      backdropColor: 'rgba(0, 0, 0, 0.7)',
    },
  },
};
