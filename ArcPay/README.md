# @arcpay/react

A complete React SDK for USDC payments on Arc blockchain. Think **"Stripe for Arc"** - add payments to your website with just a few lines of code.

[![npm version](https://badge.fury.io/js/%40arcpay%2Freact.svg)](https://www.npmjs.com/package/@arcpay/react)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Architecture Overview](#architecture-overview)
- [Provider Configuration](#provider-configuration)
- [Components](#components)
  - [Wallet Components](#wallet-components)
  - [Transfer Components](#transfer-components)
  - [Ramp Components](#ramp-components)
  - [History Components](#history-components)
  - [UI Components](#ui-components)
- [Hooks](#hooks)
- [Theming](#theming)
- [Component Customization](#component-customization)
  - [Quick Brand Colors](#quick-brand-colors)
  - [Tailwind / Custom CSS Classes](#tailwind--custom-css-classes)
  - [Headless Mode (Complete Redesign)](#headless-mode-complete-redesign)
- [Localization (i18n)](#localization-i18n)
- [External Wallet Support](#external-wallet-support)
- [Transaction Builder](#transaction-builder)
- [TypeScript Support](#typescript-support)
- [Examples](#examples)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Core Capabilities
- **Instant USDC Payments** - Send and receive USDC on Arc blockchain
- **Circle Wallet Integration** - Developer-controlled wallets via Circle API
- **External Wallet Support** - MetaMask, WalletConnect, and other injected wallets
- **Fiat On/Off Ramps** - Coinbase (buy USDC) and Transak (sell to bank)

### Developer Experience
- **Drop-in Components** - Pre-built UI components that just work
- **Flexible Hooks** - Build custom UIs with powerful React hooks
- **Full TypeScript Support** - Complete type definitions included
- **Tree-shakeable** - Only bundle what you use

### Customization
- **Theming System** - 3 built-in themes + full customization
- **Localization** - Multi-language support (EN, ES, FR, DE, PT, ZH)
- **Component Styling** - CSS classes for custom styling

### Security
- **MPC Wallets** - Keys secured via Circle's multi-party computation
- **Input Validation** - Built-in address and amount validation
- **Error Boundaries** - Graceful error handling

---

## Installation

```bash
npm install @arcpay/react
# or
yarn add @arcpay/react
# or
pnpm add @arcpay/react
```

### Peer Dependencies

```bash
npm install react react-dom
```

### Optional Dependencies

For WalletConnect support:
```bash
npm install @walletconnect/ethereum-provider
```

---

## Quick Start

### Minimal Setup (3 Lines)

```tsx
import { ArcPayProvider, PayButton } from '@arcpay/react';
import '@arcpay/react/styles';

function App() {
  return (
    <ArcPayProvider apiKey="your-api-key">
      <PayButton amount={10} recipient="merchant@example.com" />
    </ArcPayProvider>
  );
}
```

### Full Integration

```tsx
import {
  ArcPayProvider,
  WalletWidget,
  SendMoney,
  FundWallet,
  TransactionList,
  useWallet,
  useBalance
} from '@arcpay/react';
import '@arcpay/react/styles';

function App() {
  return (
    <ArcPayProvider
      apiKey={process.env.ARCPAY_API_KEY}
      network="arc-testnet"
      theme="default"
      locale="en"
      onTransaction={(tx) => console.log('Transaction:', tx)}
      onError={(error) => console.error('Error:', error)}
    >
      <PaymentDashboard />
    </ArcPayProvider>
  );
}

function PaymentDashboard() {
  const { wallet, isConnected, connect, disconnect } = useWallet();
  const { balance, isLoading } = useBalance();

  if (!isConnected) {
    return (
      <div className="connect-prompt">
        <h2>Welcome to ArcPay</h2>
        <p>Connect your wallet to get started</p>
        <button onClick={connect}>Connect Wallet</button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Pre-built wallet widget with all actions */}
      <WalletWidget />

      {/* Or build custom UI */}
      <div className="balance-card">
        <h3>Your Balance</h3>
        <p className="amount">${balance} USDC</p>
      </div>

      <div className="actions">
        <SendMoney showContacts />
        <FundWallet presetAmounts={[25, 50, 100, 250]} />
      </div>

      <TransactionList limit={10} />
    </div>
  );
}
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      @arcpay/react SDK                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    PROVIDER LAYER                        │   │
│  │  ArcPayProvider → WalletProvider → ThemeProvider         │   │
│  │                      ↓ I18nProvider                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                     HOOKS LAYER                          │   │
│  │  useWallet │ useBalance │ useTransfer │ usePayment       │   │
│  │  useOnramp │ useOfframp │ useContacts │ useExchangeRate  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  COMPONENTS LAYER                        │   │
│  │  WalletWidget │ PayButton │ SendMoney │ FundWallet       │   │
│  │  TransactionList │ QRCodeDisplay │ CashOut               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                     CORE LAYER                           │   │
│  │  CircleClient │ ArcClient │ PaymentProcessor             │   │
│  │  TransactionBuilder │ Wallet Adapters                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES                           │
│  Circle Wallets │ Arc Blockchain │ Coinbase │ Transak           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Provider Configuration

The `ArcPayProvider` is required and must wrap all ArcPay components.

```tsx
<ArcPayProvider
  // Required
  apiKey="your-api-key"

  // Network Configuration
  network="arc-testnet"           // 'arc-mainnet' | 'arc-testnet'

  // Feature Flags
  enableOnramp={true}             // Enable Coinbase onramp (default: true)
  enableOfframp={true}            // Enable Transak offramp (default: true)
  enableContacts={true}           // Enable saved contacts (default: true)

  // Wallet Configuration
  walletType="embedded"           // 'embedded' (Circle) | 'external' (MetaMask, etc.)

  // Theming
  theme="default"                 // 'default' | 'dark' | 'minimal' | ThemeConfig

  // Localization
  locale="en"                     // 'en' | 'es' | 'fr' | 'de' | 'pt' | 'zh'
  currency="USD"                  // 'USD' | 'EUR' | 'GBP'

  // Event Callbacks
  onConnect={(wallet) => {}}      // Called when wallet connects
  onDisconnect={() => {}}         // Called when wallet disconnects
  onTransaction={(tx) => {}}      // Called on any transaction
  onError={(error) => {}}         // Called on any error
>
  {children}
</ArcPayProvider>
```

### Configuration Interface

```typescript
interface ArcPayConfig {
  apiKey: string;
  network?: 'arc-mainnet' | 'arc-testnet';
  theme?: 'default' | 'dark' | 'minimal' | ThemeConfig;
  enableOnramp?: boolean;
  enableOfframp?: boolean;
  enableContacts?: boolean;
  walletType?: 'embedded' | 'external';
  locale?: 'en' | 'es' | 'fr' | 'de' | 'pt' | 'zh';
  currency?: 'USD' | 'EUR' | 'GBP';
  onConnect?: (wallet: Wallet) => void;
  onDisconnect?: () => void;
  onTransaction?: (tx: Transaction) => void;
  onError?: (error: ArcPayError) => void;
}
```

---

## Components

### Wallet Components

#### `<WalletWidget />`

Complete wallet UI with balance, address, and action buttons.

```tsx
<WalletWidget
  showBalance={true}          // Show balance display
  showAddress={true}          // Show wallet address
  showActions={true}          // Show send/receive/fund buttons
  onSend={() => {}}           // Custom send handler
  onReceive={() => {}}        // Custom receive handler
  onFund={() => {}}           // Custom fund handler
  className="my-widget"       // Custom CSS class
/>
```

#### `<WalletButton />`

Connect/disconnect wallet button.

```tsx
<WalletButton
  variant="primary"           // 'primary' | 'secondary' | 'outline'
  size="md"                   // 'sm' | 'md' | 'lg'
  showAddress={true}          // Show address when connected
  className="my-button"
/>
```

#### `<BalanceDisplay />`

Display USDC balance.

```tsx
<BalanceDisplay
  showCurrency={true}         // Show "USDC" label
  showRefresh={true}          // Show refresh button
  size="lg"                   // 'sm' | 'md' | 'lg'
/>
```

#### `<AddressDisplay />`

Display wallet address with copy functionality.

```tsx
<AddressDisplay
  truncate={true}             // Truncate address (0x1234...5678)
  showCopy={true}             // Show copy button
  showQR={false}              // Show QR code button
/>
```

---

### Transfer Components

#### `<PayButton />`

One-click payment button.

```tsx
<PayButton
  // Required
  amount={99.99}
  recipient="merchant@store.com"

  // Optional
  description="Order #12345"
  onSuccess={(tx) => console.log('Paid!', tx)}
  onError={(err) => console.error(err)}

  // Styling
  variant="primary"           // 'primary' | 'secondary' | 'outline'
  size="md"                   // 'sm' | 'md' | 'lg'
  fullWidth={false}
  className="pay-btn"

  // Custom content
  children="Pay Now"          // Custom button text
  icon={<PayIcon />}          // Custom icon
/>
```

#### `<SendMoney />`

Full transfer form with recipient input and amount.

```tsx
<SendMoney
  // Pre-fill values
  defaultRecipient="friend@email.com"
  defaultAmount={50}

  // Limits
  minAmount={1}
  maxAmount={10000}

  // Features
  showContacts={true}         // Show saved contacts
  showQRScanner={true}        // Show QR scanner button

  // Callbacks
  onSuccess={(tx) => {}}
  onCancel={() => {}}

  className="send-form"
/>
```

#### `<PaymentForm />`

Create payment requests (invoices).

```tsx
<PaymentForm
  onSubmit={(request) => {
    console.log('Payment request created:', request);
  }}
  showDescription={true}
  showExpiry={true}
/>
```

#### `<QRCodeDisplay />`

Display QR code for receiving payments.

```tsx
<QRCodeDisplay
  value="arcpay:0x1234..."    // Payment URL or address
  size={256}                  // QR code size in pixels
  showLogo={true}             // Show ArcPay logo in center
  logoUrl="/my-logo.png"      // Custom logo URL
/>
```

#### `<RecipientInput />`

Address/email input with validation.

```tsx
<RecipientInput
  value={recipient}
  onChange={setRecipient}
  placeholder="Address, email, or phone"
  showContacts={true}         // Show contacts dropdown
  onValidation={(result) => {}}
/>
```

---

### Ramp Components

#### `<FundWallet />`

Add funds via Coinbase onramp.

```tsx
<FundWallet
  // Pre-fill
  defaultAmount={100}

  // Options
  presetAmounts={[25, 50, 100, 250]}
  provider="coinbase"         // 'coinbase' | 'transak' | 'auto'

  // Display
  inline={false}              // Inline vs modal

  // Callbacks
  onSuccess={(result) => console.log('Funded:', result)}
  onError={(err) => console.error(err)}

  className="fund-widget"
/>
```

#### `<CashOut />`

Withdraw USDC to bank via Transak.

```tsx
<CashOut
  defaultAmount={100}
  minAmount={20}
  maxAmount={5000}

  onSuccess={(result) => console.log('Cashed out:', result)}
  onError={(err) => console.error(err)}

  className="cashout-widget"
/>
```

#### `<RampModal />`

Modal wrapper for ramp widgets.

```tsx
<RampModal
  isOpen={showRamp}
  onClose={() => setShowRamp(false)}
  type="onramp"               // 'onramp' | 'offramp'
  provider="coinbase"
/>
```

---

### History Components

#### `<TransactionList />`

Transaction history list.

```tsx
<TransactionList
  limit={20}                  // Max transactions to show
  filter="all"                // 'all' | 'sent' | 'received'
  onTransactionClick={(tx) => showDetails(tx)}
  emptyMessage="No transactions yet"
  className="tx-list"
/>
```

#### `<TransactionItem />`

Single transaction row.

```tsx
<TransactionItem
  transaction={tx}
  onClick={() => showDetails(tx)}
  showStatus={true}
  showTime={true}
/>
```

#### `<TransactionDetail />`

Full transaction details view.

```tsx
<TransactionDetail
  transaction={tx}
  onClose={() => setSelectedTx(null)}
  showExplorerLink={true}
/>
```

---

### UI Components

Base UI components used internally, also exported for custom UIs.

```tsx
import { Button, Input, Modal, Spinner, Toast } from '@arcpay/react';

<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>

<Input
  type="text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  placeholder="Enter amount"
  error="Invalid amount"
/>

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Payment"
>
  <p>Are you sure?</p>
</Modal>

<Spinner size="md" />

<Toast
  message="Transaction successful!"
  type="success"
  onClose={() => {}}
/>
```

---

## Hooks

### `useWallet()`

Wallet connection and management.

```typescript
const {
  // State
  wallet,                     // Wallet | null
  address,                    // string | null
  isConnected,                // boolean
  isConnecting,               // boolean

  // Actions
  connect,                    // () => Promise<void>
  disconnect,                 // () => void
  createWallet,               // (options?: CreateWalletOptions) => Promise<Wallet>

  // Utils
  copyAddress,                // () => void
  getQRCode,                  // () => string
} = useWallet();
```

### `useBalance()`

USDC balance management.

```typescript
const {
  balance,                    // string - Formatted: "100.00"
  balanceRaw,                 // bigint - Raw: 100000000n
  isLoading,                  // boolean
  error,                      // Error | null
  refetch,                    // () => Promise<void>
} = useBalance();
```

### `useTransfer()`

Send USDC transfers.

```typescript
const {
  // State
  isTransferring,             // boolean
  lastTransaction,            // Transaction | null

  // Actions
  transfer,                   // (params: TransferParams) => Promise<TransactionResult>
  estimateFee,                // (params: TransferParams) => Promise<string>

  // Validation
  validateRecipient,          // (recipient: string) => ValidationResult
} = useTransfer();

// Usage
const result = await transfer({
  to: '0x1234...',
  amount: '50.00',
  memo: 'Payment for services',
});
```

### `useOnramp()`

Fiat to USDC conversion.

```typescript
const {
  isOpen,                     // boolean
  isPending,                  // boolean
  openOnramp,                 // (options?: OnrampOptions) => void
  closeOnramp,                // () => void
  onSuccess,                  // (callback: (result) => void) => void
  onError,                    // (callback: (error) => void) => void
} = useOnramp();

// Usage
openOnramp({
  amount: 100,
  currency: 'USD',
  provider: 'coinbase',
});
```

### `useOfframp()`

USDC to fiat conversion.

```typescript
const {
  isOpen,                     // boolean
  isPending,                  // boolean
  openOfframp,                // (options?: OfframpOptions) => void
  closeOfframp,               // () => void
} = useOfframp();
```

### `usePayment()`

Payment request creation and processing.

```typescript
const {
  createPaymentRequest,       // (params) => PaymentRequest
  payRequest,                 // (request) => Promise<TransactionResult>
  getPaymentQR,               // (request) => string
  parsePaymentRequest,        // (data: string) => PaymentRequest | null
} = usePayment();

// Create invoice
const request = createPaymentRequest({
  amount: '99.99',
  recipient: '0x1234...',
  description: 'Invoice #123',
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
});

// Get QR code for request
const qrData = getPaymentQR(request);
```

### `useTransactionHistory()`

Transaction history with pagination.

```typescript
const {
  transactions,               // Transaction[]
  isLoading,                  // boolean
  hasMore,                    // boolean
  loadMore,                   // () => Promise<void>
  refresh,                    // () => Promise<void>
  filter,                     // (filters: TransactionFilters) => void
} = useTransactionHistory();
```

### `useContacts()`

Saved recipients management.

```typescript
const {
  contacts,                   // Contact[]
  addContact,                 // (contact) => Promise<Contact>
  removeContact,              // (id: string) => void
  updateContact,              // (id: string, updates) => void
  findByAddress,              // (address: string) => Contact | undefined
} = useContacts();
```

### `useExchangeRate()`

Currency conversion rates.

```typescript
const {
  rate,                       // number (e.g., 1.0 for USD/USDC)
  convert,                    // (amount: number, from: string, to: string) => number
  isLoading,                  // boolean
  lastUpdated,                // Date
} = useExchangeRate();
```

### `useQRCode()`

QR code generation for payments.

```typescript
const {
  generateQR,                 // (data: string) => string (data URL)
  parseQR,                    // (image: File) => Promise<string>
} = useQRCode();
```

---

## Theming

### Built-in Themes

```tsx
// Default theme (light)
<ArcPayProvider theme="default" />

// Dark theme
<ArcPayProvider theme="dark" />

// Minimal theme (less visual elements)
<ArcPayProvider theme="minimal" />
```

### Custom Theme

```tsx
<ArcPayProvider
  theme={{
    colors: {
      primary: '#0052FF',
      secondary: '#00D632',
      background: '#FFFFFF',
      surface: '#F7F8FA',
      text: '#0A0B0D',
      textSecondary: '#5B616E',
      success: '#00D632',
      error: '#FF3B3B',
      warning: '#FFB020',
      border: '#E8EAED',
    },
    fonts: {
      body: 'Inter, system-ui, sans-serif',
      heading: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    radii: {
      sm: '4px',
      md: '8px',
      lg: '16px',
      full: '9999px',
    },
    shadows: {
      sm: '0 1px 2px rgba(0,0,0,0.05)',
      md: '0 4px 6px rgba(0,0,0,0.1)',
      lg: '0 10px 15px rgba(0,0,0,0.1)',
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
    },
  }}
/>
```

### CSS Variables

All theme values are exposed as CSS variables:

```css
.my-component {
  background: var(--arcpay-color-background);
  color: var(--arcpay-color-text);
  border-radius: var(--arcpay-radius-md);
  padding: var(--arcpay-spacing-md);
  box-shadow: var(--arcpay-shadow-sm);
  font-family: var(--arcpay-font-body);
}
```

---

## Component Customization

ArcPay offers three levels of customization to match your needs:

| Approach | Use Case | Effort | Flexibility |
|----------|----------|--------|-------------|
| **Quick Brand Colors** | Match your brand colors | ⭐ Low | Medium |
| **Tailwind / CSS Classes** | Custom styling with your CSS framework | ⭐⭐ Medium | High |
| **Headless Mode** | Complete UI redesign | ⭐⭐⭐ High | Full |

---

### Quick Brand Colors

Override theme tokens to quickly apply your brand colors. Perfect for matching your app's color scheme without writing custom CSS.

#### Basic Color Override

```tsx
import { ArcPayProvider } from '@arcpay/react';

<ArcPayProvider
  apiKey="your-api-key"
  theme={{
    colors: {
      primary: '#6366F1',        // Indigo brand color
      primaryHover: '#4F46E5',   // Hover state
      primaryActive: '#4338CA',  // Active/pressed state
    },
  }}
>
  {/* Components will use your brand colors */}
  <WalletButton />
  <PayButton amount={100} recipient="merchant@example.com" />
</ArcPayProvider>
```

#### Complete Brand Kit

```tsx
<ArcPayProvider
  apiKey="your-api-key"
  theme={{
    colors: {
      // Brand colors
      primary: '#0066FF',
      primaryHover: '#0052CC',
      primaryActive: '#003D99',
      secondary: '#6B7280',
      secondaryHover: '#4B5563',

      // Surface colors
      background: '#FFFFFF',
      surface: '#F9FAFB',
      surfaceHover: '#F3F4F6',

      // Text colors
      text: '#111827',
      textSecondary: '#6B7280',
      textMuted: '#9CA3AF',

      // Status colors
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
    },
    fonts: {
      body: '"Inter", system-ui, sans-serif',
      heading: '"Inter", system-ui, sans-serif',
      mono: '"Fira Code", monospace',
    },
    radii: {
      sm: '6px',
      md: '8px',
      lg: '12px',
      full: '9999px',
    },
  }}
>
  {children}
</ArcPayProvider>
```

#### Component-Specific Tokens

Fine-tune individual component styles:

```tsx
<ArcPayProvider
  apiKey="your-api-key"
  theme={{
    components: {
      button: {
        borderRadius: '12px',
        fontWeight: '600',
        paddingX: '24px',
        paddingY: '12px',
      },
      input: {
        borderRadius: '8px',
        borderWidth: '2px',
        paddingX: '16px',
        paddingY: '12px',
      },
      card: {
        borderRadius: '16px',
        padding: '24px',
        shadow: '0 4px 12px rgba(0,0,0,0.1)',
      },
      modal: {
        borderRadius: '20px',
        padding: '32px',
        backdropColor: 'rgba(0,0,0,0.6)',
      },
    },
  }}
>
  {children}
</ArcPayProvider>
```

#### Use Theme Values in Custom Components

Access theme tokens in your own components:

```tsx
import { useTheme, useThemeToken } from '@arcpay/react';

function MyCustomCard({ children }) {
  const { theme } = useTheme();
  const colors = useThemeToken('colors');
  const spacing = useThemeToken('spacing');

  return (
    <div style={{
      background: colors.surface,
      padding: spacing.lg,
      borderRadius: theme.radii.lg,
    }}>
      {children}
    </div>
  );
}
```

---

### Tailwind / Custom CSS Classes

All components accept `className` for simple styling, and `classNames` for targeting specific internal elements (slots).

#### Basic className

```tsx
// Add a class to the component root
<WalletButton className="my-wallet-button" />

<PayButton
  amount={100}
  recipient="merchant@example.com"
  className="shadow-lg hover:shadow-xl transition-shadow"
/>
```

#### Slot-based classNames

Target specific parts of a component using the `classNames` prop:

```tsx
// WalletButton slots: root, address, connectText
<WalletButton
  classNames={{
    root: 'bg-gradient-to-r from-purple-500 to-pink-500 rounded-full px-6 py-3',
    address: 'font-mono text-sm text-white/80',
    connectText: 'font-bold text-white',
  }}
/>
```

```tsx
// PayButton slots: root, content, icon, modal, confirmAmount,
//                  confirmRecipient, confirmDescription, confirmActions,
//                  confirmButton, cancelButton
<PayButton
  amount={99.99}
  recipient="store@merchant.com"
  classNames={{
    root: 'bg-green-600 hover:bg-green-700 rounded-xl font-semibold',
    content: 'flex items-center gap-2',
    icon: 'w-5 h-5',
    confirmButton: 'bg-green-600 hover:bg-green-700',
    cancelButton: 'text-gray-500 hover:text-gray-700',
  }}
/>
```

```tsx
// WalletWidget slots: root, header, balance, address, actions,
//                     actionButton, sendButton, receiveButton,
//                     fundButton, disconnectButton
<WalletWidget
  classNames={{
    root: 'bg-gray-900 rounded-2xl p-6 shadow-2xl',
    header: 'border-b border-gray-700 pb-4 mb-4',
    balance: 'text-4xl font-bold text-white',
    address: 'text-gray-400 font-mono text-sm',
    actions: 'grid grid-cols-2 gap-3 mt-4',
    actionButton: 'bg-gray-800 hover:bg-gray-700 rounded-lg py-3',
    sendButton: 'bg-blue-600 hover:bg-blue-700',
    fundButton: 'bg-green-600 hover:bg-green-700',
  }}
/>
```

```tsx
// Button slots: root, spinner, content
<Button
  classNames={{
    root: 'bg-indigo-600 hover:bg-indigo-700 rounded-lg px-6 py-3',
    spinner: 'text-white/50',
    content: 'font-medium',
  }}
>
  Custom Button
</Button>
```

#### Class Name Strategy

Control how custom classes merge with defaults:

```tsx
// 'merge' (default) - Combine with default styles
<WalletButton
  classNameStrategy="merge"
  classNames={{ root: 'shadow-lg' }}  // Adds shadow to existing styles
/>

// 'replace' - Override default styles entirely
<WalletButton
  classNameStrategy="replace"
  classNames={{ root: 'my-custom-button' }}  // Only your classes apply
/>
```

#### Using the cn Utility

Import the `cn` utility to build class strings:

```tsx
import { cn } from '@arcpay/react';

function MyComponent({ isPrimary, isLarge, className }) {
  return (
    <button
      className={cn(
        'base-button',
        isPrimary && 'bg-blue-500 text-white',
        isLarge && 'text-lg px-6 py-3',
        className
      )}
    >
      Click me
    </button>
  );
}
```

#### Complete Tailwind Example

```tsx
import { WalletWidget, PayButton } from '@arcpay/react';

function StyledPaymentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-md mx-auto space-y-6">
        {/* Fully styled wallet widget */}
        <WalletWidget
          classNames={{
            root: 'bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20',
            balance: 'text-5xl font-bold text-white tracking-tight',
            address: 'text-blue-300 font-mono text-sm mt-2',
            actions: 'flex gap-4 mt-8',
            actionButton: 'flex-1 bg-white/10 hover:bg-white/20 text-white rounded-xl py-4 transition-colors',
            sendButton: 'bg-blue-500 hover:bg-blue-600',
            fundButton: 'bg-emerald-500 hover:bg-emerald-600',
          }}
        />

        {/* Styled pay button */}
        <PayButton
          amount={49.99}
          recipient="store@example.com"
          classNames={{
            root: 'w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl hover:shadow-indigo-500/40',
            content: 'flex items-center justify-center gap-3',
          }}
        >
          <span>💳</span>
          <span>Pay $49.99</span>
        </PayButton>
      </div>
    </div>
  );
}
```

---

### Headless Mode (Complete Redesign)

For complete control over UI, use headless mode. Components provide logic and state via render props while you supply the entire UI.

#### Headless WalletButton

```tsx
import { WalletButton } from '@arcpay/react';

<WalletButton headless>
  {({ isConnected, isConnecting, connect, disconnect, formattedAddress }) => (
    <button
      onClick={isConnected ? disconnect : connect}
      className="my-custom-wallet-btn"
      disabled={isConnecting}
    >
      {isConnecting ? (
        <MySpinner />
      ) : isConnected ? (
        <>
          <WalletIcon />
          <span>{formattedAddress}</span>
          <ChevronDown />
        </>
      ) : (
        <>
          <WalletIcon />
          <span>Connect Wallet</span>
        </>
      )}
    </button>
  )}
</WalletButton>
```

#### Headless PayButton

```tsx
import { PayButton } from '@arcpay/react';

<PayButton
  headless
  amount={99.99}
  recipient="merchant@store.com"
  description="Order #12345"
  onSuccess={(tx) => console.log('Success!', tx)}
>
  {({
    isConnected,
    isProcessing,
    isConfirmOpen,
    formattedAmount,
    recipient,
    initiatePayment,
    confirmPayment,
    cancelPayment,
    connect,
    error,
  }) => (
    <>
      {/* Main pay button */}
      <button
        onClick={isConnected ? initiatePayment : connect}
        disabled={isProcessing}
        className="pay-btn"
      >
        {isProcessing ? 'Processing...' : `Pay ${formattedAmount}`}
      </button>

      {/* Custom confirmation modal */}
      {isConfirmOpen && (
        <MyModal onClose={cancelPayment}>
          <h2>Confirm Payment</h2>
          <p>Amount: {formattedAmount}</p>
          <p>To: {recipient}</p>

          {error && <p className="error">{error.message}</p>}

          <div className="actions">
            <button onClick={cancelPayment}>Cancel</button>
            <button onClick={confirmPayment}>Confirm</button>
          </div>
        </MyModal>
      )}
    </>
  )}
</PayButton>
```

#### Headless WalletWidget

```tsx
import { WalletWidget } from '@arcpay/react';

<WalletWidget headless>
  {({
    wallet,
    address,
    isConnected,
    balance,
    isBalanceLoading,
    formattedAddress,
    connect,
    disconnect,
    refreshBalance,
    openSend,
    openReceive,
    openFund,
    activeModal,
    closeModals,
  }) => (
    <div className="my-wallet-widget">
      {isConnected ? (
        <>
          <header>
            <span className="address">{formattedAddress}</span>
            <button onClick={disconnect}>Disconnect</button>
          </header>

          <div className="balance">
            {isBalanceLoading ? (
              <Skeleton />
            ) : (
              <span>${balance} USDC</span>
            )}
            <button onClick={refreshBalance}>↻</button>
          </div>

          <nav className="actions">
            <button onClick={openSend}>Send</button>
            <button onClick={openReceive}>Receive</button>
            <button onClick={openFund}>Add Funds</button>
          </nav>

          {/* Handle modals */}
          {activeModal === 'send' && <MySendModal onClose={closeModals} />}
          {activeModal === 'receive' && <MyReceiveModal address={address} onClose={closeModals} />}
        </>
      ) : (
        <button onClick={connect} className="connect-btn">
          Connect Wallet
        </button>
      )}
    </div>
  )}
</WalletWidget>
```

#### Using Headless Hooks Directly

For maximum flexibility, use headless hooks in your own components:

```tsx
import {
  useWalletButtonHeadless,
  usePayButtonHeadless,
  useWalletWidgetHeadless,
} from '@arcpay/react';

function MyCustomWalletButton() {
  const {
    wallet,
    address,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    formattedAddress,
  } = useWalletButtonHeadless({
    onConnect: () => console.log('Connected!'),
    onDisconnect: () => console.log('Disconnected!'),
  });

  return (
    <button onClick={isConnected ? disconnect : connect}>
      {isConnecting ? 'Connecting...' : isConnected ? formattedAddress : 'Connect'}
    </button>
  );
}

function MyCustomPayButton() {
  const {
    isProcessing,
    isConfirmOpen,
    formattedAmount,
    initiatePayment,
    confirmPayment,
    cancelPayment,
    error,
  } = usePayButtonHeadless({
    amount: 50,
    recipient: '0x1234...',
    onSuccess: (tx) => alert(`Paid! ${tx.hash}`),
  });

  return (
    <>
      <button onClick={initiatePayment} disabled={isProcessing}>
        Pay {formattedAmount}
      </button>

      {isConfirmOpen && (
        <ConfirmDialog
          onConfirm={confirmPayment}
          onCancel={cancelPayment}
          error={error}
        />
      )}
    </>
  );
}
```

#### Slots: Partial Customization

Replace specific parts of a component while keeping the rest:

```tsx
import { WalletWidget } from '@arcpay/react';

// Define custom slot components
const CustomBalance = ({ balance, isLoading }) => (
  <div className="my-balance">
    {isLoading ? '...' : `💰 ${balance} USDC`}
  </div>
);

const CustomActions = ({ onSend, onReceive, onFund }) => (
  <div className="my-actions">
    <IconButton icon="↑" onClick={onSend} label="Send" />
    <IconButton icon="↓" onClick={onReceive} label="Receive" />
    <IconButton icon="+" onClick={onFund} label="Fund" />
  </div>
);

// Use slots
<WalletWidget
  slots={{
    balance: CustomBalance,
    actions: CustomActions,
  }}
/>
```

#### Render Props TypeScript Types

All render props are fully typed:

```typescript
import type {
  WalletButtonRenderProps,
  PayButtonRenderProps,
  WalletWidgetRenderProps,
} from '@arcpay/react';

// Use in your components
const MyButton: React.FC = () => (
  <WalletButton headless>
    {(props: WalletButtonRenderProps) => (
      <button onClick={props.connect}>
        {props.formattedAddress ?? 'Connect'}
      </button>
    )}
  </WalletButton>
);
```

---

### Customization Comparison

| Feature | Theme Override | classNames | Headless |
|---------|---------------|------------|----------|
| Brand colors | ✅ | - | - |
| Component tokens | ✅ | - | - |
| CSS Variables | ✅ | - | - |
| Tailwind classes | - | ✅ | ✅ |
| Target specific slots | - | ✅ | ✅ |
| Custom HTML structure | - | - | ✅ |
| Custom components | - | - | ✅ |
| Render props | - | - | ✅ |
| Full logic access | - | - | ✅ |

---

## Localization (i18n)

### Supported Languages

- English (en) - Default
- Spanish (es)
- French (fr)
- German (de)
- Portuguese (pt)
- Chinese (zh)

### Usage

```tsx
<ArcPayProvider locale="es">
  {/* All components will display in Spanish */}
</ArcPayProvider>
```

### Using the Translation Hook

```tsx
import { useI18n } from '@arcpay/react';

function MyComponent() {
  const { t, locale, setLocale } = useI18n();

  return (
    <div>
      <h1>{t('wallet.connect')}</h1>
      <p>{t('transfer.amount')}</p>

      <select value={locale} onChange={(e) => setLocale(e.target.value)}>
        <option value="en">English</option>
        <option value="es">Español</option>
      </select>
    </div>
  );
}
```

---

## External Wallet Support

### MetaMask / Injected Wallets

```tsx
import { useWallet, detectInjectedWallet } from '@arcpay/react';

function ConnectMetaMask() {
  const { connect } = useWallet();
  const injected = detectInjectedWallet();

  if (!injected) {
    return <p>No wallet detected. Please install MetaMask.</p>;
  }

  return (
    <button onClick={() => connect('external')}>
      Connect {injected.name}
    </button>
  );
}
```

### WalletConnect

First, install the peer dependency:

```bash
npm install @walletconnect/ethereum-provider
```

Then configure:

```tsx
import { ArcPayProvider } from '@arcpay/react';

<ArcPayProvider
  apiKey="your-api-key"
  walletConnect={{
    projectId: 'your-walletconnect-project-id',
    chains: [1, 137],  // Ethereum, Polygon
    showQrModal: true,
    metadata: {
      name: 'My App',
      description: 'My payment app',
      url: 'https://myapp.com',
      icons: ['https://myapp.com/icon.png'],
    },
  }}
>
```

---

## Transaction Builder

For complex multi-step transactions:

```tsx
import { TransactionBuilder } from '@arcpay/react';

const builder = new TransactionBuilder();

// Add multiple transactions
builder
  .add({
    id: 'step1',
    type: 'transfer',
    to: '0x1234...',
    amount: '50',
    memo: 'First payment',
  })
  .add({
    id: 'step2',
    type: 'transfer',
    to: '0x5678...',
    amount: '25',
    memo: 'Second payment',
    dependsOn: ['step1'],  // Wait for step1 to complete
  });

// Execute all transactions
const results = await builder.execute();
```

---

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import type {
  // Wallet types
  Wallet,
  WalletBalance,
  WalletType,
  WalletStatus,

  // Transaction types
  Transaction,
  TransactionResult,
  TransferParams,
  TransactionFilters,

  // Payment types
  PaymentRequest,
  PaymentRequestParams,
  OnrampOptions,
  OfframpOptions,

  // Config types
  ArcPayConfig,
  NetworkType,
  LocaleType,

  // Theme types
  ThemeConfig,
  ThemeColors,

  // Error types
  ArcPayError,
} from '@arcpay/react';
```

---

## Examples

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

### P2P Payments App

```tsx
function PaymentApp() {
  return (
    <ArcPayProvider
      apiKey={process.env.ARCPAY_KEY}
      theme="dark"
      enableContacts={true}
    >
      <div className="app">
        <WalletWidget />

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

### Subscription Payments

```tsx
function SubscriptionPage({ plan }) {
  const { transfer, isTransferring } = useTransfer();

  const handleSubscribe = async () => {
    const result = await transfer({
      to: 'subscriptions@service.com',
      amount: plan.price,
      memo: `Subscription: ${plan.name}`,
    });

    // Activate subscription on your backend
    await fetch('/api/activate-subscription', {
      method: 'POST',
      body: JSON.stringify({
        planId: plan.id,
        txHash: result.hash,
      }),
    });
  };

  return (
    <div>
      <h2>{plan.name} - ${plan.price}/month</h2>
      <WalletWidget showActions={false} />
      <button onClick={handleSubscribe} disabled={isTransferring}>
        {isTransferring ? 'Processing...' : 'Subscribe Now'}
      </button>
    </div>
  );
}
```

---

## API Reference

### Circle Client

Direct access to Circle Wallets API:

```tsx
import { useArcPay } from '@arcpay/react';

function MyComponent() {
  const { circleClient } = useArcPay();

  // Use Circle client directly
  const wallet = await circleClient.createWallet('user-123');
  const balance = await circleClient.getBalance(wallet.id);
}
```

### Arc Client

Direct access to Arc blockchain:

```tsx
import { useArcPay } from '@arcpay/react';

function MyComponent() {
  const { arcClient } = useArcPay();

  // Check on-chain balance
  const balance = await arcClient.getUSDCBalance('0x1234...');

  // Wait for transaction confirmation
  const receipt = await arcClient.waitForTransaction(txHash);
}
```

---

## Testing

The SDK includes comprehensive testing utilities to help you test your ArcPay integration.

### Installation

Testing utilities are included in the main package:

```typescript
import {
  MockArcPayProvider,
  createWallet,
  createTransaction,
  createTestWrapper,
  useTestActions,
  assertions,
} from '@arcpay/react/testing';
```

### Mock Provider

Wrap your components with `MockArcPayProvider` for testing:

```tsx
import { render, screen } from '@testing-library/react';
import { MockArcPayProvider, createWallet } from '@arcpay/react/testing';
import { WalletWidget } from '@arcpay/react';

describe('WalletWidget', () => {
  it('shows connected state', () => {
    const wallet = createWallet({ address: '0x1234...' });

    render(
      <MockArcPayProvider mockConfig={{
        wallet,
        isConnected: true,
        balance: '100.00',
      }}>
        <WalletWidget />
      </MockArcPayProvider>
    );

    expect(screen.getByText('$100.00')).toBeInTheDocument();
  });

  it('shows connect button when disconnected', () => {
    render(
      <MockArcPayProvider mockConfig={{ isConnected: false }}>
        <WalletWidget />
      </MockArcPayProvider>
    );

    expect(screen.getByText(/connect/i)).toBeInTheDocument();
  });
});
```

### Test Wrapper for @testing-library/react

Use `createTestWrapper` with the wrapper pattern:

```tsx
import { render } from '@testing-library/react';
import { createTestWrapper } from '@arcpay/react/testing';
import { PayButton } from '@arcpay/react';

it('renders pay button', () => {
  const wrapper = createTestWrapper({
    isConnected: true,
    balance: '500.00',
  });

  render(<PayButton amount={100} recipient="0x..." />, { wrapper });

  expect(screen.getByRole('button')).toBeInTheDocument();
});
```

### Test Fixtures

Create realistic test data with factory functions:

```typescript
import {
  createWallet,
  createTransaction,
  createTransactions,
  createPaymentRequest,
  createBalance,
  mockAddresses,
  setSeed,
} from '@arcpay/react/testing';

// Create wallet with defaults
const wallet = createWallet();

// Create with specific values
const customWallet = createWallet({
  address: '0x1234567890abcdef...',
  type: 'circle',
});

// Create transactions
const tx = createTransaction({ state: 'COMPLETE', amount: '50.00' });
const txHistory = createTransactions(5, { type: 'transfer' });

// Create balance
const { balance, balanceRaw } = createBalance('1000.00');
// balance: '1000.00', balanceRaw: 1000000000n

// Use mock addresses
console.log(mockAddresses.alice);   // '0x1234...'
console.log(mockAddresses.bob);     // '0x0987...'
console.log(mockAddresses.merchant); // '0x1111...'

// Reproducible tests
setSeed(12345);
const wallet1 = createWallet(); // Always same result
```

### Simulate User Actions

Use `useTestActions` hook to simulate wallet events:

```tsx
import { MockArcPayProvider, useTestActions } from '@arcpay/react/testing';

function TestHelper() {
  const {
    simulateConnect,
    simulateDisconnect,
    simulateTransaction,
    simulateBalanceUpdate,
    simulateError,
  } = useTestActions();

  return (
    <div>
      <button onClick={() => simulateConnect()}>
        Simulate Connect
      </button>
      <button onClick={() => simulateBalanceUpdate('500.00')}>
        Update Balance
      </button>
      <button onClick={() => simulateTransaction({ amount: '100.00' })}>
        Add Transaction
      </button>
      <button onClick={() => simulateError(new Error('Failed'))}>
        Simulate Error
      </button>
    </div>
  );
}

// In your test
render(
  <MockArcPayProvider>
    <YourComponent />
    <TestHelper />
  </MockArcPayProvider>
);

// Click buttons to simulate events
fireEvent.click(screen.getByText('Simulate Connect'));
```

### Assertions

Use built-in assertions for common checks:

```typescript
import { assertions } from '@arcpay/react/testing';

it('verifies wallet state', () => {
  const mockState = { isConnected: true, wallet: {...}, balance: '100.00' };

  assertions.expectConnected(mockState);
  assertions.expectBalance(mockState, '100.00');
  assertions.expectTransactionCount(mockState, 0);
});
```

---

## Health Check

Monitor your SDK configuration and connectivity with the `useHealthCheck` hook:

```tsx
import { useHealthCheck } from '@arcpay/react';

function HealthStatus() {
  const { report, isChecking, runCheck, status } = useHealthCheck();

  if (isChecking) return <Spinner />;

  return (
    <div className="health-status">
      <div className={`status-badge status-${status}`}>
        {status === 'healthy' && '✅ Healthy'}
        {status === 'degraded' && '⚠️ Degraded'}
        {status === 'unhealthy' && '❌ Unhealthy'}
      </div>

      <button onClick={runCheck}>Refresh</button>

      {report && (
        <div className="checks">
          <p>Passed: {report.summary.passed}</p>
          <p>Warnings: {report.summary.warnings}</p>
          <p>Failed: {report.summary.failed}</p>

          <ul>
            {report.checks.map(check => (
              <li key={check.name}>
                {check.status === 'pass' ? '✅' :
                 check.status === 'warn' ? '⚠️' : '❌'}
                {check.name}: {check.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

### Health Check Return Type

```typescript
interface UseHealthCheckReturn {
  report: HealthCheckReport | null;
  isChecking: boolean;
  runCheck: () => Promise<HealthCheckReport>;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
}

interface HealthCheckReport {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  version: string;
  checks: CheckResult[];
  summary: {
    passed: number;
    warnings: number;
    failed: number;
    total: number;
  };
}
```

### What Gets Checked

The health check verifies:
- **ArcPayProvider** - Provider is properly configured
- **Wallet Hook** - Wallet connection status
- **Balance** - Balance fetching (when connected)
- **Network** - Network configuration
- **Environment** - Browser environment compatibility

---

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit PRs.

```bash
# Clone the repo
git clone https://github.com/your-org/arcpay-react.git

# Install dependencies
npm install

# Run development
npm run dev

# Run tests
npm test

# Build
npm run build
```

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Support

- Documentation: [https://docs.arcpay.io](https://docs.arcpay.io)
- GitHub Issues: [https://github.com/your-org/arcpay-react/issues](https://github.com/your-org/arcpay-react/issues)
- Discord: [https://discord.gg/arcpay](https://discord.gg/arcpay)

---

Built with love for the Arc ecosystem.
