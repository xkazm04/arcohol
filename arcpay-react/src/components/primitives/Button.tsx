import React, { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { useTheme } from '../../theme';
import { Spinner } from './Spinner';

const buttonVariants = cva(
  'arcpay-button inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'arcpay-button--primary text-white',
        secondary: 'arcpay-button--secondary',
        outline: 'arcpay-button--outline border-2 bg-transparent',
        ghost: 'arcpay-button--ghost bg-transparent',
        danger: 'arcpay-button--danger text-white',
        success: 'arcpay-button--success text-white',
      },
      size: {
        sm: 'h-8 px-3 text-sm rounded',
        md: 'h-10 px-4 text-base rounded-md',
        lg: 'h-12 px-6 text-lg rounded-lg',
        xl: 'h-14 px-8 text-xl rounded-xl',
        icon: 'h-10 w-10 rounded-md',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading,
      leftIcon,
      rightIcon,
      disabled,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();

    const variantStyles: React.CSSProperties = {
      ...getVariantStyles(variant, theme),
      ...style,
    };

    return (
      <button
        ref={ref}
        className={clsx(buttonVariants({ variant, size, fullWidth }), className)}
        style={variantStyles}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Spinner size="sm" className="mr-2" />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

function getVariantStyles(
  variant: ButtonProps['variant'],
  theme: ReturnType<typeof useTheme>['theme']
): React.CSSProperties {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: theme.colors.primary,
        color: theme.colors.textInverse,
      };
    case 'secondary':
      return {
        backgroundColor: theme.colors.surface,
        color: theme.colors.text,
        borderColor: theme.colors.border,
      };
    case 'outline':
      return {
        borderColor: theme.colors.primary,
        color: theme.colors.primary,
      };
    case 'ghost':
      return {
        color: theme.colors.text,
      };
    case 'danger':
      return {
        backgroundColor: theme.colors.error,
        color: theme.colors.textInverse,
      };
    case 'success':
      return {
        backgroundColor: theme.colors.success,
        color: theme.colors.textInverse,
      };
    default:
      return {
        backgroundColor: theme.colors.primary,
        color: theme.colors.textInverse,
      };
  }
}
