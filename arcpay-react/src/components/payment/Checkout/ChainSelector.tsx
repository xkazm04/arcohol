import React from 'react';
import { useTheme } from '../../../theme';
import type { ChainSelectorProps } from './types';
import type { SupportedChain } from '../../../theme/types';

/**
 * Chain metadata for display
 */
const CHAIN_INFO: Record<SupportedChain, { name: string; icon: string; color: string }> = {
  arc: { name: 'Arc', icon: 'ARC', color: '#06b6d4' },
  ethereum: { name: 'Ethereum', icon: 'ETH', color: '#627EEA' },
  polygon: { name: 'Polygon', icon: 'MATIC', color: '#8247E5' },
  arbitrum: { name: 'Arbitrum', icon: 'ARB', color: '#28A0F0' },
  optimism: { name: 'Optimism', icon: 'OP', color: '#FF0420' },
  avalanche: { name: 'Avalanche', icon: 'AVAX', color: '#E84142' },
  solana: { name: 'Solana', icon: 'SOL', color: '#14F195' },
};

/**
 * Chain icon component
 */
function ChainIcon({ chain, size = 24 }: { chain: SupportedChain; size?: number }) {
  const info = CHAIN_INFO[chain];

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: info.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.35,
        fontWeight: 600,
        color: '#fff',
      }}
    >
      {info.icon.slice(0, 2)}
    </div>
  );
}

/**
 * Chain selector component
 */
export function ChainSelector({
  chains,
  selected,
  onChange,
  disabled,
}: ChainSelectorProps) {
  const { theme } = useTheme();

  return (
    <div className="arcpay-chain-selector">
      <label
        style={{
          display: 'block',
          marginBottom: theme.spacing.xs,
          fontSize: theme.fontSizes.sm,
          fontWeight: 500,
          color: theme.colors.text,
        }}
      >
        Select Network
      </label>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(chains.length, 4)}, 1fr)`,
          gap: theme.spacing.sm,
        }}
      >
        {chains.map((chain) => {
          const info = CHAIN_INFO[chain];
          const isSelected = chain === selected;

          return (
            <button
              key={chain}
              type="button"
              onClick={() => onChange(chain)}
              disabled={disabled}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: theme.spacing.xs,
                padding: theme.spacing.sm,
                backgroundColor: isSelected ? theme.colors.primaryHover + '15' : theme.colors.surface,
                border: `2px solid ${isSelected ? theme.colors.primary : theme.colors.border}`,
                borderRadius: theme.borderRadius.lg,
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                transition: theme.transitions.fast,
              }}
            >
              <ChainIcon chain={chain} size={32} />
              <span
                style={{
                  fontSize: theme.fontSizes.sm,
                  fontWeight: isSelected ? 600 : 400,
                  color: isSelected ? theme.colors.primary : theme.colors.text,
                }}
              >
                {info.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Compact chain selector (dropdown style)
 */
export function ChainSelectorCompact({
  chains,
  selected,
  onChange,
  disabled,
}: ChainSelectorProps) {
  const { theme } = useTheme();
  const selectedInfo = CHAIN_INFO[selected];

  return (
    <div className="arcpay-chain-selector-compact">
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value as SupportedChain)}
        disabled={disabled}
        style={{
          width: '100%',
          height: '48px',
          padding: `0 ${theme.spacing.md}`,
          paddingLeft: theme.spacing.xl,
          backgroundColor: theme.colors.surface,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.borderRadius.md,
          fontSize: theme.fontSizes.md,
          color: theme.colors.text,
          cursor: disabled ? 'not-allowed' : 'pointer',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23${theme.colors.textMuted.replace('#', '')}'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.75rem center',
          backgroundSize: '1rem',
        }}
      >
        {chains.map((chain) => (
          <option key={chain} value={chain}>
            {CHAIN_INFO[chain].name}
          </option>
        ))}
      </select>
      <div
        style={{
          position: 'absolute',
          left: theme.spacing.sm,
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
        }}
      >
        <ChainIcon chain={selected} size={24} />
      </div>
    </div>
  );
}

export { CHAIN_INFO, ChainIcon };
