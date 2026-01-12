export interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  status: 'active' | 'failing' | 'disabled';
  successRate: number;
  lastDelivery: string;
  createdAt: string;
}

export interface DeliveryLog {
  id: string;
  event: string;
  endpoint: string;
  status: 'success' | 'failed' | 'pending';
  responseCode: number | null;
  timestamp: string;
  duration: string;
}

export interface EventCategory {
  category: string;
  events: string[];
}
