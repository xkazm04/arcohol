import React, { useState } from 'react';
import { useTransfer, useBalance } from '../../hooks';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { RecipientInput } from './RecipientInput';
import { validateAmount } from '../../utils/validation';
import type { Transaction } from '../../types';

export interface SendMoneyProps {
  defaultRecipient?: string;
  defaultAmount?: number;
  minAmount?: number;
  maxAmount?: number;
  showContacts?: boolean;
  showQRScanner?: boolean;
  onSuccess?: (tx: Transaction) => void;
  onCancel?: () => void;
  className?: string;
}

export function SendMoney({
  defaultRecipient = '',
  defaultAmount,
  minAmount = 0.01,
  maxAmount,
  showContacts = true,
  onSuccess,
  onCancel,
  className = '',
}: SendMoneyProps) {
  const { transfer, isTransferring } = useTransfer();
  const { balance } = useBalance();

  const [recipient, setRecipient] = useState(defaultRecipient);
  const [amount, setAmount] = useState(defaultAmount?.toString() || '');
  const [memo, setMemo] = useState('');
  const [recipientValid, setRecipientValid] = useState(!!defaultRecipient);
  const [amountError, setAmountError] = useState<string | undefined>();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);

    if (value) {
      const result = validateAmount(value, {
        min: minAmount,
        max: maxAmount,
        balance,
      });
      setAmountError(result.isValid ? undefined : result.error);
    } else {
      setAmountError(undefined);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipientValid || !amount) return;

    const amountResult = validateAmount(amount, {
      min: minAmount,
      max: maxAmount,
      balance,
    });
    if (!amountResult.isValid) {
      setAmountError(amountResult.error);
      return;
    }

    try {
      const result = await transfer({
        to: recipient,
        amount,
        memo: memo || undefined,
      });
      onSuccess?.(result.transaction);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const isFormValid = recipientValid && amount && !amountError;

  return (
    <form
      onSubmit={handleSubmit}
      className={`arcpay-send-money ${className}`}
    >
      <RecipientInput
        value={recipient}
        onChange={setRecipient}
        onValidation={(valid) => setRecipientValid(valid)}
        showContacts={showContacts}
      />

      <Input
        type="number"
        value={amount}
        onChange={handleAmountChange}
        placeholder="0.00"
        label="Amount"
        error={amountError}
        min={minAmount}
        max={maxAmount || parseFloat(balance)}
        step="0.01"
        leftIcon={
          <span className="arcpay-send-money__currency">$</span>
        }
      />

      <Input
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        placeholder="What's this for? (optional)"
        label="Memo"
        maxLength={256}
      />

      <div className="arcpay-send-money__actions">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          disabled={!isFormValid}
          isLoading={isTransferring}
          fullWidth={!onCancel}
        >
          Send ${amount || '0.00'}
        </Button>
      </div>
    </form>
  );
}
