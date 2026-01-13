'use client';

import { motion } from 'framer-motion';
import { spinnerRotate } from '../utils/animations';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

export function LoadingSpinner({
  size = 'md',
  message,
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-14 h-14 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 p-6 ${className}`}>
      <motion.div
        variants={spinnerRotate}
        animate="animate"
        className={`
          ${sizeClasses[size]}
          border-cyan-500/30 border-t-cyan-500
          rounded-full
        `}
      />

      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xs text-slate-400 font-mono"
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}

// Inline spinner for buttons and small areas
interface InlineSpinnerProps {
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export function InlineSpinner({ size = 'sm', className = '' }: InlineSpinnerProps) {
  const sizeClasses = {
    xs: 'w-3 h-3 border',
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2',
  };

  return (
    <motion.span
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={`
        inline-block
        ${sizeClasses[size]}
        border-current border-t-transparent
        rounded-full
        ${className}
      `}
    />
  );
}

// Full page loading overlay
interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = 'Loading...' }: LoadingOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm"
    >
      <LoadingSpinner size="lg" message={message} />
    </motion.div>
  );
}

// Skeleton loader for content placeholders
interface SkeletonProps {
  width?: string;
  height?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
}

export function Skeleton({
  width = '100%',
  height = '1rem',
  rounded = 'md',
  className = '',
}: SkeletonProps) {
  const roundedClasses = {
    sm: 'rounded-sm',
    md: 'rounded',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      className={`bg-slate-800 ${roundedClasses[rounded]} ${className}`}
      style={{ width, height }}
    />
  );
}
