import React, { type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { useTheme } from '../../theme';

const badgeVariants = cva(
  'arcpay-badge inline-flex items-center font-medium',
  {
    variants: {
      variant: {
        default: 'arcpay-badge--default',
        primary: 'arcpay-badge--primary',
        success: 'arcpay-badge--success',
        warning: 'arcpay-badge--warning',
        error: 'arcpay-badge--error',
        info: 'arcpay-badge--info',
        outline: 'arcpay-badge--outline',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-sm',
        lg: 'px-3 py-1 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({
  className,
  variant,
  size,
  dot,
  children,
  style,
  ...props
}: BadgeProps) {
  const { theme } = useTheme();

  const variantStyles = getVariantStyles(variant, theme);

  const badgeStyles: React.CSSProperties = {
    borderRadius: theme.borderRadius.full,
    ...variantStyles,
    ...style,
  };

  return (
    <span
      className={clsx(badgeVariants({ variant, size }), className)}
      style={badgeStyles}
      {...props}
    >
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'currentColor',
            marginRight: theme.spacing.xs,
          }}
        />
      )}
      {children}
    </span>
  );
}

function getVariantStyles(
  variant: BadgeProps['variant'],
  theme: ReturnType<typeof useTheme>['theme']
): React.CSSProperties {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: theme.colors.primary,
        color: theme.colors.textInverse,
      };
    case 'success':
      return {
        backgroundColor: theme.colors.successLight,
        color: theme.colors.success,
      };
    case 'warning':
      return {
        backgroundColor: theme.colors.warningLight,
        color: theme.colors.warning,
      };
    case 'error':
      return {
        backgroundColor: theme.colors.errorLight,
        color: theme.colors.error,
      };
    case 'info':
      return {
        backgroundColor: theme.colors.infoLight,
        color: theme.colors.info,
      };
    case 'outline':
      return {
        backgroundColor: 'transparent',
        border: `1px solid ${theme.colors.border}`,
        color: theme.colors.text,
      };
    default:
      return {
        backgroundColor: theme.colors.surface,
        color: theme.colors.textSecondary,
      };
  }
}

// Status badge - semantic variant
export type StatusType = 'pending' | 'processing' | 'confirmed' | 'failed' | 'expired' | 'refunded';

export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: StatusType;
}

const statusToVariant: Record<StatusType, BadgeProps['variant']> = {
  pending: 'warning',
  processing: 'info',
  confirmed: 'success',
  failed: 'error',
  expired: 'default',
  refunded: 'default',
};

const statusLabels: Record<StatusType, string> = {
  pending: 'Pending',
  processing: 'Processing',
  confirmed: 'Confirmed',
  failed: 'Failed',
  expired: 'Expired',
  refunded: 'Refunded',
};

export function StatusBadge({ status, children, ...props }: StatusBadgeProps) {
  return (
    <Badge variant={statusToVariant[status]} dot {...props}>
      {children || statusLabels[status]}
    </Badge>
  );
}
