'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, scaleIn } from '../utils/animations';
import { AccentColor, accentColors, accentClasses } from '../utils/colors';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  accent?: AccentColor;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  accent = 'cyan',
  action,
  secondaryAction,
  size = 'md',
  className = '',
}: EmptyStateProps) {
  const colors = accentColors[accent];
  const classes = accentClasses[accent];

  const sizeConfig = {
    sm: { padding: 'py-8', icon: 'w-10 h-10', title: 'text-sm', desc: 'text-xs' },
    md: { padding: 'py-12', icon: 'w-14 h-14', title: 'text-base', desc: 'text-sm' },
    lg: { padding: 'py-16', icon: 'w-20 h-20', title: 'text-lg', desc: 'text-base' },
  };

  const config = sizeConfig[size];

  return (
    <div className={`flex flex-col items-center justify-center text-center ${config.padding} ${className}`}>
      {/* Icon with glow */}
      {icon && (
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          className="relative mb-4"
        >
          {/* Glow effect */}
          <div
            className="absolute inset-0 blur-2xl opacity-30"
            style={{ backgroundColor: colors.primary }}
          />

          <div
            className={`
              relative ${config.icon} ${classes.bg} ${classes.border}
              border rounded-xl flex items-center justify-center
            `}
          >
            <div className={classes.text}>{icon}</div>
          </div>
        </motion.div>
      )}

      {/* Title */}
      <motion.h3
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
        className={`${config.title} font-semibold text-white mb-2`}
      >
        {title}
      </motion.h3>

      {/* Description */}
      {description && (
        <motion.p
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className={`${config.desc} text-slate-400 max-w-sm mb-4`}
        >
          {description}
        </motion.p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3"
        >
          {action && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={action.onClick}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium text-white
                bg-cyan-600 hover:bg-cyan-500
                transition-colors
              `}
            >
              {action.label}
            </motion.button>
          )}

          {secondaryAction && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={secondaryAction.onClick}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              {secondaryAction.label}
            </motion.button>
          )}
        </motion.div>
      )}
    </div>
  );
}

// Compact inline empty state
interface InlineEmptyProps {
  message: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function InlineEmpty({ message, icon, action, className = '' }: InlineEmptyProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex items-center justify-center gap-3 py-6 ${className}`}
    >
      {icon && <div className="text-slate-600">{icon}</div>}
      <span className="text-xs text-slate-500">{message}</span>
      {action && (
        <button
          onClick={action.onClick}
          className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
