'use client';

import { ReactNode, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { slideInRight, backdropFade } from '../utils/animations';
import { AccentColor, accentClasses } from '../utils/colors';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  accent?: AccentColor;
  showCorners?: boolean;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  accent = 'cyan',
  showCorners = true,
  className = '',
}: ModalProps) {
  const classes = accentClasses[accent];

  const sizeClasses = {
    sm: 'max-w-xs',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            variants={backdropFade}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal panel */}
          <motion.div
            variants={slideInRight}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className={`
              relative w-full ${sizeClasses[size]} m-4
              bg-slate-900 border border-slate-800 rounded-lg
              shadow-2xl shadow-black/50
              max-h-[85vh] flex flex-col
              ${className}
            `}
          >
            {/* Corner markers */}
            {showCorners && (
              <>
                <div className={`absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 ${classes.border} rounded-tl pointer-events-none`} />
                <div className={`absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 ${classes.border} rounded-tr pointer-events-none`} />
                <div className={`absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 ${classes.border} rounded-bl pointer-events-none`} />
                <div className={`absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 ${classes.border} rounded-br pointer-events-none`} />
              </>
            )}

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 flex-shrink-0">
              <div>
                <motion.h2
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-sm font-semibold text-white"
                >
                  {title}
                </motion.h2>
                {subtitle && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="text-[10px] text-slate-500 mt-0.5"
                  >
                    {subtitle}
                  </motion.p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-800 flex-shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Confirmation modal variant
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}: ConfirmModalProps) {
  const variantConfig = {
    danger: { accent: 'red' as AccentColor, buttonClass: 'bg-red-600 hover:bg-red-500' },
    warning: { accent: 'amber' as AccentColor, buttonClass: 'bg-amber-600 hover:bg-amber-500' },
    info: { accent: 'cyan' as AccentColor, buttonClass: 'bg-cyan-600 hover:bg-cyan-500' },
  };

  const config = variantConfig[variant];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      accent={config.accent}
      size="sm"
      footer={
        <>
          <button
            onClick={onClose}
            disabled={loading}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-3 py-1.5 ${config.buttonClass} text-white text-xs font-medium rounded transition-colors disabled:opacity-50 flex items-center gap-2`}
          >
            {loading && (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-3 h-3 border-2 border-white border-t-transparent rounded-full"
              />
            )}
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm text-slate-400">{message}</p>
    </Modal>
  );
}
