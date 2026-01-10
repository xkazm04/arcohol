# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial SDK implementation with Circle Wallets integration
- Core providers: `ArcPayProvider`, `ThemeProvider`, `WalletProvider`
- Wallet management hooks: `useWallet`, `useBalance`
- Transfer functionality: `useTransfer`, `usePayment`
- Transaction history: `useTransactionHistory`
- Exchange rates: `useExchangeRate`
- Contact management: `useContacts`
- QR code generation with `qrcode.react` library
  - `QRCodeDisplay` component with customizable size, colors, and error correction
  - `QRCodePayment` component for payment-specific QR codes with Arc URI scheme
- Coinbase Onramp integration for buying USDC
  - `CoinbaseOnramp` core class with popup and embedded widget modes
  - Updated `useOnramp` hook with real Coinbase integration
  - Updated `FundWallet` component with popup/embedded modes
- Transak Offramp integration for selling USDC
  - `TransakOfframp` core class with popup and embedded widget modes
  - Updated `useOfframp` hook with real Transak integration
  - Updated `CashOut` component with popup/embedded modes
- `TransactionBuilder` utility class for batch transactions
  - Support for sequential and parallel transaction execution
  - Dependency management between transaction steps
  - Retry logic with configurable attempts and delays
  - Validation and JSON serialization
- Internationalization (i18n) support
  - `I18nProvider` with locale management
  - `useI18n` and `useTranslation` hooks
  - English and Spanish translations included
  - Browser locale detection and localStorage persistence
  - Interpolation support for dynamic values
- External wallet support
  - `WalletConnectAdapter` for WalletConnect v2 integration
  - `ExternalWalletAdapter` for injected providers (MetaMask, etc.)
  - `detectInjectedWallet` utility for browser wallet detection
  - Event-based connection state management
- Pre-built UI components:
  - Wallet: `WalletWidget`, `BalanceDisplay`, `WalletButton`, `AddressDisplay`
  - Transfer: `SendMoney`, `PaymentForm`, `PayButton`, `QRCodeDisplay`, `QRCodePayment`
  - Ramps: `FundWallet`, `CashOut`, `RampModal`
  - History: `TransactionList`, `TransactionItem`, `TransactionDetail`
  - UI primitives: `Button`, `Input`, `Modal`, `Spinner`, `Toast`
- Three built-in themes: default, dark, minimal
- CSS custom properties for easy theming
- TypeScript support with full type definitions
- Jest testing configuration with sample tests
  - Jest + ts-jest setup for TypeScript
  - @testing-library/react for component testing
  - Sample tests for hooks, utilities, and components
- ESLint configuration with React and TypeScript rules
  - TypeScript-ESLint integration
  - React hooks linting rules
  - Configurable rules for tests

## [0.1.0] - 2025-01-05

### Added
- Initial release of @arcpay/react SDK
- Core wallet functionality with Circle Programmable Wallets
- USDC transfer capabilities on Arc blockchain
- Basic theming system with CSS variables
- React context providers for state management
- Utility functions for formatting and validation

### Changed
- N/A (initial release)

### Deprecated
- N/A (initial release)

### Removed
- N/A (initial release)

### Fixed
- N/A (initial release)

### Security
- Secure handling of API credentials
- No sensitive data stored in local storage
- HTTPS-only communication with external services

[Unreleased]: https://github.com/your-org/arcpay-react/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/your-org/arcpay-react/releases/tag/v0.1.0
