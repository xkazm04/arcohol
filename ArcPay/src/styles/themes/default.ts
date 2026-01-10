import type { ThemeConfig } from '../../types/theme';

export const defaultTheme: ThemeConfig = {
  colors: {
    // Brand colors
    primary: '#0052FF',
    primaryHover: '#0043CC',
    primaryActive: '#003399',
    secondary: '#00D632',
    secondaryHover: '#00B52A',

    // Backgrounds
    background: '#FFFFFF',
    surface: '#F7F8FA',
    surfaceHover: '#EBEDF0',
    surfaceActive: '#E0E2E6',

    // Text
    text: '#0A0B0D',
    textSecondary: '#5B616E',
    textMuted: '#8A919E',
    textInverse: '#FFFFFF',

    // Semantic
    success: '#00D632',
    successLight: '#E6FBF0',
    error: '#FF3B3B',
    errorLight: '#FFEBEB',
    warning: '#FFB020',
    warningLight: '#FFF8E6',
    info: '#0052FF',
    infoLight: '#E6EEFF',

    // Borders
    border: '#E8EAED',
    borderFocus: '#0052FF',

    // Overlays
    overlay: 'rgba(0, 0, 0, 0.5)',
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
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
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
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },
    modal: {
      borderRadius: '16px',
      padding: '24px',
      shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      backdropColor: 'rgba(0, 0, 0, 0.5)',
    },
  },
};
