import React, { useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export interface QRCodeImageSettings {
  src: string;
  height: number;
  width: number;
  excavate: boolean;
}

export interface QRCodeDisplayProps {
  value: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  includeMargin?: boolean;
  label?: string;
  showValue?: boolean;
  truncateValue?: number;
  bgColor?: string;
  fgColor?: string;
  imageSettings?: QRCodeImageSettings;
  className?: string;
}

export function QRCodeDisplay({
  value,
  size = 200,
  level = 'M',
  includeMargin = true,
  label,
  showValue = true,
  truncateValue = 20,
  bgColor = '#ffffff',
  fgColor = '#000000',
  imageSettings,
  className = '',
}: QRCodeDisplayProps) {
  const displayValue = useMemo(() => {
    if (!showValue) return null;
    if (value.length <= truncateValue) return value;
    return `${value.slice(0, truncateValue)}...`;
  }, [value, showValue, truncateValue]);

  return (
    <div className={`arcpay-qr-display ${className}`}>
      {label && <p className="arcpay-qr-display__label">{label}</p>}
      <div
        className="arcpay-qr-display__code"
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: bgColor,
          borderRadius: '8px',
          padding: includeMargin ? '8px' : '0',
        }}
      >
        <QRCodeSVG
          value={value}
          size={size - (includeMargin ? 16 : 0)}
          level={level}
          bgColor={bgColor}
          fgColor={fgColor}
          imageSettings={imageSettings}
        />
      </div>
      {displayValue && (
        <p className="arcpay-qr-display__value">{displayValue}</p>
      )}
    </div>
  );
}

export interface QRCodePaymentProps {
  address: string;
  amount?: number;
  currency?: string;
  reference?: string;
  size?: number;
  className?: string;
}

export function QRCodePayment({
  address,
  amount,
  currency = 'USDC',
  reference,
  size = 250,
  className = '',
}: QRCodePaymentProps) {
  const paymentUri = useMemo(() => {
    const params = new URLSearchParams();
    if (amount) params.set('amount', amount.toString());
    if (currency) params.set('currency', currency);
    if (reference) params.set('ref', reference);

    const queryString = params.toString();
    return queryString ? `arc:${address}?${queryString}` : `arc:${address}`;
  }, [address, amount, currency, reference]);

  return (
    <div className={`arcpay-qr-payment ${className}`}>
      <QRCodeDisplay
        value={paymentUri}
        size={size}
        level="H"
        label="Scan to Pay"
        showValue={false}
      />
      <div className="arcpay-qr-payment__details">
        {amount && (
          <p className="arcpay-qr-payment__amount">
            {amount} {currency}
          </p>
        )}
        <p className="arcpay-qr-payment__address">
          {address.slice(0, 6)}...{address.slice(-4)}
        </p>
      </div>
    </div>
  );
}
