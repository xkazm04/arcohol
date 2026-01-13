'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';
import { AccentColor, accentColors, accentClasses } from '../utils/colors';
import { cardEntrance } from '../utils/animations';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  accent?: AccentColor;
  variant?: 'default' | 'gradient' | 'outlined';
  showCorners?: boolean;
  showGrid?: boolean;
  hover?: boolean;
  delay?: number;
  className?: string;
}

export function Card({
  children,
  accent = 'cyan',
  variant = 'default',
  showCorners = true,
  showGrid = false,
  hover = false,
  delay = 0,
  className = '',
  ...props
}: CardProps) {
  const colors = accentColors[accent];
  const classes = accentClasses[accent];

  const variantClasses = {
    default: 'bg-slate-900/50 border border-slate-800/40',
    gradient: `bg-gradient-to-br ${classes.gradient} border ${classes.border}`,
    outlined: `bg-transparent border ${classes.border}`,
  };

  return (
    <motion.div
      variants={cardEntrance}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      whileHover={hover ? { y: -2, scale: 1.01 } : undefined}
      className={`
        relative overflow-hidden rounded-lg
        ${variantClasses[variant]}
        ${hover ? `${classes.shadowHover} transition-shadow duration-300` : ''}
        ${className}
      `}
      {...props}
    >
      {/* Grid pattern overlay */}
      {showGrid && (
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, ${colors.primary} 1px, transparent 1px), linear-gradient(to bottom, ${colors.primary} 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />
      )}

      {/* Corner markers */}
      {showCorners && (
        <>
          <div className={`absolute top-0 left-0 w-2.5 h-2.5 border-l-2 border-t-2 ${classes.border} rounded-tl pointer-events-none`} />
          <div className={`absolute top-0 right-0 w-2.5 h-2.5 border-r-2 border-t-2 ${classes.border} rounded-tr pointer-events-none`} />
          <div className={`absolute bottom-0 left-0 w-2.5 h-2.5 border-l-2 border-b-2 ${classes.border} rounded-bl pointer-events-none`} />
          <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-r-2 border-b-2 ${classes.border} rounded-br pointer-events-none`} />
        </>
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

// Card header component
interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, className = '' }: CardHeaderProps) {
  return (
    <div className={`px-3 py-2 border-b border-slate-800/40 flex items-center justify-between ${className}`}>
      <div>
        <div className="text-xs font-medium text-slate-400">{title}</div>
        {subtitle && <div className="text-[10px] text-slate-600">{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}

// Card body component
interface CardBodyProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function CardBody({ children, className = '', noPadding = false }: CardBodyProps) {
  return (
    <div className={`${noPadding ? '' : 'p-3'} ${className}`}>
      {children}
    </div>
  );
}

// Card footer component
interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`px-3 py-2 border-t border-slate-800/40 ${className}`}>
      {children}
    </div>
  );
}
