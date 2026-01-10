/**
 * Headless Components for ArcPay React SDK
 *
 * Headless components provide all the logic and state management
 * without any UI, giving you complete control over rendering.
 *
 * @example
 * ```tsx
 * import { useWalletButtonHeadless } from '@arcpay/react/headless';
 *
 * function MyWalletButton() {
 *   const { isConnected, connect, formattedAddress } = useWalletButtonHeadless();
 *
 *   return (
 *     <button onClick={connect}>
 *       {isConnected ? formattedAddress : 'Connect'}
 *     </button>
 *   );
 * }
 * ```
 */

// Types
export type {
  HeadlessBaseProps,
  SlotComponent,
  // Wallet Button
  WalletButtonRenderProps,
  WalletButtonHeadlessProps,
  // Pay Button
  PayButtonRenderProps,
  PayButtonHeadlessProps,
  // Wallet Widget
  WalletWidgetRenderProps,
  WalletWidgetSlots,
  WalletWidgetHeadlessProps,
  // Transaction List
  TransactionListRenderProps,
  TransactionListSlots,
  TransactionListHeadlessProps,
  // Balance Display
  BalanceDisplayRenderProps,
  BalanceDisplayHeadlessProps,
} from './types';

// Hooks
export {
  useWalletButtonHeadless,
  type UseWalletButtonHeadlessOptions,
} from './useWalletButtonHeadless';

export {
  usePayButtonHeadless,
  type UsePayButtonHeadlessOptions,
} from './usePayButtonHeadless';

export {
  useWalletWidgetHeadless,
  type UseWalletWidgetHeadlessOptions,
} from './useWalletWidgetHeadless';
