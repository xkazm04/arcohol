import React, { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { useTheme } from '../../theme';

const selectVariants = cva(
  'arcpay-select w-full appearance-none cursor-pointer transition-colors focus:outline-none',
  {
    variants: {
      variant: {
        default: 'arcpay-select--default',
        filled: 'arcpay-select--filled',
      },
      selectSize: {
        sm: 'h-8 px-3 pr-8 text-sm',
        md: 'h-10 px-4 pr-10 text-base',
        lg: 'h-12 px-4 pr-10 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      selectSize: 'md',
    },
  }
);

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof selectVariants> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  leftIcon?: ReactNode;
  isRequired?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      variant,
      selectSize,
      label,
      error,
      hint,
      options,
      placeholder,
      leftIcon,
      isRequired,
      id,
      style,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const selectId = id || `arcpay-select-${Math.random().toString(36).slice(2)}`;

    const selectStyles: React.CSSProperties = {
      backgroundColor: variant === 'filled' ? theme.colors.surfaceHover : theme.colors.background,
      border: `1px solid ${error ? theme.colors.borderError : theme.colors.border}`,
      borderRadius: theme.borderRadius.md,
      color: theme.colors.text,
      fontFamily: theme.fonts.body,
      transition: theme.transitions.fast,
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23${theme.colors.textMuted.replace('#', '')}'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 0.75rem center',
      backgroundSize: '1rem',
      ...style,
    };

    return (
      <div className="arcpay-select-wrapper">
        {label && (
          <label
            htmlFor={selectId}
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
        <div style={{ position: 'relative' }}>
          {leftIcon && (
            <div
              style={{
                position: 'absolute',
                left: theme.spacing.sm,
                top: '50%',
                transform: 'translateY(-50%)',
                color: theme.colors.textMuted,
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
              }}
            >
              {leftIcon}
            </div>
          )}
          <select
            ref={ref}
            id={selectId}
            className={clsx(selectVariants({ variant, selectSize }), className)}
            style={{
              ...selectStyles,
              paddingLeft: leftIcon ? theme.spacing.xl : undefined,
            }}
            aria-invalid={!!error}
            aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {error && (
          <p
            id={`${selectId}-error`}
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
            id={`${selectId}-hint`}
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

Select.displayName = 'Select';
