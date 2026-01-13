'use client';

import { motion } from 'framer-motion';
import { AccentColor, accentClasses } from '../utils/colors';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  size?: 'sm' | 'md';
  accent?: AccentColor;
  disabled?: boolean;
  className?: string;
}

export function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
  size = 'md',
  accent = 'cyan',
  disabled = false,
  className = '',
}: ToggleSwitchProps) {
  const classes = accentClasses[accent];

  const sizeConfig = {
    sm: {
      track: 'w-8 h-4',
      thumb: 'w-3 h-3',
      translate: checked ? 'translateX(16px)' : 'translateX(2px)',
    },
    md: {
      track: 'w-10 h-5',
      thumb: 'w-4 h-4',
      translate: checked ? 'translateX(20px)' : 'translateX(2px)',
    },
  };

  const config = sizeConfig[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`
          relative inline-flex flex-shrink-0
          ${config.track}
          rounded-full
          transition-colors duration-200
          focus:outline-none focus:ring-2 ${classes.ring}
          ${checked ? 'bg-cyan-600' : 'bg-slate-700'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <motion.span
          animate={{ x: checked ? (size === 'sm' ? 16 : 20) : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`
            ${config.thumb}
            bg-white rounded-full shadow-sm
            absolute top-1/2 -translate-y-1/2
          `}
        />
      </button>

      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <div className={`text-xs text-white ${disabled ? 'opacity-50' : ''}`}>
              {label}
            </div>
          )}
          {description && (
            <div className="text-[10px] text-slate-500">{description}</div>
          )}
        </div>
      )}
    </div>
  );
}

// Simplified inline toggle without label
interface InlineToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: 'sm' | 'md';
  accent?: AccentColor;
  disabled?: boolean;
}

export function InlineToggle({
  checked,
  onChange,
  size = 'md',
  accent = 'cyan',
  disabled = false,
}: InlineToggleProps) {
  const classes = accentClasses[accent];

  const sizeConfig = {
    sm: {
      track: 'w-8 h-4',
      thumb: 'w-3 h-3',
    },
    md: {
      track: 'w-10 h-5',
      thumb: 'w-4 h-4',
    },
  };

  const config = sizeConfig[size];

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`
        relative inline-flex items-center
        ${config.track}
        rounded-full
        transition-colors duration-200
        focus:outline-none focus:ring-2 ${classes.ring}
        ${checked ? 'bg-cyan-600 justify-end' : 'bg-slate-700 justify-start'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`${config.thumb} bg-white rounded-full mx-0.5`}
      />
    </button>
  );
}
