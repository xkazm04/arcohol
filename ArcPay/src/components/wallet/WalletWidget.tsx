import React, { type ReactNode } from 'react';
import { useWalletWidgetHeadless } from '../../headless';
import type { WalletWidgetRenderProps, WalletWidgetSlots } from '../../headless/types';
import { BalanceDisplay } from './BalanceDisplay';
import { AddressDisplay } from './AddressDisplay';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { SendMoney } from '../transfer/SendMoney';
import { FundWallet } from '../ramps/FundWallet';
import { CashOut } from '../ramps/CashOut';
import { cn, mergeSlotClassNames, type SlotClassNames, type ClassNameStrategy } from '../../utils/cn';

// =============================================================================
// Types
// =============================================================================

/** Slots available for className customization */
export type WalletWidgetSlot =
  | 'root'
  | 'disconnected'
  | 'message'
  | 'connectButton'
  | 'balance'
  | 'address'
  | 'actions'
  | 'actionButton'
  | 'receive'
  | 'modal';

/** ClassNames for each slot */
export type WalletWidgetClassNames = SlotClassNames<WalletWidgetSlot>;

export interface WalletWidgetProps {
  /** Show balance section */
  showBalance?: boolean;
  /** Show address section */
  showAddress?: boolean;
  /** Show action buttons */
  showActions?: boolean;
  /** Called when send is triggered */
  onSend?: () => void;
  /** Called when receive is triggered */
  onReceive?: () => void;
  /** Called when fund is triggered */
  onFund?: () => void;
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Custom classNames for slots */
  classNames?: WalletWidgetClassNames;
  /** Strategy for merging classNames */
  classNameStrategy?: ClassNameStrategy;
  /** Custom slot components (for partial customization) */
  slots?: WalletWidgetSlots;
  /** Enable headless mode */
  headless?: boolean;
  /** Children or render function (for headless mode) */
  children?: ReactNode | ((props: WalletWidgetRenderProps) => ReactNode);
}

// =============================================================================
// Default ClassNames
// =============================================================================

const defaultClassNames: Record<WalletWidgetSlot, string> = {
  root: 'arcpay-widget',
  disconnected: 'arcpay-widget--disconnected',
  message: 'arcpay-widget__message',
  connectButton: 'arcpay-widget__connect-button',
  balance: 'arcpay-widget__balance',
  address: 'arcpay-widget__address',
  actions: 'arcpay-widget__actions',
  actionButton: 'arcpay-widget__action-button',
  receive: 'arcpay-receive',
  modal: 'arcpay-widget__modal',
};

// =============================================================================
// Component
// =============================================================================

/**
 * Complete wallet widget with balance, address, and actions
 *
 * @example Basic usage
 * ```tsx
 * <WalletWidget />
 * ```
 *
 * @example With custom classNames (Tailwind)
 * ```tsx
 * <WalletWidget
 *   classNames={{
 *     root: 'bg-white rounded-2xl shadow-lg p-6',
 *     balance: 'text-3xl font-bold',
 *     actions: 'grid grid-cols-2 gap-4 mt-4',
 *     actionButton: 'rounded-xl',
 *   }}
 * />
 * ```
 *
 * @example With custom slots (partial customization)
 * ```tsx
 * <WalletWidget
 *   slots={{
 *     balance: ({ balance, isLoading }) => (
 *       <MyCustomBalance balance={balance} loading={isLoading} />
 *     ),
 *     disconnected: ({ onConnect, isConnecting }) => (
 *       <MyCustomConnectCard onConnect={onConnect} loading={isConnecting} />
 *     ),
 *   }}
 * />
 * ```
 *
 * @example Headless mode (complete control)
 * ```tsx
 * <WalletWidget headless>
 *   {({
 *     isConnected,
 *     balance,
 *     formattedAddress,
 *     connect,
 *     openSend,
 *     activeModal,
 *     closeModals,
 *   }) => (
 *     <div className="my-wallet">
 *       {!isConnected ? (
 *         <button onClick={connect}>Connect</button>
 *       ) : (
 *         <>
 *           <div>{balance} USDC</div>
 *           <div>{formattedAddress}</div>
 *           <button onClick={openSend}>Send</button>
 *         </>
 *       )}
 *     </div>
 *   )}
 * </WalletWidget>
 * ```
 */
export function WalletWidget({
  showBalance = true,
  showAddress = true,
  showActions = true,
  onSend,
  onReceive,
  onFund,
  className,
  style,
  classNames,
  classNameStrategy = 'merge',
  slots,
  headless = false,
  children,
}: WalletWidgetProps) {
  const renderProps = useWalletWidgetHeadless({
    onSend,
    onReceive,
    onFund,
  });

  const {
    wallet,
    isConnected,
    isConnecting,
    balance,
    isBalanceLoading,
    connect,
    openSend,
    openReceive,
    openFund,
    openCashOut,
    closeModals,
    activeModal,
  } = renderProps;

  // Headless mode - call children as render function
  if (headless && typeof children === 'function') {
    return <>{children(renderProps)}</>;
  }

  // Merge slot classNames
  const slotClasses = mergeSlotClassNames(defaultClassNames, classNames, classNameStrategy);

  // Disconnected state
  if (!isConnected) {
    // Custom slot for disconnected state
    if (slots?.disconnected) {
      const DisconnectedSlot = slots.disconnected;
      return <DisconnectedSlot onConnect={connect} isConnecting={isConnecting} />;
    }

    return (
      <div
        className={cn(slotClasses.root, slotClasses.disconnected, className)}
        style={style}
      >
        <p className={slotClasses.message}>Connect your wallet to get started</p>
        <Button
          onClick={connect}
          isLoading={isConnecting}
          className={slotClasses.connectButton}
        >
          Connect Wallet
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(slotClasses.root, className)} style={style}>
      {/* Balance Section */}
      {showBalance && (
        slots?.balance ? (
          <slots.balance balance={balance} isLoading={isBalanceLoading} />
        ) : (
          <div className={slotClasses.balance}>
            <BalanceDisplay balance={balance} showRefresh />
          </div>
        )
      )}

      {/* Address Section */}
      {showAddress && wallet && (
        slots?.address ? (
          <slots.address
            address={wallet.address}
            formatted={renderProps.formattedAddress || ''}
          />
        ) : (
          <div className={slotClasses.address}>
            <AddressDisplay address={wallet.address} />
          </div>
        )
      )}

      {/* Actions Section */}
      {showActions && (
        slots?.actions ? (
          <slots.actions
            onSend={openSend}
            onReceive={openReceive}
            onFund={openFund}
            onCashOut={openCashOut}
          />
        ) : (
          <div className={slotClasses.actions}>
            <Button
              variant="primary"
              onClick={openSend}
              className={slotClasses.actionButton}
            >
              Send
            </Button>
            <Button
              variant="secondary"
              onClick={openReceive}
              className={slotClasses.actionButton}
            >
              Receive
            </Button>
            <Button
              variant="outline"
              onClick={openFund}
              className={slotClasses.actionButton}
            >
              Add Funds
            </Button>
            <Button
              variant="outline"
              onClick={openCashOut}
              className={slotClasses.actionButton}
            >
              Cash Out
            </Button>
          </div>
        )
      )}

      {/* Modals */}
      <Modal
        isOpen={activeModal === 'send'}
        onClose={closeModals}
        title="Send Money"
        className={slotClasses.modal}
      >
        {slots?.sendModal ? (
          <slots.sendModal onClose={closeModals} onSuccess={closeModals} />
        ) : (
          <SendMoney onSuccess={closeModals} />
        )}
      </Modal>

      <Modal
        isOpen={activeModal === 'receive'}
        onClose={closeModals}
        title="Receive Money"
        className={slotClasses.modal}
      >
        {slots?.receiveModal ? (
          <slots.receiveModal address={wallet?.address || ''} onClose={closeModals} />
        ) : (
          <div className={slotClasses.receive}>
            <p>Share your address to receive USDC:</p>
            {wallet && <AddressDisplay address={wallet.address} showFull />}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={activeModal === 'fund'}
        onClose={closeModals}
        title="Add Funds"
        className={slotClasses.modal}
      >
        <FundWallet onSuccess={closeModals} />
      </Modal>

      <Modal
        isOpen={activeModal === 'cashout'}
        onClose={closeModals}
        title="Cash Out"
        className={slotClasses.modal}
      >
        <CashOut onSuccess={closeModals} />
      </Modal>
    </div>
  );
}
