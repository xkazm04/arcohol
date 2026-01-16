/**
 * x402 Gateway Types
 *
 * TypeScript types for x402 Gateway dashboard features.
 */

/**
 * Gateway seller configuration stored in Supabase
 */
export interface GatewayConfig {
  id: string;
  organization_id: string;
  seller_address: string;
  enabled: boolean;
  networks: string[];
  description?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Gateway endpoint pricing configuration
 */
export interface GatewayEndpointPricing {
  id: string;
  organization_id: string;
  path: string;
  method: string;
  price: string;
  enabled: boolean;
  name?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  // Stats
  stats30d?: {
    calls: number;
    revenue: number;
  };
}

/**
 * Gateway payment record
 */
export interface GatewayPayment {
  id: string;
  organization_id: string;
  payer: string;
  amount: string;
  network: string;
  transaction: string;
  endpoint_id?: string;
  endpoint?: GatewayEndpointPricing;
  metadata?: Record<string, unknown>;
  created_at: string;
}

/**
 * Gateway balance snapshot
 */
export interface GatewayBalance {
  total: string;
  available: string;
  withdrawing: string;
  withdrawable: string;
}

/**
 * Supported network configuration
 */
export interface SupportedNetwork {
  chainId: number;
  network: string;
  name: string;
  batchingEnabled: boolean;
}

/**
 * Parameters for creating gateway config
 */
export interface CreateGatewayConfigParams {
  sellerAddress: string;
  networks?: string[];
  description?: string;
}

/**
 * Parameters for updating gateway config
 */
export interface UpdateGatewayConfigParams {
  sellerAddress?: string;
  networks?: string[];
  description?: string;
  enabled?: boolean;
}

/**
 * Parameters for creating gateway endpoint pricing
 */
export interface CreateGatewayEndpointParams {
  path: string;
  method: string;
  price: string;
  name?: string;
  description?: string;
}

/**
 * Gateway usage stats
 */
export interface GatewayStats {
  totalPayments: number;
  totalRevenue: number;
  uniquePayers: number;
  avgPaymentAmount: number;
  revenueByDay: Array<{
    date: string;
    revenue: number;
    payments: number;
  }>;
}

/**
 * Available networks for x402 Gateway
 */
export const SUPPORTED_NETWORKS: SupportedNetwork[] = [
  {
    chainId: 5042002,
    network: 'eip155:5042002',
    name: 'Arc Testnet',
    batchingEnabled: true,
  },
  {
    chainId: 84532,
    network: 'eip155:84532',
    name: 'Base Sepolia',
    batchingEnabled: false,
  },
  {
    chainId: 11155111,
    network: 'eip155:11155111',
    name: 'Ethereum Sepolia',
    batchingEnabled: false,
  },
];
