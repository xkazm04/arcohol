export type TabId = 'organization' | 'api-keys' | 'team' | 'billing';

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  lastUsed: string;
  createdAt: string;
  permissions: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  status: 'active' | 'pending';
}

export interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

export interface Invoice {
  month: string;
  amount: string;
  status: string;
}
