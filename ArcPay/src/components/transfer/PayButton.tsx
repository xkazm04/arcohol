import React, { type ReactNode } from 'react';
import { usePayButtonHeadless } from '../../headless';
import type { PayButtonRenderProps } from '../../headless/types';
import { Button, type ButtonVariant, type ButtonSize } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner';
import { cn, mergeSlotClassNames, type SlotClassNames, type ClassNameStrategy } from '../../utils/cn';
import type { Transaction } from '../../types';

// =============================================================================
// Types
// =============================================================================

/** Slots available for className customization */
export type PayButtonSlot =
  | 'root'
  | 'content'
  | 'icon'
  | 'modal'
  | 'confirmAmount'
  | 'confirmRecipient'
  | 'confirmDescription'
  | 'confirmActions'
  | 'confirmButton'
  | 'cancelButton';

/** ClassNames for each slot */
export type PayButtonClassNames = SlotClassNames<PayButtonSlot>;

export interface PayButtonProps {
  /** Amount to pay */
  amount: number | string;
  /** Recipient address or email */
  recipient: string;
  /** Payment description/memo */
  description?: string;
  /** Called on successful payment */
  onSuccess?: (tx: Transaction) => void;
  /** Called on payment error */
  onError?: (error: Error) => void;
  /** Button variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Full width button */
  fullWidth?: boolean;
  /** Additional class name */
  className?: string;
  /** Custom classNames for slots */
  classNames?: PayButtonClassNames;
  /** Strategy for merging classNames */
  classNameStrategy?: ClassNameStrategy;
  /** Custom button content */
  children?: ReactNode | ((props: PayButtonRenderProps) => ReactNode);
  /** Custom icon */
  icon?: ReactNode;
  /** Enable headless mode */
  headless?: boolean;
  /** Hide confirmation modal (for headless implementations) */
  skipConfirmation?: boolean;
}

// =============================================================================
// Default ClassNames
// =============================================================================

const defaultClassNames: Record<PayButtonSlot, string> = {
  root: 'arcpay-pay-button',
  content: 'arcpay-pay-button__content',
  icon: 'arcpay-pay-button__icon',
  modal: 'arcpay-confirm',
  confirmAmount: 'arcpay-confirm__amount',
  confirmRecipient: 'arcpay-confirm__recipient',
  confirmDescription: 'arcpay-confirm__description',
  confirmActions: 'arcpay-confirm__actions',
  confirmButton: 'arcpay-confirm__button--confirm',
  cancelButton: 'arcpay-confirm__button--cancel',
};

// =============================================================================
// Component
// =============================================================================

/**
 * Payment button component with confirmation modal
 *
 * @example Basic usage
 * ```tsx
 * <PayButton
 *   amount={99.99}
 *   recipient="merchant@store.com"
 *   onSuccess={(tx) => console.log('Paid!', tx)}
 * />
 * ```
 *
 * @example With custom classNames (Tailwind)
 * ```tsx
 * <PayButton
 *   amount={50}
 *   recipient="0x..."
 *   classNames={{
 *     root: 'bg-green-600 hover:bg-green-700 rounded-xl',
 *     confirmAmount: 'text-4xl font-bold text-green-600',
 *     confirmButton: 'bg-green-600',
 *   }}
 * />
 * ```
 *
 * @example Headless mode (complete control)
 * ```tsx
 * <PayButton
 *   amount={25}
 *   recipient="0x..."
 *   headless
 * >
 *   {({ isProcessing, formattedAmount, initiatePayment, isConfirmOpen, confirmPayment, cancelPayment }) => (
 *     <>
 *       <button onClick={initiatePayment} disabled={isProcessing}>
 *         {isProcessing ? 'Processing...' : `Pay ${formattedAmount}`}
 *       </button>
 *
 *       {isConfirmOpen && (
 *         <MyCustomModal>
 *           <p>Confirm {formattedAmount}?</p>
 *           <button onClick={confirmPayment}>Yes</button>
 *           <button onClick={cancelPayment}>No</button>
 *         </MyCustomModal>
 *       )}
 *     </>
 *   )}
 * </PayButton>
 * ```
 */
export function PayButton({
  amount,
  recipient,
  description,
  onSuccess,
  onError,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  classNames,
  classNameStrategy = 'merge',
  children,
  icon,
  headless = false,
  skipConfirmation = false,
}: PayButtonProps) {
  const renderProps = usePayButtonHeadless({
    amount,
    recipient,
    description,
    onSuccess,
    onError,
  });

  const {
    isConnected,
    isProcessing,
    isConfirmOpen,
    formattedAmount,
    initiatePayment,
    confirmPayment,
    cancelPayment,
  } = renderProps;

  // Headless mode - call children as render function
  if (headless && typeof children === 'function') {
    return <>{children(renderProps)}</>;
  }

  // Merge slot classNames
  const slots = mergeSlotClassNames(defaultClassNames, classNames, classNameStrategy);

  const handleClick = async () => {
    if (skipConfirmation && isConnected) {
      await confirmPayment();
    } else {
      await initiatePayment();
    }
  };

  // Render content
  const buttonContent =
    typeof children === 'function' ? null : children || `Pay ${formattedAmount}`;

  return (
    <>
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        onClick={handleClick}
        disabled={isProcessing}
        className={cn(slots.root, className)}
      >
        {isProcessing ? (
          <Spinner size="sm" />
        ) : (
          <span className={slots.content}>
            {icon && <span className={slots.icon}>{icon}</span>}
            {buttonContent}
          </span>
        )}
      </Button>

      {!skipConfirmation && (
        <Modal
          isOpen={isConfirmOpen}
          onClose={cancelPayment}
          title="Confirm Payment"
        >
          <div className={slots.modal}>
            <p className={slots.confirmAmount}>{formattedAmount}</p>
            <p className={slots.confirmRecipient}>To: {recipient}</p>
            {description && (
              <p className={slots.confirmDescription}>{description}</p>
            )}

            <div className={slots.confirmActions}>
              <Button
                variant="outline"
                onClick={cancelPayment}
                className={slots.cancelButton}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={confirmPayment}
                disabled={isProcessing}
                className={slots.confirmButton}
              >
                {isProcessing ? <Spinner size="sm" /> : 'Confirm Payment'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
