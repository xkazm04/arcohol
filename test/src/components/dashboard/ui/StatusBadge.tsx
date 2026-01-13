'use client';

import { motion } from 'framer-motion';
import { statusColors, StatusType } from '../utils/colors';

interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  size?: 'sm' | 'md';
  showDot?: boolean;
  pulse?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  label,
  size = 'sm',
  showDot = false,
  pulse = false,
  className = '',
}: StatusBadgeProps) {
  // Get color config, fallback to neutral
  const colorConfig = statusColors[status as StatusType] || statusColors.neutral;
  const displayLabel = label || status.replace(/_/g, ' ');

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[9px]',
    md: 'px-2 py-1 text-[10px]',
  };

  const dotSizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1
        ${sizeClasses[size]}
        ${colorConfig.bg}
        ${colorConfig.text}
        font-medium rounded
        ${className}
      `}
    >
      {showDot && (
        <motion.span
          animate={pulse ? { scale: [1, 1.2, 1], opacity: [1, 0.7, 1] } : undefined}
          transition={pulse ? { duration: 2, repeat: Infinity } : undefined}
          className={`${dotSizeClasses[size]} ${colorConfig.dot} rounded-full`}
        />
      )}
      {displayLabel}
    </span>
  );
}

// Inline status dot only
interface StatusDotProps {
  status: StatusType | string;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  className?: string;
}

export function StatusDot({
  status,
  size = 'sm',
  pulse = false,
  className = '',
}: StatusDotProps) {
  const colorConfig = statusColors[status as StatusType] || statusColors.neutral;

  const sizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  return (
    <motion.span
      animate={pulse ? { scale: [1, 1.3, 1], opacity: [1, 0.6, 1] } : undefined}
      transition={pulse ? { duration: 2, repeat: Infinity } : undefined}
      className={`
        ${sizeClasses[size]}
        ${colorConfig.dot}
        rounded-full
        ${className}
      `}
    />
  );
}
