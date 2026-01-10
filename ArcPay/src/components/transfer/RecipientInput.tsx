import React, { useState, useCallback } from 'react';
import { Input } from '../ui/Input';
import { useContacts } from '../../hooks';
import { validateRecipient } from '../../utils/validation';

export interface RecipientInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidation?: (isValid: boolean, error?: string) => void;
  showContacts?: boolean;
  placeholder?: string;
  className?: string;
}

export function RecipientInput({
  value,
  onChange,
  onValidation,
  showContacts = true,
  placeholder = 'Address, email, or contact name',
  className = '',
}: RecipientInputProps) {
  const [error, setError] = useState<string | undefined>();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { contacts, searchContacts } = useContacts();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      onChange(newValue);

      if (newValue) {
        const result = validateRecipient(newValue);
        setError(result.isValid ? undefined : result.error);
        onValidation?.(result.isValid, result.error);
      } else {
        setError(undefined);
        onValidation?.(false);
      }

      setShowSuggestions(showContacts && newValue.length > 0);
    },
    [onChange, onValidation, showContacts]
  );

  const handleSelectContact = (contactValue: string) => {
    onChange(contactValue);
    setShowSuggestions(false);
    const result = validateRecipient(contactValue);
    setError(result.isValid ? undefined : result.error);
    onValidation?.(result.isValid, result.error);
  };

  const suggestions = showContacts ? searchContacts(value) : [];

  return (
    <div className={`arcpay-recipient-input ${className}`}>
      <Input
        value={value}
        onChange={handleChange}
        onFocus={() => setShowSuggestions(showContacts && value.length > 0)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
        error={error}
        leftIcon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        }
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="arcpay-recipient-input__suggestions">
          {suggestions.map((contact) => (
            <li key={contact.id}>
              <button
                type="button"
                onClick={() =>
                  handleSelectContact(contact.address || contact.email || '')
                }
              >
                <span className="arcpay-recipient-input__contact-name">
                  {contact.name}
                </span>
                <span className="arcpay-recipient-input__contact-value">
                  {contact.address || contact.email}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
