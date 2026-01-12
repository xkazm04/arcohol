import type { Endpoint, RevenueData } from './types';

export const mockEndpoints: Endpoint[] = [
  { id: 'ep_1', path: '/api/v1/analyze', method: 'POST', price: '0.05', currency: 'USDC', calls24h: 1234, revenue24h: '61.70', status: 'active' },
  { id: 'ep_2', path: '/api/v1/data/market', method: 'GET', price: '0.01', currency: 'USDC', calls24h: 8567, revenue24h: '85.67', status: 'active' },
  { id: 'ep_3', path: '/api/v1/generate', method: 'POST', price: '0.10', currency: 'USDC', calls24h: 456, revenue24h: '45.60', status: 'active' },
  { id: 'ep_4', path: '/api/v1/export', method: 'GET', price: '0.50', currency: 'USDC', calls24h: 89, revenue24h: '44.50', status: 'paused' },
];

export const revenueData: RevenueData[] = [
  { day: 'Mon', amount: 145 },
  { day: 'Tue', amount: 234 },
  { day: 'Wed', amount: 189 },
  { day: 'Thu', amount: 312 },
  { day: 'Fri', amount: 267 },
  { day: 'Sat', amount: 198 },
  { day: 'Sun', amount: 237 },
];

export const codeExample = `import { X402Client } from '@arcpay/x402'

const client = new X402Client({
  wallet: agentWallet,
  network: 'base-sepolia'
})

// Automatically handles 402 Payment Required
const response = await client.fetch('/api/v1/analyze', {
  method: 'POST',
  body: JSON.stringify({ data: 'your-data' })
})

// Payment settled instantly, response received
console.log(response.data)`;
