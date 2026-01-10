import type {
  Wallet,
  CreateWalletOptions,
  Transaction,
  TransferParams,
  WalletBalance,
} from '../types';
import type { CircleClientConfig } from '../types/config';

export class CircleClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: CircleClientConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = 'https://api.circle.com/v1/w3s';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || `Circle API error: ${response.statusText}`
      );
    }

    return response.json();
  }

  async createWalletSet(name: string): Promise<{ id: string }> {
    const response = await this.request<{
      data: { walletSet: { id: string } };
    }>('/developer/walletSets', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });

    return { id: response.data.walletSet.id };
  }

  async createWallet(options: CreateWalletOptions = {}): Promise<Wallet> {
    const walletSetName = `arcpay-${options.userId || Date.now()}`;
    const walletSet = await this.createWalletSet(walletSetName);

    const response = await this.request<{
      data: { wallets: Array<Wallet> };
    }>('/developer/wallets', {
      method: 'POST',
      body: JSON.stringify({
        walletSetId: walletSet.id,
        blockchains: ['ARC'],
        count: 1,
        accountType: options.accountType || 'SCA',
      }),
    });

    const wallet = response.data.wallets[0];
    return this.formatWallet(wallet);
  }

  async getWallet(walletId: string): Promise<Wallet> {
    const response = await this.request<{
      data: { wallet: Wallet };
    }>(`/wallets/${walletId}`);

    return this.formatWallet(response.data.wallet);
  }

  async getBalance(walletId: string): Promise<WalletBalance[]> {
    const response = await this.request<{
      data: { tokenBalances: Array<{ token: { symbol: string }; amount: string; updateDate: string }> };
    }>(`/wallets/${walletId}/balances`);

    return response.data.tokenBalances.map((b) => ({
      token: b.token.symbol,
      amount: b.amount,
      amountRaw: BigInt(Math.floor(parseFloat(b.amount) * 1e6)),
      updateDate: b.updateDate,
    }));
  }

  async getUSDCBalance(walletId: string): Promise<string> {
    const balances = await this.getBalance(walletId);
    const usdcBalance = balances.find((b) => b.token === 'USDC');
    return usdcBalance?.amount || '0';
  }

  async transfer(
    walletId: string,
    params: TransferParams
  ): Promise<Transaction> {
    const response = await this.request<{
      data: { transaction: Transaction };
    }>('/developer/transactions/transfer', {
      method: 'POST',
      body: JSON.stringify({
        walletId,
        tokenId: 'usdc',
        destinationAddress: params.to,
        amounts: [String(params.amount)],
        fee: { type: 'level', config: { feeLevel: 'MEDIUM' } },
        idempotencyKey: params.idempotencyKey || crypto.randomUUID(),
      }),
    });

    return this.formatTransaction(response.data.transaction);
  }

  async getTransaction(transactionId: string): Promise<Transaction> {
    const response = await this.request<{
      data: { transaction: Transaction };
    }>(`/transactions/${transactionId}`);

    return this.formatTransaction(response.data.transaction);
  }

  async listTransactions(
    walletId: string,
    options?: {
      pageSize?: number;
      pageBefore?: string;
      pageAfter?: string;
    }
  ): Promise<{ transactions: Transaction[]; hasMore: boolean }> {
    const params = new URLSearchParams({
      walletIds: walletId,
      pageSize: String(options?.pageSize || 20),
    });

    if (options?.pageBefore) params.set('pageBefore', options.pageBefore);
    if (options?.pageAfter) params.set('pageAfter', options.pageAfter);

    const response = await this.request<{
      data: { transactions: Transaction[] };
    }>(`/transactions?${params}`);

    return {
      transactions: response.data.transactions.map((tx) =>
        this.formatTransaction(tx)
      ),
      hasMore: response.data.transactions.length === (options?.pageSize || 20),
    };
  }

  private formatWallet(wallet: unknown): Wallet {
    const w = wallet as Record<string, unknown>;
    return {
      id: String(w.id || ''),
      address: String(w.address || ''),
      walletSetId: String(w.walletSetId || ''),
      blockchain: String(w.blockchain || 'ARC'),
      accountType: (w.accountType as 'SCA' | 'EOA') || 'SCA',
      state: (w.state as 'LIVE' | 'FROZEN') || 'LIVE',
      createDate: String(w.createDate || ''),
      updateDate: String(w.updateDate || ''),
    };
  }

  private formatTransaction(tx: unknown): Transaction {
    const t = tx as Record<string, unknown>;
    return {
      id: String(t.id || ''),
      hash: t.txHash as string | undefined,
      state: t.state as Transaction['state'],
      type: t.transactionType === 'INBOUND' ? 'INBOUND' : 'OUTBOUND',
      amounts: (t.amounts as string[]) || [],
      tokenId: String(t.tokenId || 'usdc'),
      walletId: String(t.walletId || ''),
      sourceAddress: String(t.sourceAddress || ''),
      destinationAddress: String(t.destinationAddress || ''),
      transactionType: String(t.transactionType || ''),
      createDate: String(t.createDate || ''),
      updateDate: String(t.updateDate || ''),
      errorReason: t.errorReason as string | undefined,
      feeLevel: t.feeLevel as Transaction['feeLevel'],
      networkFee: t.networkFee as string | undefined,
    };
  }
}
