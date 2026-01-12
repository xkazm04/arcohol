import { Check } from './types';

export const initialChecks: Check[] = [
  { id: 'c1', name: 'Provider Initialization', group: 'core', status: 'pending', message: 'Waiting...' },
  { id: 'c2', name: 'Network Connectivity', group: 'network', status: 'pending', message: 'Waiting...' },
  { id: 'c3', name: 'RPC Latency', group: 'network', status: 'pending', message: 'Waiting...' },
  { id: 'c4', name: 'Wallet Connection', group: 'account', status: 'pending', message: 'Waiting...' },
  { id: 'c5', name: 'Balance Fetch', group: 'account', status: 'pending', message: 'Waiting...' },
];
