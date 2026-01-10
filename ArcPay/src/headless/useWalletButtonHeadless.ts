/**
 * Headless Wallet Button Hook
 *
 * Provides all wallet connection logic without any UI.
 * Use this to build completely custom wallet buttons.
 */

import { useCallback } from 'react';
import { useWallet } from '../hooks';
import { formatAddress } from '../utils/formatting';
import type { WalletButtonRenderProps } from './types';

export interface UseWalletButtonHeadlessOptions {
  /** Called after successful connection */
  onConnect?: () => void;
  /** Called after disconnection */
  onDisconnect?: () => void;
}

/**
 * Hook providing wallet button functionality without UI
 *
 * @example
 * ```tsx
 * function CustomWalletButton() {
 *   const {
 *     isConnected,
 *     isConnecting,
 *     formattedAddress,
 *     connect,
 *     disconnect,
 *   } = useWalletButtonHeadless();
 *
 *   return (
 *     <button onClick={isConnected ? disconnect : connect}>
 *       {isConnecting ? 'Connecting...' : isConnected ? formattedAddress : 'Connect'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useWalletButtonHeadless(
  options: UseWalletButtonHeadlessOptions = {}
): WalletButtonRenderProps {
  const { onConnect, onDisconnect } = options;
  const {
    wallet,
    isConnected,
    isConnecting,
    connect: walletConnect,
    disconnect: walletDisconnect,
  } = useWallet();

  const address = wallet?.address || null;
  const formattedAddress = address ? formatAddress(address) : null;

  const connect = useCallback(async () => {
    await walletConnect();
    onConnect?.();
  }, [walletConnect, onConnect]);

  const disconnect = useCallback(() => {
    walletDisconnect();
    onDisconnect?.();
  }, [walletDisconnect, onDisconnect]);

  return {
    wallet,
    address,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    formattedAddress,
  };
}
