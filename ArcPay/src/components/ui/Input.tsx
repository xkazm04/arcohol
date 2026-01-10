import React, { type InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `arcpay-input-${Math.random().toString(36).slice(2)}`;
    const hasError = !!error;

    return (
      <div className={`arcpay-input-wrapper ${className}`}>
        {label && (
          <label htmlFor={inputId} className="arcpay-input__label">
            {label}
          </label>
        )}
        <div
          className={`arcpay-input__container ${
            hasError ? 'arcpay-input__container--error' : ''
          }`}
        >
          {leftIcon && (
            <span className="arcpay-input__icon arcpay-input__icon--left">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className="arcpay-input"
            aria-invalid={hasError}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            {...props}
          />
          {rightIcon && (
            <span className="arcpay-input__icon arcpay-input__icon--right">
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="arcpay-input__error">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="arcpay-input__hint">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
