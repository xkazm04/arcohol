import React, { useEffect, useCallback, type PropsWithChildren } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
  /** Additional CSS class name for the modal */
  className?: string;
}

export function Modal({
  children,
  isOpen,
  onClose,
  title,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
  className,
}: PropsWithChildren<ModalProps>) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
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

  if (!isOpen) return null;

  return (
    <div className="arcpay-modal-overlay" onClick={closeOnOverlayClick ? onClose : undefined}>
      <div
        className={`arcpay-modal arcpay-modal--${size}${className ? ` ${className}` : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'arcpay-modal-title' : undefined}
      >
        {(title || showCloseButton) && (
          <div className="arcpay-modal__header">
            {title && (
              <h2 id="arcpay-modal-title" className="arcpay-modal__title">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                className="arcpay-modal__close"
                onClick={onClose}
                aria-label="Close modal"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
        <div className="arcpay-modal__content">{children}</div>
      </div>
    </div>
  );
}
