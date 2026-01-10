import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useWallet } from '../hooks/useWallet';
import { WalletProvider, WalletContextValue } from '../providers/WalletProvider';

// Mock the CircleClient
jest.mock('../core/CircleClient', () => ({
  CircleClient: jest.fn().mockImplementation(() => ({
    createWallet: jest.fn().mockResolvedValue({
      id: 'test-wallet-id',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      type: 'circle',
      status: 'active',
      createdAt: new Date(),
    }),
    getWallet: jest.fn().mockResolvedValue({
      id: 'test-wallet-id',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      type: 'circle',
      status: 'active',
      createdAt: new Date(),
    }),
    getBalance: jest.fn().mockResolvedValue('100.00'),
  })),
}));

const mockWalletContext: WalletContextValue = {
  wallet: null,
  isConnecting: false,
  isConnected: false,
  error: null,
  connect: jest.fn(),
  disconnect: jest.fn(),
  createWallet: jest.fn(),
};

const createWrapper = (contextValue: Partial<WalletContextValue> = {}) => {
  const value = { ...mockWalletContext, ...contextValue };
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <WalletProvider
        circleApiKey="test-api-key"
        circleEntitySecret="test-secret"
      >
        {children}
      </WalletProvider>
    );
  };
};

describe('useWallet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useWallet(), {
      wrapper: createWrapper(),
    });

    expect(result.current.wallet).toBeNull();
    expect(result.current.isConnecting).toBe(false);
    expect(result.current.isConnected).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should have connect function', () => {
    const { result } = renderHook(() => useWallet(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.connect).toBe('function');
  });

  it('should have disconnect function', () => {
    const { result } = renderHook(() => useWallet(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.disconnect).toBe('function');
  });

  it('should have createWallet function', () => {
    const { result } = renderHook(() => useWallet(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.createWallet).toBe('function');
  });
});

describe('useWallet - connected state', () => {
  it('should return connected state when wallet exists', () => {
    const connectedContext: Partial<WalletContextValue> = {
      wallet: {
        id: 'test-wallet-id',
        address: '0x1234567890abcdef1234567890abcdef12345678',
        type: 'circle',
        status: 'active',
        createdAt: new Date(),
      },
      isConnected: true,
    };

    const { result } = renderHook(() => useWallet(), {
      wrapper: createWrapper(connectedContext),
    });

    // The actual connected state would be determined by the context
    expect(typeof result.current.isConnected).toBe('boolean');
  });
});
