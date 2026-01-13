// Accent color configurations
export const accentColors = {
  cyan: {
    primary: 'rgb(6, 182, 212)',
    glow: 'rgba(6, 182, 212, 0.3)',
    glowStrong: 'rgba(6, 182, 212, 0.5)',
    bg: 'rgba(6, 182, 212, 0.1)',
    border: 'rgba(6, 182, 212, 0.2)',
    borderHover: 'rgba(6, 182, 212, 0.4)',
    text: 'rgb(34, 211, 238)',
  },
  purple: {
    primary: 'rgb(168, 85, 247)',
    glow: 'rgba(168, 85, 247, 0.3)',
    glowStrong: 'rgba(168, 85, 247, 0.5)',
    bg: 'rgba(168, 85, 247, 0.1)',
    border: 'rgba(168, 85, 247, 0.2)',
    borderHover: 'rgba(168, 85, 247, 0.4)',
    text: 'rgb(192, 132, 252)',
  },
  amber: {
    primary: 'rgb(245, 158, 11)',
    glow: 'rgba(245, 158, 11, 0.3)',
    glowStrong: 'rgba(245, 158, 11, 0.5)',
    bg: 'rgba(245, 158, 11, 0.1)',
    border: 'rgba(245, 158, 11, 0.2)',
    borderHover: 'rgba(245, 158, 11, 0.4)',
    text: 'rgb(251, 191, 36)',
  },
  emerald: {
    primary: 'rgb(16, 185, 129)',
    glow: 'rgba(16, 185, 129, 0.3)',
    glowStrong: 'rgba(16, 185, 129, 0.5)',
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.2)',
    borderHover: 'rgba(16, 185, 129, 0.4)',
    text: 'rgb(52, 211, 153)',
  },
  red: {
    primary: 'rgb(239, 68, 68)',
    glow: 'rgba(239, 68, 68, 0.3)',
    glowStrong: 'rgba(239, 68, 68, 0.5)',
    bg: 'rgba(239, 68, 68, 0.1)',
    border: 'rgba(239, 68, 68, 0.2)',
    borderHover: 'rgba(239, 68, 68, 0.4)',
    text: 'rgb(248, 113, 113)',
  },
  blue: {
    primary: 'rgb(59, 130, 246)',
    glow: 'rgba(59, 130, 246, 0.3)',
    glowStrong: 'rgba(59, 130, 246, 0.5)',
    bg: 'rgba(59, 130, 246, 0.1)',
    border: 'rgba(59, 130, 246, 0.2)',
    borderHover: 'rgba(59, 130, 246, 0.4)',
    text: 'rgb(96, 165, 250)',
  },
} as const;

export type AccentColor = keyof typeof accentColors;

// Status color configurations for badges
export const statusColors = {
  // Success states
  active: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', dot: 'bg-green-500' },
  paid: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', dot: 'bg-green-500' },
  completed: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', dot: 'bg-green-500' },
  delivered: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', dot: 'bg-green-500' },
  success: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', dot: 'bg-green-500' },

  // Warning states
  pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20', dot: 'bg-yellow-500' },
  processing: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20', dot: 'bg-yellow-500' },
  warning: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20', dot: 'bg-yellow-500' },
  low_balance: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', dot: 'bg-orange-500' },

  // Danger states
  overdue: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', dot: 'bg-red-500' },
  failed: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', dot: 'bg-red-500' },
  rejected: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', dot: 'bg-red-500' },
  error: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', dot: 'bg-red-500' },
  danger: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', dot: 'bg-red-500' },

  // Info states
  sent: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', dot: 'bg-blue-500' },
  viewed: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', dot: 'bg-purple-500' },
  info: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', dot: 'bg-blue-500' },
  beta: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', dot: 'bg-purple-500' },
  stable: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', dot: 'bg-green-500' },

  // Neutral states
  disabled: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', dot: 'bg-slate-500' },
  neutral: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', dot: 'bg-slate-500' },
  draft: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', dot: 'bg-slate-500' },
  coming_soon: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', dot: 'bg-slate-500' },
} as const;

export type StatusType = keyof typeof statusColors;

// Tailwind class mappings for accent colors
export const accentClasses = {
  cyan: {
    bg: 'bg-cyan-500/10',
    bgHover: 'hover:bg-cyan-500/20',
    border: 'border-cyan-500/20',
    borderHover: 'hover:border-cyan-500/40',
    text: 'text-cyan-400',
    textBright: 'text-cyan-300',
    shadow: 'shadow-cyan-500/20',
    shadowHover: 'hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]',
    ring: 'ring-cyan-500/30',
    gradient: 'from-cyan-500/10 to-cyan-600/5',
  },
  purple: {
    bg: 'bg-purple-500/10',
    bgHover: 'hover:bg-purple-500/20',
    border: 'border-purple-500/20',
    borderHover: 'hover:border-purple-500/40',
    text: 'text-purple-400',
    textBright: 'text-purple-300',
    shadow: 'shadow-purple-500/20',
    shadowHover: 'hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]',
    ring: 'ring-purple-500/30',
    gradient: 'from-purple-500/10 to-purple-600/5',
  },
  amber: {
    bg: 'bg-amber-500/10',
    bgHover: 'hover:bg-amber-500/20',
    border: 'border-amber-500/20',
    borderHover: 'hover:border-amber-500/40',
    text: 'text-amber-400',
    textBright: 'text-amber-300',
    shadow: 'shadow-amber-500/20',
    shadowHover: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]',
    ring: 'ring-amber-500/30',
    gradient: 'from-amber-500/10 to-amber-600/5',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    bgHover: 'hover:bg-emerald-500/20',
    border: 'border-emerald-500/20',
    borderHover: 'hover:border-emerald-500/40',
    text: 'text-emerald-400',
    textBright: 'text-emerald-300',
    shadow: 'shadow-emerald-500/20',
    shadowHover: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]',
    ring: 'ring-emerald-500/30',
    gradient: 'from-emerald-500/10 to-emerald-600/5',
  },
  red: {
    bg: 'bg-red-500/10',
    bgHover: 'hover:bg-red-500/20',
    border: 'border-red-500/20',
    borderHover: 'hover:border-red-500/40',
    text: 'text-red-400',
    textBright: 'text-red-300',
    shadow: 'shadow-red-500/20',
    shadowHover: 'hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]',
    ring: 'ring-red-500/30',
    gradient: 'from-red-500/10 to-red-600/5',
  },
  blue: {
    bg: 'bg-blue-500/10',
    bgHover: 'hover:bg-blue-500/20',
    border: 'border-blue-500/20',
    borderHover: 'hover:border-blue-500/40',
    text: 'text-blue-400',
    textBright: 'text-blue-300',
    shadow: 'shadow-blue-500/20',
    shadowHover: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]',
    ring: 'ring-blue-500/30',
    gradient: 'from-blue-500/10 to-blue-600/5',
  },
} as const;
