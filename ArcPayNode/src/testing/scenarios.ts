/**
 * Pre-built test scenarios
 *
 * Common payment and subscription flows for integration testing.
 *
 * @example
 * ```typescript
 * import { PaymentScenarios, SubscriptionScenarios } from '@arcpay/node/testing';
 *
 * describe('Payment Flow', () => {
 *   it('should handle successful payment', async () => {
 *     const scenario = PaymentScenarios.successfulPayment();
 *     // Use scenario.intent, scenario.payment, scenario.webhookEvents
 *   });
 * });
 * ```
 */

import {
  createPayment,
  createPaymentIntent,
  createPaymentLink,
  createPlan,
  createSubscription,
  createInvoice,
  createCustomer,
  createWebhookEvent,
} from './fixtures';
import type { WebhookEvent } from '../types';

/**
 * Payment-related test scenarios
 */
export const PaymentScenarios = {
  /**
   * Successful one-time payment flow
   */
  successfulPayment() {
    const customer = createCustomer();
    const intent = createPaymentIntent({
      status: 'requires_payment_method',
    });
    const confirmedIntent = {
      ...intent,
      status: 'succeeded' as const,
    };
    const payment = createPayment({
      amount: intent.amount,
      status: 'completed',
      sender: customer.walletAddress,
    });

    return {
      customer,
      intent,
      confirmedIntent,
      payment,
      webhookEvents: [
        createWebhookEvent('payment.initiated', { ...payment, status: 'pending' }),
        createWebhookEvent('payment.completed', payment),
      ] as WebhookEvent[],
    };
  },

  /**
   * Failed payment (insufficient funds)
   */
  failedPayment() {
    const customer = createCustomer();
    const intent = createPaymentIntent({
      status: 'requires_payment_method',
    });
    const failedIntent = {
      ...intent,
      status: 'canceled' as const,
    };
    const payment = createPayment({
      amount: intent.amount,
      status: 'failed',
      sender: customer.walletAddress,
    });

    return {
      customer,
      intent,
      failedIntent,
      payment,
      webhookEvents: [
        createWebhookEvent('payment.initiated', { ...payment, status: 'pending' }),
        createWebhookEvent('payment.failed', payment),
      ] as WebhookEvent[],
    };
  },

  /**
   * Refunded payment flow
   */
  refundedPayment() {
    const scenario = this.successfulPayment();
    const refundedPayment = {
      ...scenario.payment,
      status: 'refunded' as const,
      refundedAt: new Date(),
      refundAmount: scenario.payment.amount,
    };

    return {
      ...scenario,
      refundedPayment,
      webhookEvents: [
        ...scenario.webhookEvents,
        createWebhookEvent('payment.refunded', refundedPayment),
      ] as WebhookEvent[],
    };
  },

  /**
   * Partial refund flow
   */
  partialRefund() {
    const scenario = this.successfulPayment();
    const originalAmount = parseFloat(scenario.payment.amount);
    const refundAmount = (originalAmount / 2).toFixed(2);

    const refundedPayment = {
      ...scenario.payment,
      status: 'partially_refunded' as const,
      refundedAt: new Date(),
      refundAmount,
    };

    return {
      ...scenario,
      refundedPayment,
      refundAmount,
      webhookEvents: [
        ...scenario.webhookEvents,
        createWebhookEvent('payment.refunded', refundedPayment),
      ] as WebhookEvent[],
    };
  },

  /**
   * Canceled payment flow
   */
  canceledPayment() {
    const customer = createCustomer();
    const intent = createPaymentIntent({
      status: 'requires_payment_method',
    });
    const canceledIntent = {
      ...intent,
      status: 'canceled' as const,
    };

    return {
      customer,
      intent,
      canceledIntent,
      webhookEvents: [] as WebhookEvent[],
    };
  },

  /**
   * Payment link flow
   */
  paymentLink() {
    const link = createPaymentLink();
    const customer = createCustomer();
    const payment = createPayment({
      amount: link.amount || '50.00',
      status: 'completed',
      sender: customer.walletAddress,
    });

    return {
      link,
      customer,
      payment,
      webhookEvents: [
        createWebhookEvent('payment_link.created', link),
        createWebhookEvent('payment.initiated', { ...payment, status: 'pending' }),
        createWebhookEvent('payment.completed', payment),
        createWebhookEvent('payment_link.completed', { ...link, completedPayments: 1 }),
      ] as WebhookEvent[],
    };
  },
};

/**
 * Subscription-related test scenarios
 */
export const SubscriptionScenarios = {
  /**
   * New subscription with trial period
   */
  trialSubscription() {
    const customer = createCustomer();
    const plan = createPlan({ trialDays: 14 });
    const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const subscription = createSubscription({
      planId: plan.id,
      customerId: customer.id,
      customerWallet: customer.walletAddress,
      status: 'trialing',
      trialStart: new Date(),
      trialEnd,
    });

    return {
      customer,
      plan,
      subscription,
      trialEnd,
      webhookEvents: [
        createWebhookEvent('subscription.created', subscription),
      ] as WebhookEvent[],
    };
  },

  /**
   * Subscription activation after trial
   */
  trialToActive() {
    const scenario = this.trialSubscription();
    const activeSubscription = {
      ...scenario.subscription,
      status: 'active' as const,
      trialEnd: new Date(),
    };
    const invoice = createInvoice({
      subscriptionId: activeSubscription.id,
      amount: scenario.plan.amount,
      status: 'paid',
    });

    return {
      ...scenario,
      activeSubscription,
      invoice,
      webhookEvents: [
        ...scenario.webhookEvents,
        createWebhookEvent('invoice.created', { ...invoice, status: 'open' }),
        createWebhookEvent('invoice.paid', invoice),
        createWebhookEvent('subscription.activated', activeSubscription),
      ] as WebhookEvent[],
    };
  },

  /**
   * Successful subscription renewal
   */
  renewalSuccess() {
    const customer = createCustomer();
    const plan = createPlan();
    const subscription = createSubscription({
      planId: plan.id,
      customerId: customer.id,
      customerWallet: customer.walletAddress,
      status: 'active',
    });
    const invoice = createInvoice({
      subscriptionId: subscription.id,
      amount: plan.amount,
      status: 'paid',
    });
    const renewedSubscription = {
      ...subscription,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };

    return {
      customer,
      plan,
      subscription,
      renewedSubscription,
      invoice,
      webhookEvents: [
        createWebhookEvent('invoice.created', { ...invoice, status: 'open' }),
        createWebhookEvent('invoice.paid', invoice),
        createWebhookEvent('subscription.renewed', renewedSubscription),
      ] as WebhookEvent[],
    };
  },

  /**
   * Failed renewal (payment failed)
   */
  renewalFailed() {
    const customer = createCustomer();
    const plan = createPlan();
    const subscription = createSubscription({
      planId: plan.id,
      customerId: customer.id,
      customerWallet: customer.walletAddress,
      status: 'active',
    });
    const invoice = createInvoice({
      subscriptionId: subscription.id,
      amount: plan.amount,
      status: 'open',
    });
    const pastDueSubscription = {
      ...subscription,
      status: 'past_due' as const,
      failedPaymentCount: 1,
    };

    return {
      customer,
      plan,
      subscription,
      pastDueSubscription,
      invoice,
      webhookEvents: [
        createWebhookEvent('invoice.created', invoice),
        createWebhookEvent('invoice.payment_failed', invoice),
      ] as WebhookEvent[],
    };
  },

  /**
   * Subscription cancellation at period end
   */
  cancellationAtPeriodEnd() {
    const customer = createCustomer();
    const plan = createPlan();
    const subscription = createSubscription({
      planId: plan.id,
      customerId: customer.id,
      customerWallet: customer.walletAddress,
      status: 'active',
    });
    const cancelingSubscription = {
      ...subscription,
      cancelAtPeriodEnd: true,
      canceledAt: new Date(),
    };

    return {
      customer,
      plan,
      subscription,
      cancelingSubscription,
      webhookEvents: [
        createWebhookEvent('subscription.canceled', cancelingSubscription),
      ] as WebhookEvent[],
    };
  },

  /**
   * Immediate subscription cancellation
   */
  immediateCancellation() {
    const customer = createCustomer();
    const plan = createPlan();
    const subscription = createSubscription({
      planId: plan.id,
      customerId: customer.id,
      customerWallet: customer.walletAddress,
      status: 'active',
    });
    const canceledSubscription = {
      ...subscription,
      status: 'canceled' as const,
      canceledAt: new Date(),
    };

    return {
      customer,
      plan,
      subscription,
      canceledSubscription,
      webhookEvents: [
        createWebhookEvent('subscription.canceled', canceledSubscription),
      ] as WebhookEvent[],
    };
  },

  /**
   * Subscription pause and resume
   */
  pauseAndResume() {
    const customer = createCustomer();
    const plan = createPlan();
    const subscription = createSubscription({
      planId: plan.id,
      customerId: customer.id,
      customerWallet: customer.walletAddress,
      status: 'active',
    });
    const pausedSubscription = {
      ...subscription,
      status: 'paused' as const,
      pausedAt: new Date(),
    };
    const resumedSubscription = {
      ...subscription,
      status: 'active' as const,
    };

    return {
      customer,
      plan,
      subscription,
      pausedSubscription,
      resumedSubscription,
      webhookEvents: [
        createWebhookEvent('subscription.paused', pausedSubscription),
        createWebhookEvent('subscription.resumed', resumedSubscription),
      ] as WebhookEvent[],
    };
  },

  /**
   * Plan upgrade (proration)
   */
  planUpgrade() {
    const customer = createCustomer();
    const basicPlan = createPlan({ name: 'Basic', amount: '9.99' });
    const proPlan = createPlan({ name: 'Pro', amount: '29.99' });

    const subscription = createSubscription({
      planId: basicPlan.id,
      customerId: customer.id,
      customerWallet: customer.walletAddress,
      status: 'active',
    });
    const upgradedSubscription = {
      ...subscription,
      planId: proPlan.id,
    };
    const proratedInvoice = createInvoice({
      subscriptionId: subscription.id,
      amount: '20.00', // Difference
      status: 'paid',
    });

    return {
      customer,
      basicPlan,
      proPlan,
      subscription,
      upgradedSubscription,
      proratedInvoice,
      webhookEvents: [
        createWebhookEvent('invoice.created', { ...proratedInvoice, status: 'open' }),
        createWebhookEvent('invoice.paid', proratedInvoice),
        createWebhookEvent('subscription.renewed', upgradedSubscription),
      ] as WebhookEvent[],
    };
  },
};

/**
 * Customer-related test scenarios
 */
export const CustomerScenarios = {
  /**
   * New customer creation
   */
  newCustomer() {
    const customer = createCustomer();

    return {
      customer,
      webhookEvents: [
        createWebhookEvent('customer.created', customer),
      ] as WebhookEvent[],
    };
  },

  /**
   * Customer with active subscription
   */
  activeSubscriber() {
    const customer = createCustomer();
    const plan = createPlan();
    const subscription = createSubscription({
      planId: plan.id,
      customerId: customer.id,
      customerWallet: customer.walletAddress,
      status: 'active',
    });

    return {
      customer,
      plan,
      subscription,
    };
  },

  /**
   * Customer with multiple subscriptions
   */
  multiSubscriber() {
    const customer = createCustomer();
    const plans = [
      createPlan({ name: 'Basic' }),
      createPlan({ name: 'Add-on' }),
    ];
    const subscriptions = plans.map((plan) =>
      createSubscription({
        planId: plan.id,
        customerId: customer.id,
        customerWallet: customer.walletAddress,
        status: 'active',
      })
    );

    return {
      customer,
      plans,
      subscriptions,
    };
  },
};
