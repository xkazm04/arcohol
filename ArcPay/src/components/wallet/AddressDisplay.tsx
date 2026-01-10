import React, { useState } from 'react';
import { formatAddress } from '../../utils/formatting';

export interface AddressDisplayProps {
  address: string;
  showCopy?: boolean;
  showFull?: boolean;
  className?: string;
}

export function AddressDisplay({
  address,
  showCopy = true,
  showFull = false,
  className = '',
}: AddressDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayAddress = showFull ? address : formatAddress(address);

  return (
    <div className={`arcpay-address ${className}`}>
      <span className="arcpay-address__value" title={address}>
        {displayAddress}
      </span>
      {showCopy && (
        <button
          className="arcpay-address__copy"
          onClick={handleCopy}
          aria-label={copied ? 'Copied!' : 'Copy address'}
        >
          {copied ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
