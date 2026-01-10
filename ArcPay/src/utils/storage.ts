import { STORAGE_KEYS } from './constants';

function isLocalStorageAvailable(): boolean {
  try {
    const test = '__arcpay_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

const storageAvailable = isLocalStorageAvailable();

export function getItem<T>(key: string): T | null {
  if (!storageAvailable) return null;

  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

export function setItem<T>(key: string, value: T): void {
  if (!storageAvailable) return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage quota exceeded or other error
    console.warn('Failed to save to localStorage:', key);
  }
}

export function removeItem(key: string): void {
  if (!storageAvailable) return;

  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore errors
  }
}

export function clearArcPayStorage(): void {
  if (!storageAvailable) return;

  Object.values(STORAGE_KEYS).forEach((key) => {
    removeItem(key);
  });
}

export interface StoredWallet {
  id: string;
  address: string;
  walletSetId?: string;
}

export function getStoredWallet(): StoredWallet | null {
  return getItem<StoredWallet>(STORAGE_KEYS.wallet);
}

export function setStoredWallet(wallet: StoredWallet): void {
  setItem(STORAGE_KEYS.wallet, wallet);
}

export function removeStoredWallet(): void {
  removeItem(STORAGE_KEYS.wallet);
}

export interface Contact {
  id: string;
  name: string;
  address?: string;
  email?: string;
  createdAt: string;
}

export function getContacts(): Contact[] {
  return getItem<Contact[]>(STORAGE_KEYS.contacts) || [];
}

export function saveContact(contact: Omit<Contact, 'id' | 'createdAt'>): Contact {
  const contacts = getContacts();
  const newContact: Contact = {
    ...contact,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  contacts.push(newContact);
  setItem(STORAGE_KEYS.contacts, contacts);
  return newContact;
}

export function removeContact(id: string): void {
  const contacts = getContacts().filter((c) => c.id !== id);
  setItem(STORAGE_KEYS.contacts, contacts);
}
