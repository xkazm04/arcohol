import React, { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn, mergeSlotClassNames, type SlotClassNames, type ClassNameStrategy } from '../../utils/cn';

// =============================================================================
// Types
// =============================================================================

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

/** Slots available for className customization */
export type ButtonSlot = 'root' | 'spinner' | 'content';

/** ClassNames for each button slot */
export type ButtonClassNames = SlotClassNames<ButtonSlot>;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant */
  variant?: ButtonVariant;
  /** Size preset */
  size?: ButtonSize;
  /** Full width button */
  fullWidth?: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Custom classNames for button slots */
  classNames?: ButtonClassNames;
  /** Strategy for merging classNames ('merge' or 'replace') */
  classNameStrategy?: ClassNameStrategy;
}

// =============================================================================
// Default ClassNames
// =============================================================================

const defaultClassNames: Record<ButtonSlot, string> = {
  root: 'arcpay-button',
  spinner: 'arcpay-button__spinner',
  content: 'arcpay-button__content',
};

// =============================================================================
// Component
// =============================================================================

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      disabled,
      className,
      classNames,
      classNameStrategy = 'merge',
      ...props
    },
    ref
  ) => {
    // Merge slot classNames
    const slots = mergeSlotClassNames(defaultClassNames, classNames, classNameStrategy);

    // Build root className
    const rootClassName = cn(
      slots.root,
      `arcpay-button--${variant}`,
      `arcpay-button--${size}`,
      {
        'arcpay-button--full-width': fullWidth,
        'arcpay-button--loading': isLoading,
        'arcpay-button--disabled': disabled || isLoading,
      },
      className
    );

    return (
      <button
        ref={ref}
        className={rootClassName}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className={slots.spinner} aria-hidden="true" />
        ) : (
          <span className={slots.content}>{children}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
