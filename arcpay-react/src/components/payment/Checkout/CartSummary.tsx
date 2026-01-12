import React from 'react';
import { useTheme } from '../../../theme';
import type { CartSummaryProps, CartItem } from './types';

/**
 * Format currency amount
 */
function formatAmount(amount: number, currency: string): string {
  return `${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

/**
 * Cart item row
 */
function CartItemRow({
  item,
  currency,
  onRemove,
  onUpdateQuantity,
  editable,
}: {
  item: CartItem;
  currency: string;
  onRemove?: () => void;
  onUpdateQuantity?: (quantity: number) => void;
  editable?: boolean;
}) {
  const { theme } = useTheme();
  const lineTotal = item.price * item.quantity;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: theme.spacing.md,
        padding: `${theme.spacing.sm} 0`,
        borderBottom: `1px solid ${theme.colors.border}`,
      }}
    >
      {item.image && (
        <img
          src={item.image}
          alt={item.name}
          style={{
            width: 48,
            height: 48,
            objectFit: 'cover',
            borderRadius: theme.borderRadius.md,
          }}
        />
      )}
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontWeight: 500,
                color: theme.colors.text,
                fontSize: theme.fontSizes.md,
              }}
            >
              {item.name}
            </p>
            {item.description && (
              <p
                style={{
                  margin: `${theme.spacing.xs} 0 0`,
                  color: theme.colors.textSecondary,
                  fontSize: theme.fontSizes.sm,
                }}
              >
                {item.description}
              </p>
            )}
          </div>
          <p
            style={{
              margin: 0,
              fontWeight: 600,
              color: theme.colors.text,
              fontSize: theme.fontSizes.md,
            }}
          >
            {formatAmount(lineTotal, currency)}
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.sm,
            marginTop: theme.spacing.xs,
          }}
        >
          <span
            style={{
              color: theme.colors.textMuted,
              fontSize: theme.fontSizes.sm,
            }}
          >
            {formatAmount(item.price, currency)} x
          </span>
          {editable && onUpdateQuantity ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}>
              <button
                type="button"
                onClick={() => onUpdateQuantity(Math.max(0, item.quantity - 1))}
                style={{
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.colors.surface,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.borderRadius.sm,
                  cursor: 'pointer',
                  color: theme.colors.text,
                }}
              >
                -
              </button>
              <span
                style={{
                  minWidth: 24,
                  textAlign: 'center',
                  fontSize: theme.fontSizes.sm,
                  color: theme.colors.text,
                }}
              >
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => onUpdateQuantity(item.quantity + 1)}
                style={{
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.colors.surface,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: theme.borderRadius.sm,
                  cursor: 'pointer',
                  color: theme.colors.text,
                }}
              >
                +
              </button>
            </div>
          ) : (
            <span
              style={{
                color: theme.colors.textMuted,
                fontSize: theme.fontSizes.sm,
              }}
            >
              {item.quantity}
            </span>
          )}
          {editable && onRemove && (
            <button
              type="button"
              onClick={onRemove}
              style={{
                marginLeft: 'auto',
                padding: theme.spacing.xs,
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: theme.colors.error,
                fontSize: theme.fontSizes.sm,
              }}
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Cart summary component
 */
export function CartSummary({
  items,
  currency,
  onRemoveItem,
  onUpdateQuantity,
  editable = false,
}: CartSummaryProps) {
  const { theme } = useTheme();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (items.length === 0) {
    return (
      <div
        style={{
          padding: theme.spacing.xl,
          textAlign: 'center',
          color: theme.colors.textMuted,
        }}
      >
        <p style={{ margin: 0 }}>Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="arcpay-cart-summary">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.md,
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: theme.fontSizes.lg,
            fontWeight: 600,
            color: theme.colors.text,
          }}
        >
          Order Summary
        </h3>
        <span
          style={{
            fontSize: theme.fontSizes.sm,
            color: theme.colors.textSecondary,
          }}
        >
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div>
        {items.map((item, index) => (
          <CartItemRow
            key={item.id || index}
            item={item}
            currency={currency}
            onRemove={
              editable && onRemoveItem && item.id
                ? () => onRemoveItem(item.id!)
                : undefined
            }
            onUpdateQuantity={
              editable && onUpdateQuantity && item.id
                ? (qty) => onUpdateQuantity(item.id!, qty)
                : undefined
            }
            editable={editable}
          />
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: theme.spacing.md,
          paddingTop: theme.spacing.md,
          borderTop: `2px solid ${theme.colors.border}`,
        }}
      >
        <span
          style={{
            fontSize: theme.fontSizes.lg,
            fontWeight: 600,
            color: theme.colors.text,
          }}
        >
          Subtotal
        </span>
        <span
          style={{
            fontSize: theme.fontSizes.xl,
            fontWeight: 700,
            color: theme.colors.text,
          }}
        >
          {formatAmount(subtotal, currency)}
        </span>
      </div>
    </div>
  );
}
