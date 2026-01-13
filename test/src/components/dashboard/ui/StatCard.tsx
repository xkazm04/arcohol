'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { accentColors, AccentColor, accentClasses } from '../utils/colors';
import { cardEntrance } from '../utils/animations';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  icon?: ReactNode;
  accent?: AccentColor;
  href?: string;
  delay?: number;
  size?: 'sm' | 'md' | 'lg';
  showGrid?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  subValue,
  trend,
  icon,
  accent = 'cyan',
  href,
  delay = 0,
  size = 'md',
  showGrid = true,
  className = '',
}: StatCardProps) {
  const colors = accentColors[accent];
  const classes = accentClasses[accent];

  const sizeClasses = {
    sm: 'p-2.5',
    md: 'p-3',
    lg: 'p-4',
  };

  const valueSizeClasses = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const content = (
    <motion.div
      variants={cardEntrance}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      whileHover={href ? { scale: 1.02, y: -2 } : undefined}
      className={`
        relative overflow-hidden rounded-lg
        bg-slate-900/50 border border-slate-800/40
        ${href ? `cursor-pointer ${classes.borderHover} ${classes.shadowHover}` : ''}
        transition-all duration-300
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {/* Grid pattern overlay */}
      {showGrid && (
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, ${colors.primary} 1px, transparent 1px), linear-gradient(to bottom, ${colors.primary} 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />
      )}

      {/* Corner markers */}
      <div className={`absolute top-0 left-0 w-2.5 h-2.5 border-l-2 border-t-2 ${classes.border} rounded-tl`} />
      <div className={`absolute top-0 right-0 w-2.5 h-2.5 border-r-2 border-t-2 ${classes.border} rounded-tr`} />
      <div className={`absolute bottom-0 left-0 w-2.5 h-2.5 border-l-2 border-b-2 ${classes.border} rounded-bl`} />
      <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-r-2 border-b-2 ${classes.border} rounded-br`} />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">{label}</div>
            <div
              className={`${valueSizeClasses[size]} font-bold text-white font-mono`}
              style={{ textShadow: `0 0 20px ${colors.glow}` }}
            >
              {value}
            </div>
            {subValue && (
              <div className="text-[10px] text-slate-500 mt-0.5">{subValue}</div>
            )}
          </div>

          {icon && (
            <motion.div
              whileHover={{ scale: 1.1 }}
              className={`p-2 rounded-lg ${classes.bg} border ${classes.border}`}
            >
              <div className={classes.text}>{icon}</div>
            </motion.div>
          )}
        </div>

        {trend && (
          <motion.div
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.2 }}
            className="flex items-center gap-1 mt-2"
          >
            <span
              className={`text-[10px] font-medium ${
                trend.positive ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {trend.positive ? '↑' : '↓'} {trend.value}
            </span>
          </motion.div>
        )}
      </div>

      {/* Hover glow effect */}
      {href && (
        <div
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${colors.bg} 0%, transparent 70%)`,
          }}
        />
      )}
    </motion.div>
  );

  if (href) {
    return <a href={href}>{content}</a>;
  }

  return content;
}

// Hero variant for large feature stats
interface HeroStatCardProps extends StatCardProps {
  children?: ReactNode;
}

export function HeroStatCard({
  label,
  value,
  subValue,
  icon,
  accent = 'cyan',
  delay = 0,
  children,
  className = '',
}: HeroStatCardProps) {
  const colors = accentColors[accent];
  const classes = accentClasses[accent];

  return (
    <motion.div
      variants={cardEntrance}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      className={`
        relative overflow-hidden rounded-lg
        bg-gradient-to-br ${classes.gradient}
        border ${classes.border}
        p-4
        ${className}
      `}
    >
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, ${colors.primary} 1px, transparent 1px), linear-gradient(to bottom, ${colors.primary} 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Ambient glow */}
      <div
        className="absolute -top-20 -right-20 w-40 h-40 opacity-20 blur-3xl"
        style={{ backgroundColor: colors.primary }}
      />

      {/* Corner markers */}
      <div className={`absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 ${classes.border} rounded-tl`} />
      <div className={`absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 ${classes.border} rounded-tr`} />
      <div className={`absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 ${classes.border} rounded-bl`} />
      <div className={`absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 ${classes.border} rounded-br`} />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{label}</div>
            <div
              className="text-2xl font-bold text-white font-mono"
              style={{ textShadow: `0 0 30px ${colors.glowStrong}` }}
            >
              {value}
            </div>
            {subValue && (
              <div className="text-xs text-slate-400 mt-1">{subValue}</div>
            )}
          </div>

          {icon && (
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className={`p-3 rounded-lg ${classes.bg} border ${classes.border}`}
            >
              <div className={classes.text}>{icon}</div>
            </motion.div>
          )}
        </div>

        {children && <div className="mt-4">{children}</div>}
      </div>
    </motion.div>
  );
}
