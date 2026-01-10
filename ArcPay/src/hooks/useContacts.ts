import { useState, useEffect, useCallback } from 'react';
import {
  getContacts,
  saveContact,
  removeContact,
  type Contact,
} from '../utils/storage';
import { useArcPay } from '../providers/ArcPayProvider';

export interface UseContactsReturn {
  contacts: Contact[];
  isEnabled: boolean;
  addContact: (contact: Omit<Contact, 'id' | 'createdAt'>) => Contact;
  deleteContact: (id: string) => void;
  findContact: (query: string) => Contact | undefined;
  searchContacts: (query: string) => Contact[];
}

export function useContacts(): UseContactsReturn {
  const { config } = useArcPay();
  const [contacts, setContacts] = useState<Contact[]>([]);

  const isEnabled = config.enableContacts ?? true;

  useEffect(() => {
    if (isEnabled) {
      setContacts(getContacts());
    }
  }, [isEnabled]);

  const addContact = useCallback(
    (contact: Omit<Contact, 'id' | 'createdAt'>): Contact => {
      if (!isEnabled) {
        throw new Error('Contacts feature is disabled');
      }
      const newContact = saveContact(contact);
      setContacts((prev) => [...prev, newContact]);
      return newContact;
    },
    [isEnabled]
  );

  const deleteContact = useCallback(
    (id: string) => {
      if (!isEnabled) return;
      removeContact(id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
    },
    [isEnabled]
  );

  const findContact = useCallback(
    (query: string): Contact | undefined => {
      const lowerQuery = query.toLowerCase();
      return contacts.find(
        (c) =>
          c.name.toLowerCase() === lowerQuery ||
          c.email?.toLowerCase() === lowerQuery ||
          c.address?.toLowerCase() === lowerQuery
      );
    },
    [contacts]
  );

  const searchContacts = useCallback(
    (query: string): Contact[] => {
      if (!query) return contacts;
      const lowerQuery = query.toLowerCase();
      return contacts.filter(
        (c) =>
          c.name.toLowerCase().includes(lowerQuery) ||
          c.email?.toLowerCase().includes(lowerQuery) ||
          c.address?.toLowerCase().includes(lowerQuery)
      );
    },
    [contacts]
  );

  return {
    contacts,
    isEnabled,
    addContact,
    deleteContact,
    findContact,
    searchContacts,
  };
}
