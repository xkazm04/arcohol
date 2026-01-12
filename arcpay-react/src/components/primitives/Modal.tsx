import React, {
  forwardRef,
  useEffect,
  useCallback,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { useTheme } from '../../theme';

const modalVariants = cva('arcpay-modal', {
  variants: {
    size: {
      sm: 'arcpay-modal--sm',
      md: 'arcpay-modal--md',
      lg: 'arcpay-modal--lg',
      xl: 'arcpay-modal--xl',
      full: 'arcpay-modal--full',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const sizeToWidth: Record<string, string> = {
  sm: '400px',
  md: '500px',
  lg: '700px',
  xl: '900px',
  full: '100%',
};

export interface ModalProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modalVariants> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  footer?: ReactNode;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      className,
      size,
      isOpen,
      onClose,
      title,
      description,
      footer,
      closeOnOverlayClick = true,
      closeOnEsc = true,
      showCloseButton = true,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();

    const handleEscKey = useCallback(
      (e: KeyboardEvent) => {
        if (closeOnEsc && e.key === 'Escape') {
          onClose();
        }
      },
      [closeOnEsc, onClose]
    );

    const handleOverlayClick = useCallback(
      (e: React.MouseEvent) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
          onClose();
        }
      },
      [closeOnOverlayClick, onClose]
    );

    useEffect(() => {
      if (isOpen) {
        document.addEventListener('keydown', handleEscKey);
        document.body.style.overflow = 'hidden';
      }

      return () => {
        document.removeEventListener('keydown', handleEscKey);
        document.body.style.overflow = '';
      };
    }, [isOpen, handleEscKey]);

    if (!isOpen) return null;

    const overlayStyles: React.CSSProperties = {
      position: 'fixed',
      inset: 0,
      backgroundColor: theme.colors.overlay,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.md,
      zIndex: 9999,
    };

    const modalStyles: React.CSSProperties = {
      backgroundColor: theme.colors.background,
      borderRadius: size === 'full' ? 0 : theme.borderRadius.xl,
      boxShadow: theme.shadows.xl,
      width: '100%',
      maxWidth: sizeToWidth[size || 'md'],
      maxHeight: size === 'full' ? '100%' : '90vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      ...style,
    };

    const headerStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      padding: theme.spacing.lg,
      borderBottom: `1px solid ${theme.colors.border}`,
    };

    const bodyStyles: React.CSSProperties = {
      padding: theme.spacing.lg,
      overflowY: 'auto',
      flex: 1,
    };

    const footerStyles: React.CSSProperties = {
      padding: theme.spacing.lg,
      borderTop: `1px solid ${theme.colors.border}`,
      display: 'flex',
      justifyContent: 'flex-end',
      gap: theme.spacing.sm,
    };

    return (
      <div
        className="arcpay-modal-overlay"
        style={overlayStyles}
        onClick={handleOverlayClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'arcpay-modal-title' : undefined}
        aria-describedby={description ? 'arcpay-modal-description' : undefined}
      >
        <div
          ref={ref}
          className={clsx(modalVariants({ size }), className)}
          style={modalStyles}
          {...props}
        >
          {(title || showCloseButton) && (
            <div style={headerStyles}>
              <div>
                {title && (
                  <h2
                    id="arcpay-modal-title"
                    style={{
                      margin: 0,
                      fontSize: theme.fontSizes.xl,
                      fontWeight: 600,
                      color: theme.colors.text,
                    }}
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p
                    id="arcpay-modal-description"
                    style={{
                      margin: `${theme.spacing.xs} 0 0`,
                      fontSize: theme.fontSizes.sm,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    {description}
                  </p>
                )}
              </div>
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: theme.spacing.xs,
                    color: theme.colors.textMuted,
                    fontSize: theme.fontSizes.xl,
                    lineHeight: 1,
                  }}
                  aria-label="Close modal"
                >
                  &times;
                </button>
              )}
            </div>
          )}
          <div style={bodyStyles}>{children}</div>
          {footer && <div style={footerStyles}>{footer}</div>}
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal';
