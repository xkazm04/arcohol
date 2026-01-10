/**
 * Headless Wallet Widget Hook
 *
 * Provides all wallet widget logic without any UI.
 * Use this to build completely custom wallet widgets.
 */

import { useState, useCallback } from 'react';
import { useWallet, useBalance } from '../hooks';
import { formatAddress } from '../utils/formatting';
import type { WalletWidgetRenderProps } from './types';

export interface UseWalletWidgetHeadlessOptions {
  /** Called when send action is triggered */
  onSend?: () => void;
  /** Called when receive action is triggered */
  onReceive?: () => void;
  /** Called when fund action is triggered */
  onFund?: () => void;
  /** Called when cash out action is triggered */
  onCashOut?: () => void;
}

/**
 * Hook providing wallet widget functionality without UI
 *
 * @example
 * ```tsx
 * function CustomWalletWidget() {
 *   const {
 *     isConnected,
 *     balance,
 *     formattedAddress,
 *     connect,
 *     openSend,
 *     activeModal,
 *     closeModals,
 *   } = useWalletWidgetHeadless();
 *
 *   if (!isConnected) {
 *     return <button onClick={connect}>Connect Wallet</button>;
 *   }
 *
 *   return (
 *     <div>
 *       <p>Balance: {balance} USDC</p>
 *       <p>Address: {formattedAddress}</p>
 *       <button onClick={openSend}>Send</button>
 *
 *       {activeModal === 'send' && (
 *         <MyCustomSendModal onClose={closeModals} />
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useWalletWidgetHeadless(
  options: UseWalletWidgetHeadlessOptions = {}
): WalletWidgetRenderProps {
  const { onSend, onReceive, onFund, onCashOut } = options;

  const {
    wallet,
    isConnected,
    isConnecting,
    connect: walletConnect,
    disconnect: walletDisconnect,
  } = useWallet();

  const { balance, isLoading: isBalanceLoading, refetch: refreshBalance } = useBalance();

  const [activeModal, setActiveModal] = useState<
    'send' | 'receive' | 'fund' | 'cashout' | null
  >(null);

  const address = wallet?.address || null;
  const formattedAddress = address ? formatAddress(address) : null;

  const connect = useCallback(async () => {
    await walletConnect();
  }, [walletConnect]);

  const disconnect = useCallback(() => {
    walletDisconnect();
    setActiveModal(null);
  }, [walletDisconnect]);

  const openSend = useCallback(() => {
    setActiveModal('send');
    onSend?.();
  }, [onSend]);

  const openReceive = useCallback(() => {
    setActiveModal('receive');
    onReceive?.();
  }, [onReceive]);

  const openFund = useCallback(() => {
    setActiveModal('fund');
    onFund?.();
  }, [onFund]);

  const openCashOut = useCallback(() => {
    setActiveModal('cashout');
    onCashOut?.();
  }, [onCashOut]);

  const closeModals = useCallback(() => {
    setActiveModal(null);
  }, []);

  return {
    wallet,
    address,
    isConnected,
    isConnecting,
    balance,
    isBalanceLoading,
    formattedAddress,
    connect,
    disconnect,
    refreshBalance,
    openSend,
    openReceive,
    openFund,
    openCashOut,
    closeModals,
    activeModal,
  };
}
