'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  StatCard,
  Card,
  CardHeader,
  CardBody,
  DataList,
  DataListItem,
  Modal,
  GlowButton,
  FormInput,
  FormSelect,
  FilterTabs,
  StatusBadge,
  staggerContainer,
  listItem,
} from '@/components/dashboard';
import {
  useCreditAccounts,
  useCreditEndpoints,
  useCreditTransactions,
  useUsageStats,
  type CreditAccount,
} from '@/features/api-credits';
import {
  useGatewayConfig,
  useGatewayPayments,
  SUPPORTED_NETWORKS,
} from '@/features/x402-gateway';

export default function ApiCreditsPage() {
  // Billing mode: 'credits' (database-based) or 'gateway' (x402 gasless)
  const [billingMode, setBillingMode] = useState<'credits' | 'gateway'>('credits');
  const [viewMode, setViewMode] = useState<'endpoints' | 'accounts' | 'transactions'>('endpoints');
  const [showNewEndpointModal, setShowNewEndpointModal] = useState(false);
  const [showNewAccountModal, setShowNewAccountModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<CreditAccount | null>(null);
  const [codeTab, setCodeTab] = useState('middleware');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real data hooks - Credits mode
  const { accounts, total: totalAccounts, isLoading: accountsLoading, createAccount, depositCredits, fetchAccounts } = useCreditAccounts();
  const { endpoints, isLoading: endpointsLoading, createEndpoint, fetchEndpoints } = useCreditEndpoints();
  const { transactions, isLoading: transactionsLoading, fetchTransactions } = useCreditTransactions();
  const { stats, isLoading: statsLoading } = useUsageStats({ period: '30d' });

  // Real data hooks - Gateway mode
  const { config: gatewayConfig, isLoading: gatewayConfigLoading, createConfig: createGatewayConfig, updateConfig: updateGatewayConfig } = useGatewayConfig();
  const { payments: gatewayPayments, stats: gatewayStats, isLoading: gatewayPaymentsLoading } = useGatewayPayments();

  // Gateway config form state
  const [showGatewayConfigModal, setShowGatewayConfigModal] = useState(false);
  const [gatewayForm, setGatewayForm] = useState({
    sellerAddress: '',
    networks: ['eip155:5042002'],
    description: '',
  });

  // Computed values
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const activeAccounts = accounts.filter(a => a.active).length;
  const activeEndpoints = endpoints.filter(e => e.active).length;

  // New endpoint form
  const [newEndpoint, setNewEndpoint] = useState({
    path: '',
    method: 'POST',
    pricePerCall: '0.01',
    name: '',
    description: '',
  });

  // New account form
  const [newAccount, setNewAccount] = useState({
    externalCustomerId: '',
    initialBalance: '0',
    lowBalanceThreshold: '10',
  });

  // Deposit form
  const [depositAmount, setDepositAmount] = useState('100');
  const [depositType, setDepositType] = useState('deposit');

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4 max-w-7xl"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center"
            style={{ boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)' }}
          >
            <span className="text-white font-mono font-bold text-sm">402</span>
          </motion.div>
          <div>
            <h1 className="text-lg font-semibold text-white" style={{ textShadow: '0 0 20px rgba(6, 182, 212, 0.3)' }}>
              API Monetization
            </h1>
            <p className="text-xs text-slate-400">
              {billingMode === 'credits' ? 'Credit-based access & pay-per-request billing' : 'Gasless micropayments via Circle Gateway'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Billing Mode Toggle */}
          <div className="flex items-center bg-slate-800/50 rounded-lg p-0.5 border border-slate-700/50">
            {(['credits', 'gateway'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setBillingMode(mode)}
                className={`px-3 py-1.5 text-[10px] font-medium rounded-md transition-all ${
                  billingMode === mode
                    ? mode === 'gateway'
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {mode === 'credits' ? 'Credits' : 'x402 Gateway'}
              </button>
            ))}
          </div>
          {/* View Mode Toggle - only show in credits mode */}
          {billingMode === 'credits' && (
          <div className="flex items-center bg-slate-800/50 rounded-lg p-0.5 border border-slate-700/50">
            {(['endpoints', 'accounts', 'transactions'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 text-[10px] font-medium rounded-md transition-all capitalize ${
                  viewMode === mode
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          )}
          {billingMode === 'credits' ? (
            <GlowButton
              onClick={() => viewMode === 'accounts' ? setShowNewAccountModal(true) : setShowNewEndpointModal(true)}
            >
              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {viewMode === 'accounts' ? 'New Account' : 'New Endpoint'}
            </GlowButton>
          ) : (
            <GlowButton
              accent="purple"
              onClick={() => setShowGatewayConfigModal(true)}
            >
              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {gatewayConfig ? 'Configure Gateway' : 'Setup Gateway'}
            </GlowButton>
          )}
        </div>
      </motion.div>

      {/* Gateway Mode View */}
      {billingMode === 'gateway' && (
        <>
          {/* Gateway Stats Row */}
          <motion.div variants={staggerContainer} className="grid grid-cols-4 gap-3">
            <StatCard
              label="Total Revenue (30d)"
              value={gatewayPaymentsLoading ? '...' : `$${(gatewayStats?.totalRevenue || 0).toLocaleString()}`}
              accent="purple"
              delay={0.1}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 1v8m0 0v1" />
                </svg>
              }
            />
            <StatCard
              label="Payments (30d)"
              value={gatewayPaymentsLoading ? '...' : (gatewayStats?.totalPayments || 0).toString()}
              accent="cyan"
              delay={0.15}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
            />
            <StatCard
              label="Unique Payers"
              value={gatewayPaymentsLoading ? '...' : (gatewayStats?.uniquePayers || 0).toString()}
              accent="emerald"
              delay={0.2}
            />
            <StatCard
              label="Avg. Payment"
              value={gatewayPaymentsLoading ? '...' : `$${(gatewayStats?.avgPaymentAmount || 0).toFixed(2)}`}
              accent="amber"
              delay={0.25}
            />
          </motion.div>

          {/* Gateway How It Works Banner */}
          <motion.div
            variants={listItem}
            className="relative bg-gradient-to-r from-purple-500/10 via-slate-900 to-cyan-500/10 rounded-lg border border-purple-500/20 p-4 overflow-hidden"
          >
            <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#a855f7_1px,transparent_1px),linear-gradient(to_bottom,#a855f7_1px,transparent_1px)] bg-[size:20px_20px]" />
            <div className="relative grid grid-cols-4 gap-4">
              {[
                { step: '1', title: 'Customer Deposits', desc: 'USDC into Gateway (one-time)' },
                { step: '2', title: 'Sign Payment', desc: 'Gasless signature per request' },
                { step: '3', title: 'Instant Access', desc: 'API responds immediately' },
                { step: '4', title: 'Batch Settlement', desc: 'Circle batches on-chain' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center shrink-0 border border-purple-500/30">
                    <span className="text-purple-400 font-mono font-bold text-sm">{item.step}</span>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-white">{item.title}</div>
                    <div className="text-[10px] text-slate-500">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Gateway Config Status */}
          <motion.div variants={listItem} className="grid grid-cols-12 gap-4">
            {/* Gateway Status Card */}
            <div className="col-span-5">
              <Card accent="purple" delay={0.3}>
                <CardHeader title="Gateway Configuration" />
                <CardBody>
                  {gatewayConfigLoading ? (
                    <div className="text-center text-slate-500 text-xs py-4">Loading...</div>
                  ) : gatewayConfig ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 uppercase">Status</span>
                        <StatusBadge
                          status={gatewayConfig.enabled ? 'active' : 'inactive'}
                          label={gatewayConfig.enabled ? 'Enabled' : 'Disabled'}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 uppercase">Seller Address</span>
                        <span className="text-xs font-mono text-white">
                          {gatewayConfig.seller_address.slice(0, 6)}...{gatewayConfig.seller_address.slice(-4)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 uppercase">Networks</span>
                        <div className="flex gap-1">
                          {gatewayConfig.networks.map((net: string) => (
                            <span key={net} className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              {SUPPORTED_NETWORKS.find(n => n.network === net)?.name || net}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-3 border border-purple-500/30">
                        <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <div className="text-sm text-white mb-1">No Gateway Configured</div>
                      <div className="text-xs text-slate-500 mb-4">Set up your seller address to start accepting gasless payments</div>
                      <GlowButton accent="purple" onClick={() => setShowGatewayConfigModal(true)}>
                        Setup Gateway
                      </GlowButton>
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>

            {/* Recent Payments */}
            <div className="col-span-7">
              <Card accent="cyan" delay={0.35}>
                <CardHeader
                  title="Recent Gateway Payments"
                  action={<span className="text-[10px] text-slate-500">{gatewayPayments.length} payments</span>}
                />
                <DataList>
                  {gatewayPaymentsLoading ? (
                    <DataListItem>
                      <div className="text-center text-slate-500 text-xs py-4">Loading payments...</div>
                    </DataListItem>
                  ) : gatewayPayments.length === 0 ? (
                    <DataListItem>
                      <div className="text-center text-slate-500 text-xs py-4">
                        No payments yet. Payments will appear here when customers pay for your API endpoints.
                      </div>
                    </DataListItem>
                  ) : gatewayPayments.slice(0, 5).map((payment) => (
                    <DataListItem key={payment.id}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/30">
                            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-xs text-white font-mono">
                              {payment.payer.slice(0, 6)}...{payment.payer.slice(-4)}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {SUPPORTED_NETWORKS.find(n => n.network === payment.network)?.name || payment.network}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm font-mono text-emerald-400">${payment.amount}</div>
                          <div className="text-[10px] text-slate-600">
                            {new Date(payment.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </DataListItem>
                  ))}
                </DataList>
              </Card>
            </div>
          </motion.div>

          {/* Integration Guide for Gateway */}
          <motion.div variants={listItem}>
            <Card accent="purple" delay={0.4}>
              <CardHeader
                title="x402 Gateway Integration"
                action={
                  <FilterTabs
                    tabs={[
                      { id: 'express', label: 'Express' },
                      { id: 'nextjs', label: 'Next.js' },
                    ]}
                    activeTab={codeTab}
                    onChange={setCodeTab}
                  />
                }
              />
              <CardBody>
                <pre className="text-[10px] font-mono text-slate-400 overflow-x-auto leading-relaxed bg-slate-950/50 p-3 rounded-lg">
                  {codeTab === 'express' ? `import express from 'express';
import { x402Middleware } from '@arcpay/b2b/middleware/express';

const app = express();

const x402 = x402Middleware({
  sellerAddress: '${gatewayConfig?.seller_address || '0x...'}',
});

// Free endpoint
app.get('/api/free', (req, res) => {
  res.json({ message: 'Free content' });
});

// Paid endpoint - $0.01 per request (gasless!)
app.get('/api/premium', x402.require('$0.01'), (req, res) => {
  res.json({
    premium: 'content',
    payment: req.x402Payment, // Payment info attached
  });
});` : `// app/api/premium/route.ts
import { withX402 } from '@arcpay/b2b/middleware/nextjs';

export const GET = withX402({
  sellerAddress: '${gatewayConfig?.seller_address || '0x...'}',
  price: '$0.05',
})(async (request, { payment }) => {
  return Response.json({
    premium: 'content',
    payer: payment.payer,
    amount: payment.amount,
  });
});`}
                </pre>
                <div className="mt-3 p-2 bg-purple-500/5 rounded border border-purple-500/20">
                  <div className="text-[10px] text-purple-400 mb-1">Zero Gas for Customers</div>
                  <div className="text-[9px] text-slate-500">
                    Customers deposit USDC once to Gateway, then sign payment messages (gasless) for each API call. Circle batches settlements on-chain.
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </>
      )}

      {/* Credits Mode View */}
      {billingMode === 'credits' && (
        <>
      {/* Stats Row */}
      <motion.div variants={staggerContainer} className="grid grid-cols-4 gap-3">
        <StatCard
          label="Total Revenue (30d)"
          value={statsLoading ? '...' : `$${(stats?.summary.totalRevenue || 0).toLocaleString()}`}
          accent="emerald"
          delay={0.1}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 1v8m0 0v1" />
            </svg>
          }
        />
        <StatCard
          label="API Requests (30d)"
          value={statsLoading ? '...' : `${((stats?.summary.totalRequests || 0) / 1000).toFixed(1)}k`}
          accent="cyan"
          delay={0.15}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          }
        />
        <StatCard
          label="Active Accounts"
          value={accountsLoading ? '...' : activeAccounts.toString()}
          subValue={accountsLoading ? '' : `$${totalBalance.toFixed(2)} total balance`}
          accent="purple"
          delay={0.2}
        />
        <StatCard
          label="Success Rate"
          value={statsLoading ? '...' : `${(stats?.summary.successRate || 0).toFixed(1)}%`}
          subValue={statsLoading ? '' : `${stats?.summary.avgResponseTime || 0}ms avg`}
          accent="emerald"
          delay={0.25}
        />
      </motion.div>

      {/* How It Works Banner */}
      <motion.div
        variants={listItem}
        className="relative bg-gradient-to-r from-cyan-500/10 via-slate-900 to-blue-500/10 rounded-lg border border-cyan-500/20 p-4 overflow-hidden"
      >
        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#0891b2_1px,transparent_1px),linear-gradient(to_bottom,#0891b2_1px,transparent_1px)] bg-[size:20px_20px]" />
        <div className="relative grid grid-cols-4 gap-4">
          {[
            { step: '1', title: 'Configure Endpoints', desc: 'Set pricing per API endpoint' },
            { step: '2', title: 'Customer Deposits', desc: 'Customers fund their account' },
            { step: '3', title: 'Instant Billing', desc: 'Credits deducted per request' },
            { step: '4', title: 'Settlement', desc: 'Revenue to your treasury' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center shrink-0 border border-cyan-500/30">
                <span className="text-cyan-400 font-mono font-bold text-sm">{item.step}</span>
              </div>
              <div>
                <div className="text-xs font-medium text-white">{item.title}</div>
                <div className="text-[10px] text-slate-500">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Endpoints View */}
      {viewMode === 'endpoints' && (
        <motion.div variants={listItem} className="grid grid-cols-12 gap-4">
          {/* Endpoints List */}
          <div className="col-span-8">
            <Card accent="cyan" delay={0.3}>
              <CardHeader
                title="Monetized Endpoints"
                action={
                  <span className="text-[10px] text-slate-500">
                    {endpointsLoading ? '...' : `${activeEndpoints} active`}
                  </span>
                }
              />
              <DataList>
                {endpointsLoading ? (
                  <DataListItem>
                    <div className="text-center text-slate-500 text-xs py-4">Loading endpoints...</div>
                  </DataListItem>
                ) : endpoints.length === 0 ? (
                  <DataListItem>
                    <div className="text-center text-slate-500 text-xs py-4">
                      No endpoints configured. Add your first monetized endpoint to start billing API calls.
                    </div>
                  </DataListItem>
                ) : endpoints.map((endpoint) => (
                  <DataListItem key={endpoint.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 text-[9px] font-mono rounded border ${
                            endpoint.method === 'GET' || endpoint.method === '*'
                              ? 'bg-green-500/10 text-green-400 border-green-500/20'
                              : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}>
                            {endpoint.method}
                          </span>
                          <span className="text-xs font-mono text-white">{endpoint.path}</span>
                        </div>
                        {endpoint.name && (
                          <span className="text-[10px] text-slate-500">({endpoint.name})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-xs font-mono text-emerald-400">${endpoint.price_per_call.toFixed(2)}</div>
                          <div className="text-[9px] text-slate-600">per call</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-mono text-white">{(endpoint.stats30d?.calls || 0).toLocaleString()}</div>
                          <div className="text-[9px] text-slate-600">calls/30d</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-mono text-emerald-400">${(endpoint.stats30d?.revenue || 0).toFixed(2)}</div>
                          <div className="text-[9px] text-slate-600">revenue</div>
                        </div>
                        <StatusBadge
                          status={endpoint.active ? 'active' : 'inactive'}
                          label={endpoint.active ? 'active' : 'disabled'}
                          size="sm"
                        />
                      </div>
                    </div>
                  </DataListItem>
                ))}
              </DataList>
            </Card>
          </div>

          {/* Integration Guide */}
          <div className="col-span-4">
            <Card accent="purple" delay={0.35}>
              <CardHeader
                title="Integration"
                action={
                  <FilterTabs
                    tabs={[
                      { id: 'middleware', label: 'Next.js' },
                      { id: 'express', label: 'Express' },
                    ]}
                    activeTab={codeTab}
                    onChange={setCodeTab}
                  />
                }
              />
              <CardBody>
                <pre className="text-[10px] font-mono text-slate-400 overflow-x-auto leading-relaxed bg-slate-950/50 p-3 rounded-lg">
                  {codeTab === 'middleware' ? `import { withCredits } from '@arcpay/b2b/middleware/nextjs';
import { ArcPayB2B } from '@arcpay/b2b';

const client = new ArcPayB2B({ apiKey: 'arc_...' });

export const GET = withCredits({
  client,
  getCustomerId: (req) =>
    req.headers.get('x-customer-id'),
  onDeduction: async (info) => {
    console.log(\`Charged \${info.amount}\`);
  }
})(async (req, { credits }) => {
  // credits.accountId
  // credits.balanceAfter
  return NextResponse.json({ data });
});` : `import { creditsMiddleware } from '@arcpay/b2b/middleware/express';
import { ArcPayB2B } from '@arcpay/b2b';

const client = new ArcPayB2B({ apiKey: 'arc_...' });

app.use('/api/v1/*', creditsMiddleware({
  client,
  getCustomerId: (req) =>
    req.headers['x-customer-id'],
}));

app.get('/api/v1/data', (req, res) => {
  // req.credits.accountId
  // req.credits.balanceAfter
  res.json({ data });
});`}
                </pre>
                <div className="mt-3 p-2 bg-cyan-500/5 rounded border border-cyan-500/20">
                  <div className="text-[10px] text-cyan-400 mb-1">Customer Identification</div>
                  <div className="text-[9px] text-slate-500">
                    Pass customer ID via <code className="text-cyan-400">x-customer-id</code> header or link API keys to accounts.
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Accounts View */}
      {viewMode === 'accounts' && (
        <motion.div variants={listItem}>
          <Card accent="purple" delay={0.3}>
            <CardHeader
              title="Customer Credit Accounts"
              action={
                <span className="text-[10px] text-slate-500">
                  {accountsLoading ? '...' : `Total Balance: $${totalBalance.toFixed(2)}`}
                </span>
              }
            />
            <DataList>
              {accountsLoading ? (
                <DataListItem>
                  <div className="text-center text-slate-500 text-xs py-4">Loading accounts...</div>
                </DataListItem>
              ) : accounts.length === 0 ? (
                <DataListItem>
                  <div className="text-center text-slate-500 text-xs py-4">
                    No credit accounts yet. Create an account or they&apos;ll be auto-created on first API call.
                  </div>
                </DataListItem>
              ) : accounts.map((account) => (
                <DataListItem key={account.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center border border-purple-500/30">
                        <span className="text-purple-400 font-mono text-xs">
                          {account.external_customer_id.slice(0, 4).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-xs font-mono text-white">{account.external_customer_id}</div>
                        <div className="text-[10px] text-slate-500">
                          {account.total_requests.toLocaleString()} requests lifetime
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className={`text-sm font-mono font-bold ${
                          account.balance < account.low_balance_threshold ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          ${account.balance.toFixed(2)}
                        </div>
                        <div className="text-[9px] text-slate-600">balance</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-mono text-slate-300">${account.total_spent.toFixed(2)}</div>
                        <div className="text-[9px] text-slate-600">lifetime spent</div>
                      </div>
                      <StatusBadge
                        status={account.active ? 'active' : 'inactive'}
                        label={account.active ? 'active' : 'suspended'}
                        size="sm"
                      />
                      <GlowButton
                        variant="secondary"
                        onClick={() => {
                          setSelectedAccount(account);
                          setShowDepositModal(true);
                        }}
                      >
                        Add Credits
                      </GlowButton>
                    </div>
                  </div>
                </DataListItem>
              ))}
            </DataList>
          </Card>
        </motion.div>
      )}

      {/* Transactions View */}
      {viewMode === 'transactions' && (
        <motion.div variants={listItem}>
          <Card accent="cyan" delay={0.3}>
            <CardHeader title="Recent Transactions" />
            <DataList>
              {transactionsLoading ? (
                <DataListItem>
                  <div className="text-center text-slate-500 text-xs py-4">Loading transactions...</div>
                </DataListItem>
              ) : transactions.length === 0 ? (
                <DataListItem>
                  <div className="text-center text-slate-500 text-xs py-4">
                    No transactions yet. Transactions will appear as customers use their API credits.
                  </div>
                </DataListItem>
              ) : transactions.map((tx) => (
                <DataListItem key={tx.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        tx.type === 'deposit' || tx.type === 'bonus' || tx.type === 'refund'
                          ? 'bg-emerald-500/10 border border-emerald-500/30'
                          : 'bg-blue-500/10 border border-blue-500/30'
                      }`}>
                        <svg
                          className={`w-4 h-4 ${tx.type === 'deposit' || tx.type === 'bonus' || tx.type === 'refund' ? 'text-emerald-400' : 'text-blue-400'}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          {tx.type === 'deposit' || tx.type === 'bonus' || tx.type === 'refund' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          )}
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs text-white">
                          {tx.type === 'deposit' ? 'Credit Deposit' :
                           tx.type === 'bonus' ? 'Promotional Bonus' :
                           tx.type === 'refund' ? 'Refund' :
                           tx.type === 'adjustment' ? 'Manual Adjustment' :
                           `API Call${tx.endpoint ? `: ${tx.endpoint.path}` : ''}`}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {tx.account?.external_customer_id || tx.account_id}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`text-sm font-mono font-bold ${
                        tx.amount > 0 ? 'text-emerald-400' : 'text-slate-300'
                      }`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)} {tx.currency}
                      </div>
                      <div className="text-[10px] text-slate-600 w-24 text-right">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </DataListItem>
              ))}
            </DataList>
          </Card>
        </motion.div>
      )}
        </>
      )}

      {/* Gateway Config Modal */}
      <Modal
        isOpen={showGatewayConfigModal}
        onClose={() => setShowGatewayConfigModal(false)}
        title={gatewayConfig ? 'Configure Gateway' : 'Setup Gateway'}
        subtitle="Configure your seller address for x402 gasless payments"
        size="md"
        footer={
          <>
            <GlowButton variant="secondary" onClick={() => setShowGatewayConfigModal(false)}>Cancel</GlowButton>
            <GlowButton
              accent="purple"
              disabled={isSubmitting || !gatewayForm.sellerAddress}
              onClick={async () => {
                setIsSubmitting(true);
                try {
                  if (gatewayConfig) {
                    await updateGatewayConfig({
                      sellerAddress: gatewayForm.sellerAddress,
                      networks: gatewayForm.networks,
                      description: gatewayForm.description,
                    });
                  } else {
                    await createGatewayConfig({
                      sellerAddress: gatewayForm.sellerAddress,
                      networks: gatewayForm.networks,
                      description: gatewayForm.description,
                    });
                  }
                  setShowGatewayConfigModal(false);
                } catch (err) {
                  console.error('Failed to save gateway config:', err);
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              {isSubmitting ? 'Saving...' : gatewayConfig ? 'Update' : 'Enable Gateway'}
            </GlowButton>
          </>
        }
      >
        <div className="space-y-4">
          <FormInput
            label="Seller Address"
            value={gatewayForm.sellerAddress}
            onChange={(e) => setGatewayForm({ ...gatewayForm, sellerAddress: e.target.value })}
            placeholder="0x..."
            hint="Your wallet address to receive payments"
          />

          <div>
            <div className="text-[10px] text-slate-500 uppercase mb-2">Accepted Networks</div>
            <div className="space-y-2">
              {SUPPORTED_NETWORKS.map((network) => (
                <label key={network.network} className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gatewayForm.networks.includes(network.network)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setGatewayForm({ ...gatewayForm, networks: [...gatewayForm.networks, network.network] });
                      } else {
                        setGatewayForm({ ...gatewayForm, networks: gatewayForm.networks.filter(n => n !== network.network) });
                      }
                    }}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-purple-500 focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <div className="text-xs text-white">{network.name}</div>
                    <div className="text-[10px] text-slate-500">{network.network}</div>
                  </div>
                  {network.batchingEnabled && (
                    <span className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      Gasless
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>

          <FormInput
            label="Description (optional)"
            value={gatewayForm.description}
            onChange={(e) => setGatewayForm({ ...gatewayForm, description: e.target.value })}
            placeholder="API access for premium content"
            hint="Shown to customers in payment requests"
          />

          <div className="p-3 bg-purple-500/5 rounded-lg border border-purple-500/20">
            <div className="text-[10px] text-purple-400 mb-1">How It Works</div>
            <div className="text-[9px] text-slate-500">
              Customers deposit USDC to Circle Gateway once, then pay for API requests by signing messages (gasless).
              Circle batches these payments on-chain, minimizing gas costs.
            </div>
          </div>
        </div>
      </Modal>

      {/* New Endpoint Modal */}
      <Modal
        isOpen={showNewEndpointModal}
        onClose={() => setShowNewEndpointModal(false)}
        title="Add Monetized Endpoint"
        subtitle="Configure pricing for an API endpoint"
        size="md"
        footer={
          <>
            <GlowButton variant="secondary" onClick={() => setShowNewEndpointModal(false)}>Cancel</GlowButton>
            <GlowButton
              disabled={isSubmitting || !newEndpoint.path || !newEndpoint.pricePerCall}
              onClick={async () => {
                setIsSubmitting(true);
                try {
                  await createEndpoint({
                    path: newEndpoint.path,
                    method: newEndpoint.method,
                    pricePerCall: parseFloat(newEndpoint.pricePerCall),
                    name: newEndpoint.name || undefined,
                    description: newEndpoint.description || undefined,
                  });
                  setShowNewEndpointModal(false);
                  setNewEndpoint({ path: '', method: 'POST', pricePerCall: '0.01', name: '', description: '' });
                } catch (err) {
                  console.error('Failed to create endpoint:', err);
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              {isSubmitting ? 'Creating...' : 'Create Endpoint'}
            </GlowButton>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <FormSelect
              label="Method"
              value={newEndpoint.method}
              onChange={(e) => setNewEndpoint({ ...newEndpoint, method: e.target.value })}
              options={[
                { value: 'GET', label: 'GET' },
                { value: 'POST', label: 'POST' },
                { value: 'PUT', label: 'PUT' },
                { value: 'DELETE', label: 'DELETE' },
                { value: '*', label: '* (All)' },
              ]}
            />
            <div className="col-span-2">
              <FormInput
                label="Path"
                value={newEndpoint.path}
                onChange={(e) => setNewEndpoint({ ...newEndpoint, path: e.target.value })}
                placeholder="/api/v1/analyze"
                hint="Use * for wildcards: /api/v1/*"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Price per Call"
              value={newEndpoint.pricePerCall}
              onChange={(e) => setNewEndpoint({ ...newEndpoint, pricePerCall: e.target.value })}
              type="number"
              prefix="$"
              className="font-mono"
            />
            <FormInput
              label="Display Name"
              value={newEndpoint.name}
              onChange={(e) => setNewEndpoint({ ...newEndpoint, name: e.target.value })}
              placeholder="Content Analysis"
            />
          </div>

          <FormInput
            label="Description (optional)"
            value={newEndpoint.description}
            onChange={(e) => setNewEndpoint({ ...newEndpoint, description: e.target.value })}
            placeholder="Analyze content using AI"
          />

          <div className="p-3 bg-cyan-500/5 rounded-lg border border-cyan-500/20">
            <div className="text-[10px] text-cyan-400 mb-1">Pricing Note</div>
            <div className="text-[9px] text-slate-500">
              Customers will be charged ${newEndpoint.pricePerCall || '0.00'} USDC per successful API call to this endpoint.
              Failed requests (4xx, 5xx) are not charged.
            </div>
          </div>
        </div>
      </Modal>

      {/* New Account Modal */}
      <Modal
        isOpen={showNewAccountModal}
        onClose={() => setShowNewAccountModal(false)}
        title="Create Credit Account"
        subtitle="Set up a new customer credit account"
        size="sm"
        footer={
          <>
            <GlowButton variant="secondary" onClick={() => setShowNewAccountModal(false)}>Cancel</GlowButton>
            <GlowButton
              disabled={isSubmitting || !newAccount.externalCustomerId}
              onClick={async () => {
                setIsSubmitting(true);
                try {
                  await createAccount({
                    externalCustomerId: newAccount.externalCustomerId,
                    initialBalance: parseFloat(newAccount.initialBalance) || 0,
                    lowBalanceThreshold: parseFloat(newAccount.lowBalanceThreshold) || 10,
                  });
                  setShowNewAccountModal(false);
                  setNewAccount({ externalCustomerId: '', initialBalance: '0', lowBalanceThreshold: '10' });
                } catch (err) {
                  console.error('Failed to create account:', err);
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </GlowButton>
          </>
        }
      >
        <div className="space-y-4">
          <FormInput
            label="External Customer ID"
            value={newAccount.externalCustomerId}
            onChange={(e) => setNewAccount({ ...newAccount, externalCustomerId: e.target.value })}
            placeholder="cust_your_system_id"
            hint="The customer ID from your system"
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Initial Balance"
              value={newAccount.initialBalance}
              onChange={(e) => setNewAccount({ ...newAccount, initialBalance: e.target.value })}
              type="number"
              prefix="$"
              className="font-mono"
            />
            <FormInput
              label="Low Balance Alert"
              value={newAccount.lowBalanceThreshold}
              onChange={(e) => setNewAccount({ ...newAccount, lowBalanceThreshold: e.target.value })}
              type="number"
              prefix="$"
              hint="Alert when below"
              className="font-mono"
            />
          </div>

          <div className="p-3 bg-purple-500/5 rounded-lg border border-purple-500/20">
            <div className="text-[10px] text-purple-400 mb-1">Auto-Creation</div>
            <div className="text-[9px] text-slate-500">
              Accounts are automatically created when a new customer makes their first API call.
              Use this form for pre-provisioning or granting initial credits.
            </div>
          </div>
        </div>
      </Modal>

      {/* Deposit Modal */}
      <Modal
        isOpen={showDepositModal}
        onClose={() => {
          setShowDepositModal(false);
          setSelectedAccount(null);
        }}
        title="Add Credits"
        subtitle={selectedAccount ? `Account: ${selectedAccount.external_customer_id}` : ''}
        size="sm"
        footer={
          <>
            <GlowButton variant="secondary" onClick={() => setShowDepositModal(false)}>Cancel</GlowButton>
            <GlowButton
              disabled={isSubmitting || !depositAmount || parseFloat(depositAmount) <= 0}
              onClick={async () => {
                if (!selectedAccount) return;
                setIsSubmitting(true);
                try {
                  await depositCredits(selectedAccount.id, {
                    amount: parseFloat(depositAmount),
                    type: depositType as 'deposit' | 'bonus' | 'adjustment',
                    description: depositType === 'bonus' ? 'Promotional bonus' : undefined,
                  });
                  setShowDepositModal(false);
                  setSelectedAccount(null);
                  setDepositAmount('100');
                  setDepositType('deposit');
                } catch (err) {
                  console.error('Failed to deposit credits:', err);
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              {isSubmitting ? 'Processing...' : `Add $${depositAmount}`}
            </GlowButton>
          </>
        }
      >
        <div className="space-y-4">
          {selectedAccount && (
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/30 text-center">
              <div className="text-[10px] text-slate-500 mb-1">Current Balance</div>
              <div className={`text-2xl font-mono font-bold ${
                selectedAccount.balance < selectedAccount.low_balance_threshold ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                ${selectedAccount.balance.toFixed(2)}
              </div>
            </div>
          )}

          <div>
            <div className="text-[10px] text-slate-500 uppercase mb-2">Quick Add</div>
            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 100, 250].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setDepositAmount(amt.toString())}
                  className={`py-2 text-xs font-medium rounded-lg transition-all ${
                    depositAmount === amt.toString()
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800/60 text-slate-400 border border-transparent hover:bg-slate-800'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>
          </div>

          <FormInput
            label="Custom Amount"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            type="number"
            prefix="$"
            className="font-mono"
          />

          <FormSelect
            label="Credit Type"
            value={depositType}
            onChange={(e) => setDepositType(e.target.value)}
            options={[
              { value: 'deposit', label: 'Customer Deposit' },
              { value: 'bonus', label: 'Promotional Bonus' },
              { value: 'adjustment', label: 'Manual Adjustment' },
            ]}
          />
        </div>
      </Modal>
    </motion.div>
  );
}
