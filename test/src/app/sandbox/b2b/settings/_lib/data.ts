import type { ApiKey, TeamMember, Tab, Invoice } from './types';

export const mockApiKeys: ApiKey[] = [
  { id: 'key_1', name: 'Production', prefix: 'sk_live_...4f2a', lastUsed: '2 min ago', createdAt: '2024-01-15', permissions: ['read', 'write'] },
  { id: 'key_2', name: 'Development', prefix: 'sk_test_...8b3c', lastUsed: '1 hour ago', createdAt: '2024-02-01', permissions: ['read', 'write'] },
  { id: 'key_3', name: 'Analytics Dashboard', prefix: 'sk_live_...2d1e', lastUsed: '3 days ago', createdAt: '2024-02-20', permissions: ['read'] },
];

export const teamMembers: TeamMember[] = [
  { id: '1', name: 'Alex Johnson', email: 'alex@company.com', role: 'Owner', avatar: 'AJ', status: 'active' },
  { id: '2', name: 'Sarah Chen', email: 'sarah@company.com', role: 'Admin', avatar: 'SC', status: 'active' },
  { id: '3', name: 'Mike Davis', email: 'mike@company.com', role: 'Developer', avatar: 'MD', status: 'pending' },
];

export const tabs: Tab[] = [
  { id: 'organization', label: 'Organization', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { id: 'api-keys', label: 'API Keys', icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' },
  { id: 'team', label: 'Team', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { id: 'billing', label: 'Billing', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
];

export const recentInvoices: Invoice[] = [
  { month: 'January 2024', amount: '$1,156.00', status: 'Paid' },
  { month: 'December 2023', amount: '$982.00', status: 'Paid' },
  { month: 'November 2023', amount: '$1,345.00', status: 'Paid' },
];
