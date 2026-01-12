import React from 'react';
import { useTheme } from '../../theme';
import { Card } from '../primitives/Card';
import type { UsageDisplayProps, UsageData } from './types';

/**
 * Format date for display
 */
function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Usage meter component
 */
function UsageMeter({
  data,
  showPercentage = true,
}: {
  data: UsageData;
  showPercentage?: boolean;
}) {
  const { theme } = useTheme();
  const percentage = Math.min(100, (data.used / data.limit) * 100);
  const isNearLimit = percentage >= 80;
  const isOverLimit = percentage >= 100;

  const barColor = isOverLimit
    ? theme.colors.error
    : isNearLimit
    ? theme.colors.warning
    : theme.colors.primary;

  return (
    <div className="arcpay-usage-meter">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.xs,
        }}
      >
        <span
          style={{
            fontSize: theme.fontSizes.sm,
            fontWeight: 500,
            color: theme.colors.text,
          }}
        >
          {data.metric}
        </span>
        <span
          style={{
            fontSize: theme.fontSizes.sm,
            color: theme.colors.textSecondary,
          }}
        >
          {data.used.toLocaleString()} / {data.limit.toLocaleString()}
          {showPercentage && (
            <span
              style={{
                marginLeft: theme.spacing.xs,
                color: isNearLimit ? barColor : theme.colors.textMuted,
              }}
            >
              ({percentage.toFixed(0)}%)
            </span>
          )}
        </span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: 8,
          backgroundColor: theme.colors.surfaceHover,
          borderRadius: theme.borderRadius.full,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${Math.min(100, percentage)}%`,
            height: '100%',
            backgroundColor: barColor,
            borderRadius: theme.borderRadius.full,
            transition: theme.transitions.slow,
          }}
        />
      </div>

      {/* Reset date */}
      {data.resetDate && (
        <p
          style={{
            margin: `${theme.spacing.xs} 0 0`,
            fontSize: theme.fontSizes.xs,
            color: theme.colors.textMuted,
          }}
        >
          Resets on {formatDate(data.resetDate)}
        </p>
      )}
    </div>
  );
}

/**
 * Usage display component
 */
export function UsageDisplay({ usage }: UsageDisplayProps) {
  const { theme } = useTheme();

  if (usage.length === 0) {
    return null;
  }

  return (
    <Card className="arcpay-usage-display" variant="outlined" padding="lg">
      <h3
        style={{
          margin: `0 0 ${theme.spacing.lg}`,
          fontSize: theme.fontSizes.lg,
          fontWeight: 600,
          color: theme.colors.text,
        }}
      >
        Usage
      </h3>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing.lg,
        }}
      >
        {usage.map((data, index) => (
          <UsageMeter key={index} data={data} />
        ))}
      </div>
    </Card>
  );
}

export default UsageDisplay;
