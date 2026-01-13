'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInUp } from '../utils/animations';

type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

interface AlertBannerProps {
  title?: string;
  children: ReactNode;
  variant?: AlertVariant;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const variantConfig = {
  info: {
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    icon: 'text-cyan-400',
    title: 'text-cyan-400',
    defaultIcon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  success: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: 'text-emerald-400',
    title: 'text-emerald-400',
    defaultIcon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  warning: {
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    icon: 'text-orange-400',
    title: 'text-orange-400',
    defaultIcon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  danger: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    icon: 'text-red-400',
    title: 'text-red-400',
    defaultIcon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

export function AlertBanner({
  title,
  children,
  variant = 'info',
  icon,
  action,
  dismissible = false,
  onDismiss,
  className = '',
}: AlertBannerProps) {
  const config = variantConfig[variant];

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: -10 }}
      className={`
        ${config.bg} ${config.border}
        border rounded-lg p-3
        ${className}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 ${config.icon}`}>
          {icon || config.defaultIcon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <div className={`text-xs font-medium ${config.title} mb-0.5`}>
              {title}
            </div>
          )}
          <div className="text-xs text-slate-400">{children}</div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {action && (
            <button
              onClick={action.onClick}
              className={`text-[10px] font-medium ${config.icon} hover:brightness-125 transition-all`}
            >
              {action.label}
            </button>
          )}

          {dismissible && onDismiss && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onDismiss}
              className="p-0.5 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Dismissible alert wrapper
interface DismissibleAlertProps extends Omit<AlertBannerProps, 'dismissible' | 'onDismiss'> {
  isVisible: boolean;
  onDismiss: () => void;
}

export function DismissibleAlert({ isVisible, onDismiss, ...props }: DismissibleAlertProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <AlertBanner {...props} dismissible onDismiss={onDismiss} />
      )}
    </AnimatePresence>
  );
}

// Inline toast-style notification
interface ToastProps {
  message: string;
  variant?: AlertVariant;
  isVisible: boolean;
  onDismiss: () => void;
}

export function Toast({ message, variant = 'info', isVisible, onDismiss }: ToastProps) {
  const config = variantConfig[variant];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className={`
            fixed bottom-4 right-4 z-50
            ${config.bg} ${config.border}
            border rounded-lg px-4 py-3 shadow-xl
            flex items-center gap-3
          `}
        >
          <span className={config.icon}>{config.defaultIcon}</span>
          <span className="text-sm text-white">{message}</span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onDismiss}
            className="p-1 text-slate-500 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
