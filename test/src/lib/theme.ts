// --- ARCPAY THEME SYSTEM ---
// Predefined light and dark theme variants for consistent styling

export type ThemeMode = 'light' | 'dark';
export type PaymentMode = 'mock' | 'testnet';

// --- LIGHT THEME ---
export const lightTheme = {
  // Backgrounds
  bg: 'bg-white',
  bgAlt: 'bg-zinc-50',
  bgMuted: 'bg-zinc-100',
  bgElevated: 'bg-white',
  bgInverse: 'bg-zinc-900',

  // Text
  text: 'text-zinc-900',
  textSecondary: 'text-zinc-600',
  textMuted: 'text-zinc-500',
  textLight: 'text-zinc-400',
  textInverse: 'text-white',

  // Borders
  border: 'border-zinc-200',
  borderStrong: 'border-zinc-300',
  borderAccent: 'border-zinc-900',
  divider: 'divide-zinc-200',

  // Interactive
  hover: 'hover:bg-zinc-50',
  hoverStrong: 'hover:bg-zinc-100',
  active: 'bg-zinc-100',

  // Surfaces (cards, panels)
  card: 'bg-white border border-zinc-200',
  cardHover: 'hover:border-zinc-300',
  cardActive: 'border-zinc-900',
  panel: 'bg-zinc-50 border border-zinc-200',

  // Code blocks
  code: 'bg-zinc-100 border border-zinc-200',
  codeText: 'text-zinc-800',
  codeSyntax: 'text-violet-600',

  // Buttons
  buttonPrimary: 'bg-zinc-900 text-white hover:bg-zinc-800',
  buttonSecondary: 'bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50',
  buttonGhost: 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
};

// --- DARK THEME ---
export const darkTheme = {
  // Backgrounds
  bg: 'bg-zinc-900',
  bgAlt: 'bg-zinc-800',
  bgMuted: 'bg-zinc-800',
  bgElevated: 'bg-zinc-800',
  bgInverse: 'bg-white',

  // Text
  text: 'text-white',
  textSecondary: 'text-zinc-300',
  textMuted: 'text-zinc-400',
  textLight: 'text-zinc-500',
  textInverse: 'text-zinc-900',

  // Borders
  border: 'border-zinc-700',
  borderStrong: 'border-zinc-600',
  borderAccent: 'border-white',
  divider: 'divide-zinc-700',

  // Interactive
  hover: 'hover:bg-zinc-800',
  hoverStrong: 'hover:bg-zinc-700',
  active: 'bg-zinc-700',

  // Surfaces
  card: 'bg-zinc-800 border border-zinc-700',
  cardHover: 'hover:border-zinc-600',
  cardActive: 'border-white',
  panel: 'bg-zinc-800/50 border border-zinc-700',

  // Code blocks
  code: 'bg-zinc-800 border border-zinc-700',
  codeText: 'text-zinc-200',
  codeSyntax: 'text-green-400',

  // Buttons
  buttonPrimary: 'bg-white text-zinc-900 hover:bg-zinc-100',
  buttonSecondary: 'bg-zinc-800 text-white border border-zinc-600 hover:bg-zinc-700',
  buttonGhost: 'text-zinc-400 hover:bg-zinc-800 hover:text-white',
};

// --- PAYMENT MODE COLORS ---
export const modeColors = {
  mock: {
    primary: 'bg-violet-600',
    primaryHover: 'hover:bg-violet-700',
    primaryText: 'text-violet-600',
    light: 'bg-violet-50',
    lightText: 'text-violet-700',
    border: 'border-violet-200',
    borderStrong: 'border-violet-500',
    gradient: 'from-violet-600 via-purple-600 to-indigo-600',
    // Light theme accent
    accent: 'bg-violet-100 text-violet-700 border-violet-200',
    accentStrong: 'bg-violet-600 text-white',
  },
  testnet: {
    primary: 'bg-orange-500',
    primaryHover: 'hover:bg-orange-600',
    primaryText: 'text-orange-600',
    light: 'bg-orange-50',
    lightText: 'text-orange-700',
    border: 'border-orange-200',
    borderStrong: 'border-orange-500',
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
    // Light theme accent
    accent: 'bg-orange-100 text-orange-700 border-orange-200',
    accentStrong: 'bg-orange-500 text-white',
  },
};

// --- THEME HELPER ---
export function getTheme(mode: ThemeMode = 'light') {
  return mode === 'dark' ? darkTheme : lightTheme;
}

export function getModeColors(mode: PaymentMode = 'mock') {
  return modeColors[mode];
}

// --- COMBINED THEME (for convenience) ---
export const THEME = {
  light: lightTheme,
  dark: darkTheme,
  modes: modeColors,

  // Typography (shared)
  fontDisplay: 'font-sans tracking-tight',
  fontMono: 'font-mono',
  labelSmall: 'text-[10px] uppercase tracking-widest',
  labelMedium: 'text-xs uppercase tracking-wider font-medium',
};

// --- PRODUCT CATEGORIES ---
export const CATEGORIES = [
  { id: 'electronics', name: 'Electronics', icon: 'cpu' },
  { id: 'accessories', name: 'Accessories', icon: 'watch' },
  { id: 'audio', name: 'Audio', icon: 'headphones' },
  { id: 'wearables', name: 'Wearables', icon: 'activity' },
];

// --- PAYMENT FEATURES ---
export const FEATURES = [
  {
    title: 'Instant Settlement',
    description: 'Transactions confirmed in seconds on Arc blockchain',
    stat: '<3s',
    label: 'Avg Time',
  },
  {
    title: 'Low Fees',
    description: 'Minimal network fees compared to traditional payments',
    stat: '$0.01',
    label: 'Per Tx',
  },
  {
    title: 'Global Access',
    description: 'Accept payments from anywhere, no borders',
    stat: '190+',
    label: 'Countries',
  },
  {
    title: 'Secure',
    description: 'Enterprise-grade security with blockchain verification',
    stat: '100%',
    label: 'Uptime',
  },
];

// --- CAPABILITIES ---
export const CAPABILITIES = [
  { label: 'USDC Payments', description: 'Stablecoin checkout' },
  { label: 'Wallet Connect', description: 'One-click connection' },
  { label: 'Real-time Rates', description: 'Live price feeds' },
  { label: 'Transaction History', description: 'Full audit trail' },
];
