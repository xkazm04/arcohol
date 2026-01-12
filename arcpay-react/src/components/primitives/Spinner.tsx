import React, { type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { useTheme } from '../../theme';

const spinnerVariants = cva('arcpay-spinner inline-block animate-spin', {
  variants: {
    size: {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
      xl: 'w-12 h-12',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const sizeToPixels: Record<string, number> = {
  xs: 12,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
};

export interface SpinnerProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  color?: string;
  thickness?: number;
  label?: string;
}

export function Spinner({
  className,
  size,
  color,
  thickness = 2,
  label = 'Loading',
  style,
  ...props
}: SpinnerProps) {
  const { theme } = useTheme();
  const spinnerColor = color || theme.colors.primary;
  const pixelSize = sizeToPixels[size || 'md'];

  const spinnerStyles: React.CSSProperties = {
    width: pixelSize,
    height: pixelSize,
    borderRadius: '50%',
    border: `${thickness}px solid ${theme.colors.border}`,
    borderTopColor: spinnerColor,
    animation: 'arcpay-spin 0.75s linear infinite',
    ...style,
  };

  return (
    <>
      <style>
        {`
          @keyframes arcpay-spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <div
        className={clsx(spinnerVariants({ size }), className)}
        style={spinnerStyles}
        role="status"
        aria-label={label}
        {...props}
      >
        <span className="sr-only" style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', border: 0 }}>
          {label}
        </span>
      </div>
    </>
  );
}

// Loading overlay component
export interface LoadingOverlayProps {
  isLoading: boolean;
  label?: string;
  blur?: boolean;
  children: React.ReactNode;
}

export function LoadingOverlay({
  isLoading,
  label = 'Loading...',
  blur = true,
  children,
}: LoadingOverlayProps) {
  const { theme } = useTheme();

  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          filter: blur ? 'blur(2px)' : undefined,
          opacity: 0.5,
          pointerEvents: 'none',
        }}
      >
        {children}
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.overlay,
          borderRadius: theme.borderRadius.lg,
        }}
      >
        <Spinner size="lg" />
        <p
          style={{
            marginTop: theme.spacing.sm,
            color: theme.colors.textInverse,
            fontSize: theme.fontSizes.sm,
          }}
        >
          {label}
        </p>
      </div>
    </div>
  );
}
