# ArcPay React SDK - Architecture Document

## 🎯 Overview

A React SDK/NPM package (`@arcpay/react`) that enables any website to integrate USDC payments on Arc with minimal code. Think "Stripe for Arc" - developers can add payments with just a few lines of code.

---

## 🏗️ SDK Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         @arcpay/react SDK                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        PROVIDER LAYER                                │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │   │
│  │  │  ArcPay      │  │   Wallet     │  │     Theme                │  │   │
│  │  │  Provider    │  │   Context    │  │     Provider             │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌─────────────────────────────────┼───────────────────────────────────┐   │
│  │                        HOOKS LAYER                                   │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │   │
│  │  │  useWallet   │  │  useTransfer │  │  useBalance              │  │   │
│  │  │  useOnramp   │  │  useOfframp  │  │  useTransactionHistory   │  │   │
│  │  │  usePayment  │  │  useContacts │  │  useExchangeRate         │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌─────────────────────────────────┼───────────────────────────────────┐   │
│  │                     COMPONENTS LAYER                                 │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │   │
│  │  │  <PayButton> │  │ <SendMoney>  │  │  <WalletWidget>          │  │   │
│  │  │  <FundWallet>│  │ <CashOut>    │  │  <TransactionList>       │  │   │
│  │  │  <QRCode>    │  │ <PaymentForm>│  │  <BalanceDisplay>        │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌─────────────────────────────────┼───────────────────────────────────┐   │
│  │                       CORE LAYER                                     │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │   │
│  │  │  Circle      │  │  Arc Chain   │  │  Payment                 │  │   │
│  │  │  Client      │  │  Client      │  │  Processor               │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL SERVICES                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Circle     │  │     Arc      │  │   Coinbase   │  │   Transak    │   │
│  │   Wallets    │  │  Blockchain  │  │   Onramp     │  │   Offramp    │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Package Structure

```
@arcpay/react/
├── src/
│   ├── index.ts                    # Main exports
│   │
│   ├── providers/
│   │   ├── ArcPayProvider.tsx      # Main SDK provider
│   │   ├── WalletProvider.tsx      # Wallet state management
│   │   ├── ThemeProvider.tsx       # Theming system
│   │   └── index.ts
│   │
│   ├── hooks/
│   │   ├── useWallet.ts            # Wallet connection/management
│   │   ├── useBalance.ts           # USDC balance
│   │   ├── useTransfer.ts          # Send USDC
│   │   ├── useOnramp.ts            # Fiat → USDC
│   │   ├── useOfframp.ts           # USDC → Fiat
│   │   ├── usePayment.ts           # Payment requests
│   │   ├── useTransactionHistory.ts
│   │   ├── useContacts.ts          # Saved recipients
│   │   ├── useExchangeRate.ts      # USD/EUR rates
│   │   ├── useQRCode.ts            # Payment QR generation
│   │   └── index.ts
│   │
│   ├── components/
│   │   ├── wallet/
│   │   │   ├── WalletWidget.tsx    # Full wallet UI
│   │   │   ├── BalanceDisplay.tsx  # Balance component
│   │   │   ├── WalletButton.tsx    # Connect/create wallet
│   │   │   └── AddressDisplay.tsx  # Show wallet address
│   │   │
│   │   ├── transfer/
│   │   │   ├── SendMoney.tsx       # Transfer form
│   │   │   ├── PaymentForm.tsx     # Payment request form
│   │   │   ├── PayButton.tsx       # One-click pay button
│   │   │   ├── QRCodeDisplay.tsx   # Payment QR code
│   │   │   └── RecipientInput.tsx  # Address/email input
│   │   │
│   │   ├── ramps/
│   │   │   ├── FundWallet.tsx      # Coinbase onramp
│   │   │   ├── CashOut.tsx         # Transak offramp
│   │   │   └── RampModal.tsx       # Modal wrapper
│   │   │
│   │   ├── history/
│   │   │   ├── TransactionList.tsx # Transaction history
│   │   │   ├── TransactionItem.tsx # Single transaction
│   │   │   └── TransactionDetail.tsx
│   │   │
│   │   └── ui/
│   │       ├── Modal.tsx           # Base modal
│   │       ├── Button.tsx          # Styled button
│   │       ├── Input.tsx           # Form input
│   │       ├── Spinner.tsx         # Loading state
│   │       └── Toast.tsx           # Notifications
│   │
│   ├── core/
│   │   ├── CircleClient.ts         # Circle API wrapper
│   │   ├── ArcClient.ts            # Arc blockchain client
│   │   ├── PaymentProcessor.ts     # Payment logic
│   │   ├── TransactionBuilder.ts   # TX construction
│   │   └── index.ts
│   │
│   ├── utils/
│   │   ├── formatting.ts           # Currency formatting
│   │   ├── validation.ts           # Input validation
│   │   ├── storage.ts              # Local storage
│   │   └── constants.ts            # SDK constants
│   │
│   ├── types/
│   │   ├── wallet.ts               # Wallet types
│   │   ├── transaction.ts          # Transaction types
│   │   ├── payment.ts              # Payment types
│   │   ├── config.ts               # Config types
│   │   └── index.ts
│   │
│   └── styles/
│       ├── themes/
│       │   ├── default.ts          # Default theme
│       │   ├── dark.ts             # Dark theme
│       │   └── minimal.ts          # Minimal theme
│       └── base.css                # Base styles
│
├── package.json
├── tsconfig.json
├── rollup.config.js                # Bundle config
├── README.md
└── CHANGELOG.md
```

---

## 🎨 API Design

### Quick Start (3 Lines of Code)

```tsx
import { ArcPayProvider, PayButton } from '@arcpay/react';

function App() {
  return (
    <ArcPayProvider apiKey="your-api-key">
      <PayButton amount={10} recipient="merchant@example.com" />
    </ArcPayProvider>
  );
}
```

### Full Integration Example

```tsx
import { 
  ArcPayProvider, 
  WalletWidget,
  SendMoney,
  FundWallet,
  useWallet,
  useBalance 
} from '@arcpay/react';

function App() {
  return (
    <ArcPayProvider 
      apiKey="your-api-key"
      network="arc-mainnet" // or "arc-testnet"
      theme="default"
      onError={(error) => console.error(error)}
    >
      <MyPaymentApp />
    </ArcPayProvider>
  );
}

function MyPaymentApp() {
  const { wallet, isConnected, connect } = useWallet();
  const { balance, isLoading } = useBalance();

  return (
    <div>
      {/* Pre-built wallet widget */}
      <WalletWidget />
      
      {/* Or build custom UI */}
      {isConnected ? (
        <>
          <p>Balance: ${balance}</p>
          <SendMoney />
          <FundWallet />
        </>
      ) : (
        <button onClick={connect}>Connect Wallet</button>
      )}
    </div>
  );
}
```

---

## 🔧 Core Exports

### Provider

```typescript
// src/providers/ArcPayProvider.tsx

interface ArcPayConfig {
  // Required
  apiKey: string;
  
  // Network
  network?: 'arc-mainnet' | 'arc-testnet' | 'base-mainnet' | 'base-sepolia';
  
  // Theming
  theme?: 'default' | 'dark' | 'minimal' | ThemeConfig;
  
  // Features
  enableOnramp?: boolean;      // Coinbase onramp (default: true)
  enableOfframp?: boolean;     // Transak offramp (default: true)
  enableContacts?: boolean;    // Save recipients (default: true)
  
  // Callbacks
  onConnect?: (wallet: Wallet) => void;
  onDisconnect?: () => void;
  onTransaction?: (tx: Transaction) => void;
  onError?: (error: ArcPayError) => void;
  
  // Wallet options
  walletType?: 'embedded' | 'external';  // embedded = Circle, external = MetaMask etc
  
  // Localization
  locale?: 'en' | 'es' | 'fr' | 'de' | 'pt' | 'zh';
  currency?: 'USD' | 'EUR' | 'GBP';
}

export function ArcPayProvider({ 
  children, 
  ...config 
}: PropsWithChildren<ArcPayConfig>) {
  // Implementation
}
```

### Hooks

```typescript
// src/hooks/useWallet.ts
interface UseWalletReturn {
  // State
  wallet: Wallet | null;
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  
  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  createWallet: (options?: CreateWalletOptions) => Promise<Wallet>;
  
  // Utils
  copyAddress: () => void;
  getQRCode: () => string;
}

export function useWallet(): UseWalletReturn;


// src/hooks/useBalance.ts
interface UseBalanceReturn {
  balance: string;           // Formatted: "100.00"
  balanceRaw: bigint;        // Raw: 100000000n
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useBalance(): UseBalanceReturn;


// src/hooks/useTransfer.ts
interface UseTransferReturn {
  // State
  isTransferring: boolean;
  lastTransaction: Transaction | null;
  
  // Actions
  transfer: (params: TransferParams) => Promise<TransactionResult>;
  estimateFee: (params: TransferParams) => Promise<string>;
  
  // Validation
  validateRecipient: (recipient: string) => ValidationResult;
}

interface TransferParams {
  to: string;                // Address, email, or phone
  amount: string | number;   // Amount in dollars
  memo?: string;             // Optional note
  idempotencyKey?: string;   // Prevent duplicates
}

export function useTransfer(): UseTransferReturn;


// src/hooks/useOnramp.ts
interface UseOnrampReturn {
  // State
  isOpen: boolean;
  isPending: boolean;
  
  // Actions
  openOnramp: (options?: OnrampOptions) => void;
  closeOnramp: () => void;
  
  // Events
  onSuccess: (callback: (result: OnrampResult) => void) => void;
  onError: (callback: (error: Error) => void) => void;
}

interface OnrampOptions {
  amount?: number;           // Pre-fill amount
  currency?: string;         // Fiat currency
  provider?: 'coinbase' | 'transak';
}

export function useOnramp(): UseOnrampReturn;


// src/hooks/useOfframp.ts
interface UseOfframpReturn {
  isOpen: boolean;
  isPending: boolean;
  openOfframp: (options?: OfframpOptions) => void;
  closeOfframp: () => void;
}

export function useOfframp(): UseOfframpReturn;


// src/hooks/usePayment.ts
interface UsePaymentReturn {
  // Create payment request
  createPaymentRequest: (params: PaymentRequestParams) => PaymentRequest;
  
  // Pay a request
  payRequest: (request: PaymentRequest) => Promise<TransactionResult>;
  
  // Generate QR for request
  getPaymentQR: (request: PaymentRequest) => string;
  
  // Parse QR/URL
  parsePaymentRequest: (data: string) => PaymentRequest;
}

interface PaymentRequestParams {
  amount: string | number;
  recipient: string;
  description?: string;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export function usePayment(): UsePaymentReturn;


// src/hooks/useTransactionHistory.ts
interface UseTransactionHistoryReturn {
  transactions: Transaction[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  filter: (filters: TransactionFilters) => void;
}

export function useTransactionHistory(): UseTransactionHistoryReturn;
```

### Components

```typescript
// src/components/wallet/WalletWidget.tsx
interface WalletWidgetProps {
  showBalance?: boolean;
  showAddress?: boolean;
  showActions?: boolean;
  onSend?: () => void;
  onReceive?: () => void;
  onFund?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export function WalletWidget(props: WalletWidgetProps): JSX.Element;


// src/components/transfer/PayButton.tsx
interface PayButtonProps {
  // Required
  amount: number | string;
  recipient: string;
  
  // Optional
  description?: string;
  onSuccess?: (tx: Transaction) => void;
  onError?: (error: Error) => void;
  
  // Styling
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
  
  // Content
  children?: React.ReactNode;  // Custom button text
  icon?: React.ReactNode;
}

export function PayButton(props: PayButtonProps): JSX.Element;


// src/components/transfer/SendMoney.tsx
interface SendMoneyProps {
  // Pre-fill
  defaultRecipient?: string;
  defaultAmount?: number;
  
  // Limits
  minAmount?: number;
  maxAmount?: number;
  
  // UI
  showContacts?: boolean;
  showQRScanner?: boolean;
  
  // Callbacks
  onSuccess?: (tx: Transaction) => void;
  onCancel?: () => void;
  
  // Styling
  className?: string;
}

export function SendMoney(props: SendMoneyProps): JSX.Element;


// src/components/ramps/FundWallet.tsx
interface FundWalletProps {
  // Pre-fill
  defaultAmount?: number;
  
  // Options
  presetAmounts?: number[];  // e.g., [25, 50, 100, 250]
  provider?: 'coinbase' | 'transak' | 'auto';
  
  // Callbacks
  onSuccess?: (result: OnrampResult) => void;
  onError?: (error: Error) => void;
  
  // UI
  inline?: boolean;          // Inline vs modal
  className?: string;
}

export function FundWallet(props: FundWalletProps): JSX.Element;


// src/components/history/TransactionList.tsx
interface TransactionListProps {
  limit?: number;
  filter?: 'all' | 'sent' | 'received';
  onTransactionClick?: (tx: Transaction) => void;
  emptyMessage?: string;
  className?: string;
}

export function TransactionList(props: TransactionListProps): JSX.Element;
```

---

## 🎨 Theming System

```typescript
// src/types/theme.ts
interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    success: string;
    error: string;
    warning: string;
    border: string;
  };
  
  fonts: {
    body: string;
    heading: string;
    mono: string;
  };
  
  radii: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// Usage
<ArcPayProvider 
  theme={{
    colors: {
      primary: '#0066FF',
      background: '#FFFFFF',
      // ...override any values
    }
  }}
>
```

### Pre-built Themes

```typescript
// src/styles/themes/default.ts
export const defaultTheme: ThemeConfig = {
  colors: {
    primary: '#0052FF',      // Coinbase blue
    secondary: '#00D632',    // Circle green
    background: '#FFFFFF',
    surface: '#F7F8FA',
    text: '#0A0B0D',
    textSecondary: '#5B616E',
    success: '#00D632',
    error: '#FF3B3B',
    warning: '#FFB020',
    border: '#E8EAED',
  },
  // ...
};

// src/styles/themes/dark.ts
export const darkTheme: ThemeConfig = {
  colors: {
    primary: '#5C8DFF',
    background: '#0A0B0D',
    surface: '#1A1B1F',
    text: '#FFFFFF',
    // ...
  },
};
```

---

## 💻 Implementation Details

### Core Client

```typescript
// src/core/CircleClient.ts
import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';

export class CircleClient {
  private client: ReturnType<typeof initiateDeveloperControlledWalletsClient>;
  
  constructor(config: CircleClientConfig) {
    this.client = initiateDeveloperControlledWalletsClient({
      apiKey: config.apiKey,
      entitySecret: config.entitySecret,
    });
  }
  
  async createWallet(userId: string): Promise<Wallet> {
    const walletSet = await this.client.createWalletSet({
      name: `arcpay-${userId}`,
    });
    
    const wallet = await this.client.createWallets({
      walletSetId: walletSet.data?.walletSet?.id!,
      blockchains: ['ARC'], // When Arc is supported
      count: 1,
      accountType: 'SCA',
    });
    
    return this.formatWallet(wallet.data?.wallets?.[0]);
  }
  
  async getBalance(walletId: string): Promise<string> {
    const balances = await this.client.getWalletTokenBalances({ walletId });
    const usdcBalance = balances.data?.tokenBalances?.find(
      b => b.token.symbol === 'USDC'
    );
    return usdcBalance?.amount || '0';
  }
  
  async transfer(params: TransferParams): Promise<Transaction> {
    const tx = await this.client.createTransaction({
      walletId: params.fromWalletId,
      tokenId: 'usdc',
      destinationAddress: params.to,
      amounts: [params.amount],
      fee: { type: 'level', config: { feeLevel: 'MEDIUM' } },
    });
    
    return this.formatTransaction(tx.data?.transaction);
  }
}
```

### Arc Chain Client

```typescript
// src/core/ArcClient.ts
import { createPublicClient, createWalletClient, http } from 'viem';
import { arc, arcTestnet } from './chains';

export class ArcClient {
  private publicClient: ReturnType<typeof createPublicClient>;
  private network: 'mainnet' | 'testnet';
  
  constructor(network: 'mainnet' | 'testnet' = 'testnet') {
    this.network = network;
    this.publicClient = createPublicClient({
      chain: network === 'mainnet' ? arc : arcTestnet,
      transport: http(),
    });
  }
  
  async getUSDCBalance(address: string): Promise<bigint> {
    const USDC_ADDRESS = '0x3600000000000000000000000000000000000000';
    
    return this.publicClient.readContract({
      address: USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [address],
    });
  }
  
  async waitForTransaction(hash: string): Promise<TransactionReceipt> {
    return this.publicClient.waitForTransactionReceipt({ hash });
  }
}

// Chain definitions
export const arcTestnet = {
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 6 },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.arc.network/'] },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://testnet.arcscan.app/' },
  },
};
```

### Provider Implementation

```typescript
// src/providers/ArcPayProvider.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CircleClient } from '../core/CircleClient';
import { ArcClient } from '../core/ArcClient';

interface ArcPayContextValue {
  // Clients
  circleClient: CircleClient;
  arcClient: ArcClient;
  
  // State
  wallet: Wallet | null;
  isConnected: boolean;
  isInitialized: boolean;
  
  // Config
  config: ArcPayConfig;
  
  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
}

const ArcPayContext = createContext<ArcPayContextValue | null>(null);

export function ArcPayProvider({ 
  children, 
  apiKey,
  network = 'arc-testnet',
  theme = 'default',
  ...config
}: PropsWithChildren<ArcPayConfig>) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize clients
  const circleClient = useMemo(
    () => new CircleClient({ apiKey }),
    [apiKey]
  );
  
  const arcClient = useMemo(
    () => new ArcClient(network.includes('testnet') ? 'testnet' : 'mainnet'),
    [network]
  );
  
  // Restore wallet from storage
  useEffect(() => {
    const stored = localStorage.getItem('arcpay_wallet');
    if (stored) {
      setWallet(JSON.parse(stored));
    }
    setIsInitialized(true);
  }, []);
  
  const connect = async () => {
    // Implementation
  };
  
  const disconnect = () => {
    setWallet(null);
    localStorage.removeItem('arcpay_wallet');
    config.onDisconnect?.();
  };
  
  return (
    <ArcPayContext.Provider value={{
      circleClient,
      arcClient,
      wallet,
      isConnected: !!wallet,
      isInitialized,
      config: { apiKey, network, theme, ...config },
      connect,
      disconnect,
    }}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ArcPayContext.Provider>
  );
}

export function useArcPay() {
  const context = useContext(ArcPayContext);
  if (!context) {
    throw new Error('useArcPay must be used within ArcPayProvider');
  }
  return context;
}
```

---

## 📱 Component Examples

### PayButton Implementation

```tsx
// src/components/transfer/PayButton.tsx
import React, { useState } from 'react';
import { useTransfer, useWallet, useArcPay } from '../../hooks';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner';

export function PayButton({
  amount,
  recipient,
  description,
  onSuccess,
  onError,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className,
}: PayButtonProps) {
  const { isConnected, connect } = useWallet();
  const { transfer, isTransferring } = useTransfer();
  const { config } = useArcPay();
  
  const [showConfirm, setShowConfirm] = useState(false);
  
  const handleClick = async () => {
    if (!isConnected) {
      await connect();
      return;
    }
    setShowConfirm(true);
  };
  
  const handleConfirm = async () => {
    try {
      const result = await transfer({
        to: recipient,
        amount: String(amount),
        memo: description,
      });
      
      setShowConfirm(false);
      onSuccess?.(result.transaction);
    } catch (error) {
      onError?.(error as Error);
    }
  };
  
  return (
    <>
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        onClick={handleClick}
        disabled={isTransferring}
        className={className}
      >
        {isTransferring ? (
          <Spinner size="sm" />
        ) : (
          children || `Pay $${amount}`
        )}
      </Button>
      
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirm Payment"
      >
        <div className="arcpay-confirm">
          <p className="arcpay-confirm-amount">
            ${typeof amount === 'number' ? amount.toFixed(2) : amount}
          </p>
          <p className="arcpay-confirm-recipient">
            To: {recipient}
          </p>
          {description && (
            <p className="arcpay-confirm-description">{description}</p>
          )}
          
          <div className="arcpay-confirm-actions">
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleConfirm}
              disabled={isTransferring}
            >
              {isTransferring ? <Spinner /> : 'Confirm Payment'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
```

### WalletWidget Implementation

```tsx
// src/components/wallet/WalletWidget.tsx
import React, { useState } from 'react';
import { useWallet, useBalance, useOnramp, useOfframp } from '../../hooks';
import { BalanceDisplay } from './BalanceDisplay';
import { AddressDisplay } from './AddressDisplay';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { SendMoney } from '../transfer/SendMoney';
import { FundWallet } from '../ramps/FundWallet';
import { CashOut } from '../ramps/CashOut';

export function WalletWidget({
  showBalance = true,
  showAddress = true,
  showActions = true,
  className,
}: WalletWidgetProps) {
  const { wallet, isConnected, connect, disconnect } = useWallet();
  const { balance } = useBalance();
  
  const [activeModal, setActiveModal] = useState<
    'send' | 'receive' | 'fund' | 'cashout' | null
  >(null);
  
  if (!isConnected) {
    return (
      <div className={`arcpay-widget arcpay-widget-disconnected ${className}`}>
        <p>Connect your wallet to get started</p>
        <Button onClick={connect}>Connect Wallet</Button>
      </div>
    );
  }
  
  return (
    <div className={`arcpay-widget ${className}`}>
      {showBalance && (
        <BalanceDisplay 
          balance={balance} 
          currency="USD" 
        />
      )}
      
      {showAddress && wallet && (
        <AddressDisplay address={wallet.address} />
      )}
      
      {showActions && (
        <div className="arcpay-widget-actions">
          <Button 
            variant="primary" 
            onClick={() => setActiveModal('send')}
          >
            Send
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => setActiveModal('receive')}
          >
            Receive
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setActiveModal('fund')}
          >
            Add Funds
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setActiveModal('cashout')}
          >
            Cash Out
          </Button>
        </div>
      )}
      
      {/* Modals */}
      <Modal 
        isOpen={activeModal === 'send'} 
        onClose={() => setActiveModal(null)}
        title="Send Money"
      >
        <SendMoney onSuccess={() => setActiveModal(null)} />
      </Modal>
      
      <Modal 
        isOpen={activeModal === 'fund'} 
        onClose={() => setActiveModal(null)}
        title="Add Funds"
      >
        <FundWallet onSuccess={() => setActiveModal(null)} />
      </Modal>
      
      <Modal 
        isOpen={activeModal === 'cashout'} 
        onClose={() => setActiveModal(null)}
        title="Cash Out"
      >
        <CashOut onSuccess={() => setActiveModal(null)} />
      </Modal>
    </div>
  );
}
```

---

## 📦 Build & Distribution

### Package.json

```json
{
  "name": "@arcpay/react",
  "version": "1.0.0",
  "description": "React SDK for USDC payments on Arc blockchain",
  "main": "dist/cjs/index.js",
  "module": "dist/esm/index.js",
  "types": "dist/types/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.js",
      "types": "./dist/types/index.d.ts"
    },
    "./styles": "./dist/styles/base.css"
  },
  "sideEffects": [
    "*.css"
  ],
  "files": [
    "dist",
    "README.md"
  ],
  "scripts": {
    "build": "rollup -c",
    "dev": "rollup -c -w",
    "test": "jest",
    "lint": "eslint src",
    "prepublishOnly": "npm run build"
  },
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  },
  "dependencies": {
    "@circle-fin/developer-controlled-wallets": "^2.0.0",
    "viem": "^2.0.0",
    "zustand": "^4.5.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@rollup/plugin-commonjs": "^25.0.0",
    "@rollup/plugin-node-resolve": "^15.0.0",
    "@rollup/plugin-typescript": "^11.0.0",
    "@types/react": "^18.0.0",
    "rollup": "^4.0.0",
    "rollup-plugin-postcss": "^4.0.0",
    "typescript": "^5.0.0"
  },
  "keywords": [
    "react",
    "usdc",
    "arc",
    "payments",
    "blockchain",
    "stablecoin",
    "circle"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/your-org/arcpay-react"
  },
  "license": "MIT"
}
```

### Rollup Config

```javascript
// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.ts',
  output: [
    {
      dir: 'dist/cjs',
      format: 'cjs',
      sourcemap: true,
      preserveModules: true,
    },
    {
      dir: 'dist/esm',
      format: 'esm',
      sourcemap: true,
      preserveModules: true,
    },
  ],
  external: ['react', 'react-dom'],
  plugins: [
    resolve(),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist/types',
    }),
    postcss({
      extract: 'styles/base.css',
      minimize: true,
    }),
    terser(),
  ],
};
```

---

## 📖 Documentation Site Structure

```
docs/
├── getting-started/
│   ├── installation.md
│   ├── quick-start.md
│   └── configuration.md
│
├── hooks/
│   ├── useWallet.md
│   ├── useBalance.md
│   ├── useTransfer.md
│   ├── useOnramp.md
│   └── useOfframp.md
│
├── components/
│   ├── PayButton.md
│   ├── WalletWidget.md
│   ├── SendMoney.md
│   └── FundWallet.md
│
├── guides/
│   ├── e-commerce-integration.md
│   ├── subscription-payments.md
│   ├── peer-to-peer.md
│   └── theming.md
│
└── api-reference/
    └── index.md
```

---

## 🚀 Usage Examples

### E-commerce Checkout

```tsx
import { ArcPayProvider, PayButton } from '@arcpay/react';

function Checkout({ cart, total }) {
  return (
    <ArcPayProvider apiKey={process.env.ARCPAY_KEY}>
      <div className="checkout">
        <h2>Order Summary</h2>
        {cart.items.map(item => (
          <div key={item.id}>{item.name} - ${item.price}</div>
        ))}
        <hr />
        <p>Total: ${total}</p>
        
        <PayButton
          amount={total}
          recipient="store@merchant.com"
          description={`Order #${cart.orderId}`}
          onSuccess={(tx) => {
            // Redirect to confirmation
            window.location.href = `/order/confirm?tx=${tx.hash}`;
          }}
        >
          Pay with USDC
        </PayButton>
      </div>
    </ArcPayProvider>
  );
}
```

### Tipping / Donations

```tsx
import { ArcPayProvider, PayButton, useWallet } from '@arcpay/react';

function TipJar({ creator }) {
  const amounts = [5, 10, 25, 50];
  
  return (
    <ArcPayProvider apiKey={process.env.ARCPAY_KEY}>
      <div className="tip-jar">
        <h3>Support {creator.name}</h3>
        <div className="tip-options">
          {amounts.map(amount => (
            <PayButton
              key={amount}
              amount={amount}
              recipient={creator.walletAddress}
              description={`Tip for ${creator.name}`}
              variant="outline"
            >
              ${amount}
            </PayButton>
          ))}
        </div>
      </div>
    </ArcPayProvider>
  );
}
```

### Subscription Service

```tsx
import { 
  ArcPayProvider, 
  WalletWidget, 
  useTransfer 
} from '@arcpay/react';

function SubscriptionPage({ plan }) {
  const { transfer, isTransferring } = useTransfer();
  
  const handleSubscribe = async () => {
    const result = await transfer({
      to: 'subscriptions@service.com',
      amount: plan.price,
      memo: `Subscription: ${plan.name}`,
    });
    
    // Call your backend to activate subscription
    await fetch('/api/activate-subscription', {
      method: 'POST',
      body: JSON.stringify({ 
        planId: plan.id, 
        txHash: result.hash 
      }),
    });
  };
  
  return (
    <ArcPayProvider apiKey={process.env.ARCPAY_KEY}>
      <div>
        <h2>{plan.name} - ${plan.price}/month</h2>
        <WalletWidget showActions={false} />
        <button 
          onClick={handleSubscribe}
          disabled={isTransferring}
        >
          Subscribe Now
        </button>
      </div>
    </ArcPayProvider>
  );
}
```

### P2P Payments App

```tsx
import { 
  ArcPayProvider, 
  WalletWidget,
  SendMoney,
  TransactionList,
  FundWallet,
  CashOut,
} from '@arcpay/react';

function PaymentApp() {
  return (
    <ArcPayProvider 
      apiKey={process.env.ARCPAY_KEY}
      theme="dark"
      enableContacts={true}
    >
      <div className="app">
        <WalletWidget />
        
        <nav>
          <NavLink to="/send">Send</NavLink>
          <NavLink to="/history">History</NavLink>
          <NavLink to="/settings">Settings</NavLink>
        </nav>
        
        <Routes>
          <Route path="/send" element={<SendMoney showContacts />} />
          <Route path="/history" element={<TransactionList />} />
          <Route path="/fund" element={<FundWallet />} />
          <Route path="/cashout" element={<CashOut />} />
        </Routes>
      </div>
    </ArcPayProvider>
  );
}
```

---

## 🔒 Security Considerations

1. **API Key Protection**
   - Never expose API keys in client-side code
   - Use environment variables
   - Implement backend proxy for sensitive operations

2. **Transaction Signing**
   - All transactions signed client-side with user's wallet
   - Support for hardware wallet signing
   - Clear transaction preview before signing

3. **Input Validation**
   - Validate all addresses before transactions
   - Amount validation with min/max limits
   - Rate limiting on transfer operations

4. **Secure Storage**
   - Wallet keys managed by Circle (MPC)
   - Session tokens stored securely
   - Auto-logout on inactivity

---

## 📊 SDK vs Central Management Comparison

| Feature | Central Management (Backend) | React SDK (Frontend) |
|---------|------------------------------|----------------------|
| AI Agent Payments | ✅ Full support | ❌ Not applicable |
| x402 Protocol | ✅ Server middleware | ❌ Client-side only |
| User Onramp | ✅ Via API | ✅ Embedded widget |
| P2P Transfers | ✅ Backend orchestrated | ✅ Direct client calls |
| Merchant Integration | ✅ API webhooks | ✅ React components |
| White-label | ⚠️ Limited | ✅ Full theming |
| Complexity | Higher | Lower |
| Use Case | AI agents, backends | Websites, apps |

---

## 🎯 Recommended Architecture: Both!

For a complete solution, use **both architectures**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         YOUR PLATFORM                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────┐        ┌────────────────────────┐          │
│  │   Central Backend      │        │   React SDK            │          │
│  │   (AI Agents, x402)    │        │   (@arcpay/react)      │          │
│  │                        │        │                        │          │
│  │  • Agent wallets       │        │  • User wallets        │          │
│  │  • Pay-per-use APIs    │        │  • P2P transfers       │          │
│  │  • Merchant webhooks   │        │  • Onramp/Offramp      │          │
│  │  • Business logic      │        │  • UI components       │          │
│  └───────────┬────────────┘        └───────────┬────────────┘          │
│              │                                  │                        │
│              └──────────────┬───────────────────┘                       │
│                             │                                            │
│                             ▼                                            │
│              ┌──────────────────────────────┐                           │
│              │     Shared Infrastructure     │                           │
│              │                              │                           │
│              │  • Circle Wallets API        │                           │
│              │  • Arc Blockchain            │                           │
│              │  • Circle Gateway            │                           │
│              │  • USDC                      │                           │
│              └──────────────────────────────┘                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

This gives you:
- **Backend** for AI agents, merchant APIs, and complex business logic
- **React SDK** for easy website integration and end-user features
- **Shared infrastructure** for consistent wallet and payment handling
