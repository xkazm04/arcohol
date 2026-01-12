import type { WebhookEndpoint, DeliveryLog, EventCategory } from './types';

export const mockEndpoints: WebhookEndpoint[] = [
  {
    id: 'wh_1',
    url: 'https://api.acme.com/webhooks/arcpay',
    events: ['invoice.paid', 'invoice.created', 'dispute.created'],
    status: 'active',
    successRate: 99.8,
    lastDelivery: '2 min ago',
    createdAt: '2024-01-15',
  },
  {
    id: 'wh_2',
    url: 'https://hooks.slack.com/services/T.../B.../xxx',
    events: ['dispute.resolved', 'treasury.alert_triggered'],
    status: 'active',
    successRate: 100,
    lastDelivery: '1 hour ago',
    createdAt: '2024-02-01',
  },
  {
    id: 'wh_3',
    url: 'https://staging.example.com/webhooks',
    events: ['credits.deposited', 'credits.low_balance'],
    status: 'failing',
    successRate: 45.2,
    lastDelivery: '5 min ago',
    createdAt: '2024-02-20',
  },
];

export const deliveryLogs: DeliveryLog[] = [
  { id: '1', event: 'invoice.paid', endpoint: 'api.acme.com', status: 'success', responseCode: 200, timestamp: '2 min ago', duration: '145ms' },
  { id: '2', event: 'credits.low_balance', endpoint: 'staging.example.com', status: 'failed', responseCode: 500, timestamp: '5 min ago', duration: '2.1s' },
  { id: '3', event: 'dispute.created', endpoint: 'api.acme.com', status: 'success', responseCode: 200, timestamp: '15 min ago', duration: '89ms' },
  { id: '4', event: 'treasury.yield_credited', endpoint: 'hooks.slack.com', status: 'success', responseCode: 200, timestamp: '1 hour ago', duration: '234ms' },
  { id: '5', event: 'credits.deposited', endpoint: 'staging.example.com', status: 'failed', responseCode: 503, timestamp: '2 hours ago', duration: '30s' },
];

export const availableEvents: EventCategory[] = [
  { category: 'Credits', events: ['credits.deposited', 'credits.spent', 'credits.low_balance', 'credits.depleted', 'credits.yield_earned'] },
  { category: 'Invoices', events: ['invoice.created', 'invoice.sent', 'invoice.viewed', 'invoice.paid', 'invoice.overdue'] },
  { category: 'Disputes', events: ['dispute.created', 'dispute.updated', 'dispute.resolved', 'dispute.refund_issued'] },
  { category: 'Treasury', events: ['treasury.rebalanced', 'treasury.payment_sent', 'treasury.yield_credited', 'treasury.alert_triggered'] },
];
