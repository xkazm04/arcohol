import React from 'react';
import { Modal } from '../ui/Modal';

export interface RampModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  provider: 'coinbase' | 'transak';
  iframeUrl?: string;
  children?: React.ReactNode;
}

export function RampModal({
  isOpen,
  onClose,
  title,
  provider,
  iframeUrl,
  children,
}: RampModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div className="arcpay-ramp-modal">
        {iframeUrl ? (
          <iframe
            src={iframeUrl}
            className="arcpay-ramp-modal__iframe"
            title={`${provider} ${title}`}
            allow="camera; payment"
          />
        ) : (
          <div className="arcpay-ramp-modal__content">
            {children}
          </div>
        )}
        <p className="arcpay-ramp-modal__powered-by">
          Powered by {provider === 'coinbase' ? 'Coinbase' : 'Transak'}
        </p>
      </div>
    </Modal>
  );
}
