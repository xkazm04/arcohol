import React, { useState, useRef, useEffect } from 'react';
import { useOnramp, useWallet } from '../../hooks';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { DEFAULT_PRESET_AMOUNTS } from '../../utils/constants';
import type { OnrampResult } from '../../types';

export interface FundWalletProps {
  defaultAmount?: number;
  presetAmounts?: number[];
  provider?: 'coinbase' | 'transak' | 'auto';
  mode?: 'popup' | 'embedded';
  coinbaseAppId?: string;
  onSuccess?: (result: OnrampResult) => void;
  onError?: (error: Error) => void;
  inline?: boolean;
  className?: string;
}

export function FundWallet({
  defaultAmount,
  presetAmounts = [...DEFAULT_PRESET_AMOUNTS],
  provider = 'coinbase',
  mode = 'popup',
  coinbaseAppId,
  onSuccess,
  onError,
  inline = false,
  className = '',
}: FundWalletProps) {
  const { wallet } = useWallet();
  const {
    openOnramp,
    isPending,
    onSuccess: setOnSuccess,
    onError: setOnError,
    embedWidget,
    destroyWidget,
  } = useOnramp({
    provider: provider === 'auto' ? 'coinbase' : provider,
    coinbaseAppId,
  });

  const [amount, setAmount] = useState(defaultAmount?.toString() || '');
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [showEmbedded, setShowEmbedded] = useState(false);
  const embedContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      destroyWidget();
    };
  }, [destroyWidget]);

  const handlePresetClick = (preset: number) => {
    setSelectedPreset(preset);
    setAmount(preset.toString());
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
    setSelectedPreset(null);
  };

  const handleFund = () => {
    if (!amount || !wallet) return;

    setOnSuccess((result) => {
      setShowEmbedded(false);
      onSuccess?.(result);
    });

    setOnError((error) => {
      setShowEmbedded(false);
      onError?.(error);
    });

    const onrampProvider = provider === 'auto' ? 'coinbase' : provider;

    if (mode === 'embedded' && embedContainerRef.current) {
      setShowEmbedded(true);
      embedWidget(embedContainerRef.current, {
        amount: parseFloat(amount),
        currency: 'USD',
        provider: onrampProvider,
      });
    } else {
      openOnramp({
        amount: parseFloat(amount),
        currency: 'USD',
        provider: onrampProvider,
      });
    }
  };

  const handleCloseEmbedded = () => {
    destroyWidget();
    setShowEmbedded(false);
  };

  const providerName = provider === 'coinbase' || provider === 'auto' ? 'Coinbase' : 'Transak';

  return (
    <div className={`arcpay-fund-wallet ${inline ? 'arcpay-fund-wallet--inline' : ''} ${className}`}>
      {!showEmbedded ? (
        <>
          <div className="arcpay-fund-wallet__presets">
            {presetAmounts.map((preset) => (
              <button
                key={preset}
                type="button"
                className={`arcpay-fund-wallet__preset ${
                  selectedPreset === preset ? 'arcpay-fund-wallet__preset--selected' : ''
                }`}
                onClick={() => handlePresetClick(preset)}
              >
                ${preset}
              </button>
            ))}
          </div>

          <Input
            type="number"
            value={amount}
            onChange={handleAmountChange}
            placeholder="Enter amount"
            label="Amount"
            min="1"
            step="1"
            leftIcon={<span>$</span>}
          />

          <p className="arcpay-fund-wallet__info">
            Powered by {providerName}. Card and bank transfers available.
          </p>

          <Button
            variant="primary"
            onClick={handleFund}
            disabled={!amount || isPending || !wallet}
            isLoading={isPending}
            fullWidth
          >
            {!wallet ? 'Connect Wallet First' : `Add $${amount || '0'} to Wallet`}
          </Button>
        </>
      ) : (
        <div className="arcpay-fund-wallet__embedded">
          <div className="arcpay-fund-wallet__embedded-header">
            <span>Add funds via {providerName}</span>
            <button
              type="button"
              className="arcpay-fund-wallet__embedded-close"
              onClick={handleCloseEmbedded}
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div
            ref={embedContainerRef}
            className="arcpay-fund-wallet__embedded-container"
            style={{ minHeight: '500px' }}
          />
        </div>
      )}
    </div>
  );
}
