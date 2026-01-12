export interface Endpoint {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  price: string;
  currency: string;
  calls24h: number;
  revenue24h: string;
  status: 'active' | 'paused';
}

export interface RevenueData {
  day: string;
  amount: number;
}

export type PricingModel = 'exact' | 'dynamic';
