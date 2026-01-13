'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  StatCard,
  StatusBadge,
  Card,
  CardHeader,
  Modal,
  FilterTabs,
  GlowButton,
  FormInput,
  FormSelect,
  staggerContainer,
  listItem,
} from '@/components/dashboard';
import { usePlans, useSubscriptions } from '@/features/subscriptions';
import type { SubscriptionStatus, SubscriptionInterval, CreatePlanParams } from '@/features/subscriptions';

const statusColors: Record<SubscriptionStatus, string> = {
  incomplete: 'slate',
  trialing: 'blue',
  active: 'emerald',
  past_due: 'amber',
  paused: 'slate',
  canceled: 'red',
  unpaid: 'red',
  expired: 'slate',
};

const intervalLabels: Record<SubscriptionInterval, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

export default function SubscriptionsPage() {
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'plans'>('subscriptions');
  const [filter, setFilter] = useState('all');
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [showCreateSubModal, setShowCreateSubModal] = useState(false);

  // Plan form state
  const [planForm, setPlanForm] = useState<CreatePlanParams>({
    name: '',
    description: '',
    amount: 0,
    interval: 'monthly',
    intervalCount: 1,
    trialDays: 0,
    features: [],
  });

  const { plans, isLoading: plansLoading, createPlan, isCreating: isCreatingPlan } = usePlans();
  const {
    subscriptions,
    isLoading: subsLoading,
    cancelSubscription,
    isCanceling,
    pauseSubscription,
    isPausing,
    resumeSubscription,
    isResuming,
  } = useSubscriptions();

  // Calculate stats
  const stats = useMemo(() => {
    const active = subscriptions.filter((s) => s.status === 'active').length;
    const trialing = subscriptions.filter((s) => s.status === 'trialing').length;
    const canceled = subscriptions.filter((s) => s.status === 'canceled').length;
    const mrr = subscriptions
      .filter((s) => s.status === 'active' && s.plan)
      .reduce((sum, s) => {
        if (!s.plan) return sum;
        const monthlyAmount =
          s.plan.interval === 'monthly'
            ? s.plan.amount
            : s.plan.interval === 'yearly'
            ? s.plan.amount / 12
            : s.plan.interval === 'weekly'
            ? s.plan.amount * 4
            : s.plan.amount * 30;
        return sum + monthlyAmount;
      }, 0);
    return { active, trialing, canceled, mrr };
  }, [subscriptions]);

  const filteredSubscriptions = useMemo(() => {
    if (filter === 'all') return subscriptions;
    return subscriptions.filter((s) => s.status === filter);
  }, [subscriptions, filter]);

  const handleCreatePlan = async () => {
    if (!planForm.name || planForm.amount <= 0) return;
    const result = await createPlan(planForm);
    if (result) {
      setShowCreatePlanModal(false);
      setPlanForm({
        name: '',
        description: '',
        amount: 0,
        interval: 'monthly',
        intervalCount: 1,
        trialDays: 0,
        features: [],
      });
    }
  };

  const isLoading = plansLoading || subsLoading;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4 max-w-6xl"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-white">Subscriptions</h1>
          <FilterTabs
            tabs={[
              { id: 'subscriptions', label: 'Subscriptions' },
              { id: 'plans', label: 'Plans' },
            ]}
            activeTab={activeTab}
            onChange={(tab) => setActiveTab(tab as 'subscriptions' | 'plans')}
          />
        </div>
        <GlowButton
          onClick={() => (activeTab === 'plans' ? setShowCreatePlanModal(true) : setShowCreateSubModal(true))}
          icon={
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          {activeTab === 'plans' ? 'New Plan' : 'New Subscription'}
        </GlowButton>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={staggerContainer} className="grid grid-cols-4 gap-3">
        <StatCard label="Active" value={stats.active.toString()} accent="emerald" delay={0} />
        <StatCard label="Trialing" value={stats.trialing.toString()} accent="blue" delay={0.05} />
        <StatCard label="Canceled" value={stats.canceled.toString()} accent="red" delay={0.1} />
        <StatCard
          label="MRR"
          value={`$${stats.mrr.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          accent="purple"
          delay={0.15}
        />
      </motion.div>

      {activeTab === 'subscriptions' ? (
        /* Subscriptions Tab */
        <Card accent="purple" delay={0.2} className="overflow-hidden">
          <CardHeader
            title="All Subscriptions"
            action={
              <FilterTabs
                tabs={[
                  { id: 'all', label: 'All' },
                  { id: 'active', label: 'Active' },
                  { id: 'trialing', label: 'Trialing' },
                  { id: 'past_due', label: 'Past Due' },
                  { id: 'canceled', label: 'Canceled' },
                ]}
                activeTab={filter}
                onChange={setFilter}
              />
            }
          />

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-slate-800/20 border-b border-slate-800/40 text-[10px] font-medium text-slate-500 uppercase">
            <div className="col-span-3">Customer</div>
            <div className="col-span-2">Plan</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-2 text-right">Next Payment</div>
            <div className="col-span-1"></div>
          </div>

          {/* Table Body */}
          {isLoading ? (
            <div className="px-6 py-12 text-center">
              <div className="w-8 h-8 mx-auto border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
              <p className="text-slate-400 text-sm">Loading subscriptions...</p>
            </div>
          ) : filteredSubscriptions.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <svg
                className="w-12 h-12 mx-auto text-slate-600 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <p className="text-slate-400 text-sm mb-1">No subscriptions found</p>
              <p className="text-slate-500 text-xs">Create a subscription to get started</p>
            </div>
          ) : (
            <motion.div variants={staggerContainer} className="divide-y divide-slate-800/30">
              {filteredSubscriptions.map((sub) => (
                <motion.div
                  key={sub.id}
                  variants={listItem}
                  whileHover={{ x: 3, backgroundColor: 'rgba(51, 65, 85, 0.2)' }}
                  className="grid grid-cols-12 gap-2 px-3 py-2.5 items-center cursor-pointer transition-colors group"
                >
                  <div className="col-span-3">
                    <span className="text-xs font-medium text-white block truncate">
                      {sub.customer?.companyName || sub.customer?.email || 'Unknown'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono truncate block">
                      {sub.customerWallet?.slice(0, 6)}...{sub.customerWallet?.slice(-4)}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-slate-300 truncate block">{sub.plan?.name || 'Unknown Plan'}</span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="text-xs font-mono text-white">
                      ${sub.plan?.amount.toLocaleString() || '0'}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      /{sub.plan?.interval || 'month'}
                    </span>
                  </div>
                  <div className="col-span-2 text-center">
                    <StatusBadge status={sub.status as any} />
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="text-xs text-slate-400">
                      {sub.nextPaymentAt
                        ? new Date(sub.nextPaymentAt).toLocaleDateString()
                        : '-'}
                    </span>
                  </div>
                  <div className="col-span-1 text-right">
                    <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      {sub.status === 'active' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            pauseSubscription(sub.id);
                          }}
                          disabled={isPausing}
                          className="p-1 hover:bg-slate-700/50 rounded text-slate-400 hover:text-amber-400"
                          title="Pause"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      )}
                      {sub.status === 'paused' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            resumeSubscription(sub.id);
                          }}
                          disabled={isResuming}
                          className="p-1 hover:bg-slate-700/50 rounded text-slate-400 hover:text-emerald-400"
                          title="Resume"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      )}
                      {!['canceled', 'expired'].includes(sub.status) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelSubscription(sub.id, { cancelAtPeriodEnd: true });
                          }}
                          disabled={isCanceling}
                          className="p-1 hover:bg-slate-700/50 rounded text-slate-400 hover:text-red-400"
                          title="Cancel"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Table Footer */}
          <div className="px-3 py-2 border-t border-slate-800/40 flex items-center justify-between text-[10px] text-slate-500">
            <span>Showing {filteredSubscriptions.length} subscriptions</span>
          </div>
        </Card>
      ) : (
        /* Plans Tab */
        <Card accent="cyan" delay={0.2} className="overflow-hidden">
          <CardHeader title="Subscription Plans" />

          {/* Plans Grid */}
          {plansLoading ? (
            <div className="px-6 py-12 text-center">
              <div className="w-8 h-8 mx-auto border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4" />
              <p className="text-slate-400 text-sm">Loading plans...</p>
            </div>
          ) : plans.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <svg
                className="w-12 h-12 mx-auto text-slate-600 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <p className="text-slate-400 text-sm mb-1">No plans created yet</p>
              <p className="text-slate-500 text-xs">Create a plan to start accepting subscriptions</p>
            </div>
          ) : (
            <div className="p-4 grid grid-cols-3 gap-4">
              {plans.map((plan) => (
                <motion.div
                  key={plan.id}
                  whileHover={{ y: -2 }}
                  className={`relative bg-slate-800/40 rounded-xl p-4 border ${
                    plan.active ? 'border-cyan-500/30' : 'border-slate-700/30 opacity-60'
                  }`}
                >
                  {!plan.active && (
                    <span className="absolute top-2 right-2 text-[9px] font-mono text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded">
                      Inactive
                    </span>
                  )}
                  <h3 className="text-sm font-semibold text-white mb-1">{plan.name}</h3>
                  <p className="text-[10px] text-slate-500 mb-3 line-clamp-2">
                    {plan.description || 'No description'}
                  </p>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-2xl font-bold text-white">${plan.amount}</span>
                    <span className="text-xs text-slate-500">/{intervalLabels[plan.interval]}</span>
                  </div>
                  {plan.trialDays > 0 && (
                    <div className="text-[10px] text-blue-400 mb-2">{plan.trialDays} day free trial</div>
                  )}
                  {plan.features && plan.features.length > 0 && (
                    <ul className="space-y-1">
                      {plan.features.slice(0, 3).map((feature, i) => (
                        <li key={i} className="text-[10px] text-slate-400 flex items-center gap-1.5">
                          <svg className="w-3 h-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Create Plan Modal */}
      <Modal
        isOpen={showCreatePlanModal}
        onClose={() => setShowCreatePlanModal(false)}
        title="New Subscription Plan"
        subtitle="Create a recurring billing plan for your customers"
        footer={
          <>
            <GlowButton variant="secondary" onClick={() => setShowCreatePlanModal(false)}>
              Cancel
            </GlowButton>
            <GlowButton onClick={handleCreatePlan} disabled={isCreatingPlan}>
              {isCreatingPlan ? 'Creating...' : 'Create Plan'}
            </GlowButton>
          </>
        }
      >
        <div className="space-y-4">
          <FormInput
            label="Plan Name"
            placeholder="e.g., Pro, Enterprise"
            value={planForm.name}
            onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
          />
          <FormInput
            label="Description"
            placeholder="Brief description of this plan"
            value={planForm.description || ''}
            onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Amount"
              type="number"
              placeholder="0.00"
              prefix="$"
              value={planForm.amount || ''}
              onChange={(e) => setPlanForm({ ...planForm, amount: parseFloat(e.target.value) || 0 })}
            />
            <FormSelect
              label="Billing Interval"
              options={[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
                { value: 'yearly', label: 'Yearly' },
              ]}
              value={planForm.interval}
              onChange={(e) => setPlanForm({ ...planForm, interval: e.target.value as SubscriptionInterval })}
            />
          </div>
          <FormInput
            label="Trial Days"
            type="number"
            placeholder="0"
            value={planForm.trialDays || ''}
            onChange={(e) => setPlanForm({ ...planForm, trialDays: parseInt(e.target.value) || 0 })}
          />
        </div>
      </Modal>

      {/* Create Subscription Modal (Placeholder) */}
      <Modal
        isOpen={showCreateSubModal}
        onClose={() => setShowCreateSubModal(false)}
        title="New Subscription"
        subtitle="Subscribe a customer to a plan"
        footer={
          <>
            <GlowButton variant="secondary" onClick={() => setShowCreateSubModal(false)}>
              Cancel
            </GlowButton>
            <GlowButton onClick={() => setShowCreateSubModal(false)}>Create Subscription</GlowButton>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            To create a subscription, select a customer and plan, then provide the customer&apos;s wallet address for
            payment collection.
          </p>
          <FormSelect
            label="Plan"
            options={plans.map((p) => ({ value: p.id, label: `${p.name} - $${p.amount}/${p.interval}` }))}
            value=""
          />
          <FormInput label="Customer Email" type="email" placeholder="customer@company.com" />
          <FormInput label="Customer Wallet" placeholder="0x..." />
          <FormInput label="Merchant Wallet" placeholder="0x... (your receiving wallet)" />
        </div>
      </Modal>
    </motion.div>
  );
}
