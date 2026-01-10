import React, { type ReactNode } from 'react';
import { useWalletButtonHeadless } from '../../headless';
import type { WalletButtonRenderProps } from '../../headless/types';
import { Button, type ButtonVariant, type ButtonSize } from '../ui/Button';
import { cn, mergeSlotClassNames, type SlotClassNames, type ClassNameStrategy } from '../../utils/cn';

// =============================================================================
// Types
// =============================================================================

/** Slots available for className customization */
export type WalletButtonSlot = 'root' | 'address' | 'connectText';

/** ClassNames for each slot */
export type WalletButtonClassNames = SlotClassNames<WalletButtonSlot>;

export interface WalletButtonProps {
  /** Called after successful connection */
  onConnect?: () => void;
  /** Called after disconnection */
  onDisconnect?: () => void;
  /** Button variant when disconnected */
  variant?: ButtonVariant;
  /** Button variant when connected */
  connectedVariant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Additional class name */
  className?: string;
  /** Custom classNames for slots */
  classNames?: WalletButtonClassNames;
  /** Strategy for merging classNames */
  classNameStrategy?: ClassNameStrategy;
  /** Custom connect text */
  connectText?: string;
  /** Enable headless mode - render function receives all state */
  headless?: boolean;
  /** Children or render function (for headless mode) */
  children?: ReactNode | ((props: WalletButtonRenderProps) => ReactNode);
}

// =============================================================================
// Default ClassNames
// =============================================================================

const defaultClassNames: Record<WalletButtonSlot, string> = {
  root: 'arcpay-wallet-button',
  address: 'arcpay-wallet-button__address',
  connectText: 'arcpay-wallet-button__connect-text',
};

// =============================================================================
// Component
// =============================================================================

/**
 * Wallet connection button component
 *
 * @example Basic usage
 * ```tsx
 * <WalletButton onConnect={() => console.log('Connected!')} />
 * ```
 *
 * @example With custom classNames (Tailwind)
 * ```tsx
 * <WalletButton
 *   classNames={{
 *     root: 'bg-purple-600 hover:bg-purple-700 rounded-full px-6',
 *     address: 'font-mono text-sm',
 *   }}
 * />
 * ```
 *
 * @example Headless mode (complete control)
 * ```tsx
 * <WalletButton headless>
 *   {({ isConnected, isConnecting, formattedAddress, connect, disconnect }) => (
 *     <button
 *       onClick={isConnected ? disconnect : connect}
 *       className="my-custom-button"
 *     >
 *       {isConnecting ? (
 *         <MySpinner />
 *       ) : isConnected ? (
 *         <span>{formattedAddress}</span>
 *       ) : (
 *         'Connect Wallet'
 *       )}
 *     </button>
 *   )}
 * </WalletButton>
 * ```
 */
export function WalletButton({
  onConnect,
  onDisconnect,
  variant = 'primary',
  connectedVariant = 'outline',
  size = 'md',
  className,
  classNames,
  classNameStrategy = 'merge',
  connectText = 'Connect Wallet',
  headless = false,
  children,
}: WalletButtonProps) {
  const renderProps = useWalletButtonHeadless({ onConnect, onDisconnect });
  const { isConnected, isConnecting, formattedAddress, connect, disconnect } = renderProps;

  // Headless mode - call children as render function
  if (headless && typeof children === 'function') {
    return <>{children(renderProps)}</>;
  }

  // Merge slot classNames
  const slots = mergeSlotClassNames(defaultClassNames, classNames, classNameStrategy);

  const handleClick = async () => {
    if (isConnected) {
      disconnect();
    } else {
      await connect();
    }
  };

  return (
    <Button
      onClick={handleClick}
      isLoading={isConnecting}
      variant={isConnected ? connectedVariant : variant}
      size={size}
      className={cn(slots.root, className)}
    >
      {isConnected && formattedAddress ? (
        <span className={slots.address}>{formattedAddress}</span>
      ) : (
        <span className={slots.connectText}>{connectText}</span>
      )}
    </Button>
  );
}
