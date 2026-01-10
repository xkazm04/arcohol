import React, { useState } from 'react';
import { usePayment } from '../../hooks';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { RecipientInput } from './RecipientInput';
import type { PaymentRequest } from '../../types';

export interface PaymentFormProps {
  onRequestCreated?: (request: PaymentRequest) => void;
  defaultAmount?: number;
  defaultRecipient?: string;
  defaultDescription?: string;
  showQR?: boolean;
  className?: string;
}

export function PaymentForm({
  onRequestCreated,
  defaultAmount,
  defaultRecipient = '',
  defaultDescription = '',
  showQR = true,
  className = '',
}: PaymentFormProps) {
  const { createPaymentRequest, getPaymentQR } = usePayment();

  const [recipient, setRecipient] = useState(defaultRecipient);
  const [amount, setAmount] = useState(defaultAmount?.toString() || '');
  const [description, setDescription] = useState(defaultDescription);
  const [recipientValid, setRecipientValid] = useState(!!defaultRecipient);
  const [request, setRequest] = useState<PaymentRequest | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipientValid || !amount) return;

    const newRequest = createPaymentRequest({
      amount,
      recipient,
      description: description || undefined,
    });

    setRequest(newRequest);
    onRequestCreated?.(newRequest);
  };

  if (request && showQR) {
    const qrData = getPaymentQR(request);

    return (
      <div className={`arcpay-payment-form arcpay-payment-form--qr ${className}`}>
        <div className="arcpay-payment-form__qr">
          <p className="arcpay-payment-form__qr-label">
            Scan to pay ${request.amount}
          </p>
          <div className="arcpay-payment-form__qr-code">
            {/* QR code would be rendered here - using a placeholder */}
            <code className="arcpay-payment-form__qr-data">{qrData}</code>
          </div>
          {request.description && (
            <p className="arcpay-payment-form__description">{request.description}</p>
          )}
        </div>
        <Button variant="outline" onClick={() => setRequest(null)}>
          Create New Request
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`arcpay-payment-form ${className}`}
    >
      <RecipientInput
        value={recipient}
        onChange={setRecipient}
        onValidation={(valid) => setRecipientValid(valid)}
        placeholder="Your wallet address or email"
      />

      <Input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0.00"
        label="Amount to Request"
        min="0.01"
        step="0.01"
        leftIcon={<span>$</span>}
      />

      <Input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="What's this for? (optional)"
        label="Description"
        maxLength={500}
      />

      <Button
        type="submit"
        variant="primary"
        disabled={!recipientValid || !amount}
        fullWidth
      >
        Create Payment Request
      </Button>
    </form>
  );
}
