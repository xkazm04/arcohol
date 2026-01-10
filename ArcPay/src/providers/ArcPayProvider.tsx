import React, {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
} from 'react';
import { ThemeProvider } from './ThemeProvider';
import { WalletProvider } from './WalletProvider';
import { CircleClient } from '../core/CircleClient';
import { ArcClient } from '../core/ArcClient';
import type { ArcPayConfig } from '../types/config';
import type { Wallet } from '../types/wallet';
import type { Transaction } from '../types/transaction';
import type { ThemeConfig, ThemeName } from '../types/theme';

interface ArcPayContextValue {
  circleClient: CircleClient;
  arcClient: ArcClient;
  config: ArcPayConfig;
}

const ArcPayContext = createContext<ArcPayContextValue | null>(null);

export function ArcPayProvider({
  children,
  apiKey,
  network = 'arc-testnet',
  theme = 'default',
  enableOnramp = true,
  enableOfframp = true,
  enableContacts = true,
  onConnect,
  onDisconnect,
  onTransaction,
  onError,
  walletType = 'embedded',
  locale = 'en',
  currency = 'USD',
}: PropsWithChildren<ArcPayConfig>) {
  const circleClient = useMemo(
    () => new CircleClient({ apiKey }),
    [apiKey]
  );

  const arcClient = useMemo(
    () =>
      new ArcClient({
        network: network.includes('testnet') ? 'testnet' : 'mainnet',
      }),
    [network]
  );

  const config: ArcPayConfig = useMemo(
    () => ({
      apiKey,
      network,
      theme,
      enableOnramp,
      enableOfframp,
      enableContacts,
      onConnect,
      onDisconnect,
      onTransaction,
      onError,
      walletType,
      locale,
      currency,
    }),
    [
      apiKey,
      network,
      theme,
      enableOnramp,
      enableOfframp,
      enableContacts,
      onConnect,
      onDisconnect,
      onTransaction,
      onError,
      walletType,
      locale,
      currency,
    ]
  );

  const contextValue = useMemo<ArcPayContextValue>(
    () => ({
      circleClient,
      arcClient,
      config,
    }),
    [circleClient, arcClient, config]
  );

  const handleConnect = (wallet: Wallet) => {
    onConnect?.(wallet);
  };

  const handleDisconnect = () => {
    onDisconnect?.();
  };

  const themeValue: ThemeName | ThemeConfig =
    typeof theme === 'string' ? theme : theme;

  return (
    <ArcPayContext.Provider value={contextValue}>
      <ThemeProvider theme={themeValue}>
        <WalletProvider
          circleClient={circleClient}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
        >
          {children}
        </WalletProvider>
      </ThemeProvider>
    </ArcPayContext.Provider>
  );
}

export function useArcPay(): ArcPayContextValue {
  const context = useContext(ArcPayContext);
  if (!context) {
    throw new Error('useArcPay must be used within ArcPayProvider');
  }
  return context;
}
