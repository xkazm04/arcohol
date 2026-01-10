/**
 * Middleware exports
 */

// Express middleware
export {
  webhookMiddleware as expressWebhookMiddleware,
  webhookHandler as expressWebhookHandler,
  type WebhookMiddlewareOptions,
  type WebhookRequest,
} from './express';

// Next.js middleware
export {
  webhookHandler as nextjsWebhookHandler,
  constructWebhookEvent,
  verifyWebhookSignature,
  type WebhookConfig,
} from './nextjs';
