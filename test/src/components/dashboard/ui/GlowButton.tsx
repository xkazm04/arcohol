'use client';

import { motion, useMotionValue, useSpring } from 'framer-motion';
import { ReactNode, MouseEvent, useRef } from 'react';
import { accentColors, AccentColor, accentClasses } from '../utils/colors';

interface GlowButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  accent?: AccentColor;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  magnetic?: boolean;
}

export function GlowButton({
  children,
  onClick,
  variant = 'primary',
  accent = 'cyan',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  type = 'button',
  magnetic = false,
}: GlowButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const colors = accentColors[accent];
  const classes = accentClasses[accent];

  // Magnetic effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (!magnetic || disabled) return;
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      x.set((e.clientX - centerX) * 0.15);
      y.set((e.clientY - centerY) * 0.15);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-[10px] gap-1',
    md: 'px-3 py-1.5 text-xs gap-1.5',
    lg: 'px-4 py-2 text-sm gap-2',
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  const variantClasses = {
    primary: `
      bg-cyan-600 hover:bg-cyan-500 text-white
      border border-cyan-500/50 hover:border-cyan-400/70
      shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40
    `,
    secondary: `
      bg-slate-800 hover:bg-slate-700 text-white
      border border-slate-700/50 hover:border-slate-600/70
    `,
    danger: `
      bg-red-600/20 hover:bg-red-600/30 text-red-400
      border border-red-500/30 hover:border-red-500/50
    `,
    ghost: `
      bg-transparent hover:bg-slate-800/50 text-slate-400 hover:text-white
      border border-transparent hover:border-slate-700/50
    `,
  };

  // Override with accent colors for primary variant
  const accentVariantClasses = variant === 'primary' ? `
    bg-gradient-to-br from-${accent}-600 to-${accent}-700
    hover:from-${accent}-500 hover:to-${accent}-600
    text-white
    border ${classes.border} hover:border-${accent}-400/70
    shadow-lg ${classes.shadow} ${classes.shadowHover}
  ` : '';

  return (
    <motion.button
      ref={buttonRef}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={magnetic ? { x: springX, y: springY } : undefined}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      className={`
        relative overflow-hidden
        inline-flex items-center justify-center
        font-medium rounded-lg
        transition-all duration-200
        ${sizeClasses[size]}
        ${variant === 'primary' && accent !== 'cyan' ? accentVariantClasses : variantClasses[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {/* Glass shine overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50 pointer-events-none rounded-lg" />

      {/* Content */}
      <span className="relative z-10 inline-flex items-center gap-inherit">
        {loading ? (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className={`${iconSizeClasses[size]} border-2 border-current border-t-transparent rounded-full`}
          />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <span className={iconSizeClasses[size]}>{icon}</span>
            )}
            {children}
            {icon && iconPosition === 'right' && (
              <span className={iconSizeClasses[size]}>{icon}</span>
            )}
          </>
        )}
      </span>
    </motion.button>
  );
}

// Icon-only button variant
interface IconButtonProps {
  icon: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  label?: string;
}

export function IconButton({
  icon,
  onClick,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  label,
}: IconButtonProps) {
  const sizeClasses = {
    sm: 'p-1 w-6 h-6',
    md: 'p-1.5 w-8 h-8',
    lg: 'p-2 w-10 h-10',
  };

  const variantClasses = {
    primary: 'bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-500/50',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700/50',
    danger: 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30',
    ghost: 'bg-transparent hover:bg-slate-800/50 text-slate-400 hover:text-white',
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={disabled ? undefined : { scale: 0.9 }}
      whileHover={disabled ? undefined : { scale: 1.1 }}
      aria-label={label}
      className={`
        inline-flex items-center justify-center
        rounded-lg transition-colors
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {loading ? (
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
        />
      ) : (
        icon
      )}
    </motion.button>
  );
}
