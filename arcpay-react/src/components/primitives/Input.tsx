import React, { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { useTheme } from '../../theme';

const inputVariants = cva(
  'arcpay-input w-full transition-colors focus:outline-none',
  {
    variants: {
      variant: {
        default: 'arcpay-input--default',
        filled: 'arcpay-input--filled',
        flushed: 'arcpay-input--flushed border-b border-l-0 border-r-0 border-t-0 rounded-none px-0',
      },
      inputSize: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-4 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
    },
  }
);

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  hint?: string;
  leftAddon?: ReactNode;
  rightAddon?: ReactNode;
  isRequired?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      inputSize,
      label,
      error,
      hint,
      leftAddon,
      rightAddon,
      isRequired,
      id,
      style,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const inputId = id || `arcpay-input-${Math.random().toString(36).slice(2)}`;

    const inputStyles: React.CSSProperties = {
      backgroundColor: variant === 'filled' ? theme.colors.surfaceHover : theme.colors.background,
      border: variant !== 'flushed' ? `1px solid ${error ? theme.colors.borderError : theme.colors.border}` : undefined,
      borderColor: variant === 'flushed' ? (error ? theme.colors.borderError : theme.colors.border) : undefined,
      borderRadius: variant !== 'flushed' ? theme.borderRadius.md : undefined,
      color: theme.colors.text,
      fontFamily: theme.fonts.body,
      transition: theme.transitions.fast,
      ...style,
    };

    return (
      <div className="arcpay-input-wrapper">
        {label && (
          <label
            htmlFor={inputId}
            style={{
              display: 'block',
              marginBottom: theme.spacing.xs,
              fontSize: theme.fontSizes.sm,
              fontWeight: 500,
              color: theme.colors.text,
            }}
          >
            {label}
            {isRequired && (
              <span style={{ color: theme.colors.error, marginLeft: '2px' }}>*</span>
            )}
          </label>
        )}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {leftAddon && (
            <div
              style={{
                position: 'absolute',
                left: theme.spacing.sm,
                color: theme.colors.textMuted,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {leftAddon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(inputVariants({ variant, inputSize }), className)}
            style={{
              ...inputStyles,
              paddingLeft: leftAddon ? theme.spacing.xl : undefined,
              paddingRight: rightAddon ? theme.spacing.xl : undefined,
            }}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          {rightAddon && (
            <div
              style={{
                position: 'absolute',
                right: theme.spacing.sm,
                color: theme.colors.textMuted,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {rightAddon}
            </div>
          )}
        </div>
        {error && (
          <p
            id={`${inputId}-error`}
            style={{
              marginTop: theme.spacing.xs,
              fontSize: theme.fontSizes.sm,
              color: theme.colors.error,
            }}
            role="alert"
          >
            {error}
          </p>
        )}
        {hint && !error && (
          <p
            id={`${inputId}-hint`}
            style={{
              marginTop: theme.spacing.xs,
              fontSize: theme.fontSizes.sm,
              color: theme.colors.textMuted,
            }}
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Textarea component
export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  isRequired?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, isRequired, id, style, ...props }, ref) => {
    const { theme } = useTheme();
    const textareaId = id || `arcpay-textarea-${Math.random().toString(36).slice(2)}`;

    const textareaStyles: React.CSSProperties = {
      width: '100%',
      minHeight: '100px',
      padding: theme.spacing.sm,
      backgroundColor: theme.colors.background,
      border: `1px solid ${error ? theme.colors.borderError : theme.colors.border}`,
      borderRadius: theme.borderRadius.md,
      color: theme.colors.text,
      fontFamily: theme.fonts.body,
      fontSize: theme.fontSizes.md,
      resize: 'vertical',
      transition: theme.transitions.fast,
      ...style,
    };

    return (
      <div className="arcpay-textarea-wrapper">
        {label && (
          <label
            htmlFor={textareaId}
            style={{
              display: 'block',
              marginBottom: theme.spacing.xs,
              fontSize: theme.fontSizes.sm,
              fontWeight: 500,
              color: theme.colors.text,
            }}
          >
            {label}
            {isRequired && (
              <span style={{ color: theme.colors.error, marginLeft: '2px' }}>*</span>
            )}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={clsx('arcpay-textarea', className)}
          style={textareaStyles}
          aria-invalid={!!error}
          aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${textareaId}-error`}
            style={{
              marginTop: theme.spacing.xs,
              fontSize: theme.fontSizes.sm,
              color: theme.colors.error,
            }}
            role="alert"
          >
            {error}
          </p>
        )}
        {hint && !error && (
          <p
            id={`${textareaId}-hint`}
            style={{
              marginTop: theme.spacing.xs,
              fontSize: theme.fontSizes.sm,
              color: theme.colors.textMuted,
            }}
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
