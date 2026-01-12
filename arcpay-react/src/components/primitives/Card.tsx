import React, { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { useTheme } from '../../theme';

const cardVariants = cva('arcpay-card', {
  variants: {
    variant: {
      default: 'arcpay-card--default',
      outlined: 'arcpay-card--outlined',
      elevated: 'arcpay-card--elevated',
      filled: 'arcpay-card--filled',
    },
    padding: {
      none: 'p-0',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8',
    },
  },
  defaultVariants: {
    variant: 'default',
    padding: 'md',
  },
});

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  header?: ReactNode;
  footer?: ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, header, footer, children, style, ...props }, ref) => {
    const { theme } = useTheme();

    const cardStyles: React.CSSProperties = {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      border: variant === 'outlined' ? `1px solid ${theme.colors.border}` : undefined,
      boxShadow: variant === 'elevated' ? theme.shadows.md : undefined,
      transition: theme.transitions.normal,
      ...style,
    };

    return (
      <div
        ref={ref}
        className={clsx(cardVariants({ variant, padding }), className)}
        style={cardStyles}
        {...props}
      >
        {header && (
          <div
            className="arcpay-card__header"
            style={{
              borderBottom: `1px solid ${theme.colors.border}`,
              padding: theme.spacing.md,
              marginBottom: padding === 'none' ? 0 : undefined,
            }}
          >
            {header}
          </div>
        )}
        <div className="arcpay-card__body">{children}</div>
        {footer && (
          <div
            className="arcpay-card__footer"
            style={{
              borderTop: `1px solid ${theme.colors.border}`,
              padding: theme.spacing.md,
              marginTop: padding === 'none' ? 0 : undefined,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card sub-components
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, style, ...props }, ref) => {
    const { theme } = useTheme();

    return (
      <div
        ref={ref}
        className={clsx('arcpay-card-header', className)}
        style={{
          fontWeight: 600,
          fontSize: theme.fontSizes.lg,
          color: theme.colors.text,
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Component = 'h3', children, style, ...props }, ref) => {
    const { theme } = useTheme();

    return (
      <Component
        ref={ref}
        className={clsx('arcpay-card-title', className)}
        style={{
          fontFamily: theme.fonts.heading,
          fontWeight: 600,
          fontSize: theme.fontSizes.xl,
          color: theme.colors.text,
          margin: 0,
          ...style,
        }}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

CardTitle.displayName = 'CardTitle';

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, children, style, ...props }, ref) => {
    const { theme } = useTheme();

    return (
      <p
        ref={ref}
        className={clsx('arcpay-card-description', className)}
        style={{
          fontSize: theme.fontSizes.sm,
          color: theme.colors.textSecondary,
          margin: `${theme.spacing.xs} 0 0`,
          ...style,
        }}
        {...props}
      >
        {children}
      </p>
    );
  }
);

CardDescription.displayName = 'CardDescription';
