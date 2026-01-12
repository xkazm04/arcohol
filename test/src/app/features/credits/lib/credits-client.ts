import { createClient } from '@/lib/supabase/client';

export interface CreditAccount {
  id: string;
  organization_id: string;
  available_balance: number;
  yield_balance: number;
  yield_earned: number;
  status: 'active' | 'suspended' | 'low_balance' | 'depleted';
  settings: {
    low_balance_alert: number;
    auto_top_up: boolean;
    auto_top_up_amount?: number;
    yield_enabled: boolean;
    yield_threshold: number;
  };
  created_at: string;
  updated_at: string;
}

export interface UsageRecord {
  id: string;
  account_id: string;
  meter: string;
  count: number;
  cost: number;
  idempotency_key?: string;
  created_at: string;
}

export class CreditsClient {
  private supabase = createClient();

  async getAccount(accountId: string): Promise<CreditAccount | null> {
    const { data, error } = await this.supabase
      .from('credit_accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (error) {
      console.error('Error fetching credit account:', error);
      return null;
    }

    return data;
  }

  async getAccountByOrganization(organizationId: string): Promise<CreditAccount | null> {
    const { data, error } = await this.supabase
      .from('credit_accounts')
      .select('*')
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      console.error('Error fetching credit account:', error);
      return null;
    }

    return data;
  }

  async deposit(accountId: string, amount: number): Promise<boolean> {
    const { error } = await this.supabase.rpc('credit_deposit', {
      p_account_id: accountId,
      p_amount: amount,
    });

    if (error) {
      console.error('Error depositing:', error);
      return false;
    }

    return true;
  }

  async recordUsage(
    accountId: string,
    meter: string,
    count: number,
    idempotencyKey?: string
  ): Promise<UsageRecord | null> {
    const { data, error } = await this.supabase.rpc('record_usage', {
      p_account_id: accountId,
      p_meter: meter,
      p_count: count,
      p_idempotency_key: idempotencyKey,
    });

    if (error) {
      console.error('Error recording usage:', error);
      return null;
    }

    return data;
  }

  async getUsageHistory(
    accountId: string,
    limit = 50,
    offset = 0
  ): Promise<UsageRecord[]> {
    const { data, error } = await this.supabase
      .from('usage_records')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching usage history:', error);
      return [];
    }

    return data || [];
  }

  async transferToYield(accountId: string, amount: number): Promise<boolean> {
    const { error } = await this.supabase.rpc('transfer_to_yield', {
      p_account_id: accountId,
      p_amount: amount,
    });

    if (error) {
      console.error('Error transferring to yield:', error);
      return false;
    }

    return true;
  }

  async transferFromYield(accountId: string, amount: number): Promise<boolean> {
    const { error } = await this.supabase.rpc('transfer_from_yield', {
      p_account_id: accountId,
      p_amount: amount,
    });

    if (error) {
      console.error('Error transferring from yield:', error);
      return false;
    }

    return true;
  }

  async updateSettings(
    accountId: string,
    settings: Partial<CreditAccount['settings']>
  ): Promise<boolean> {
    const { error } = await this.supabase
      .from('credit_accounts')
      .update({ settings })
      .eq('id', accountId);

    if (error) {
      console.error('Error updating settings:', error);
      return false;
    }

    return true;
  }
}

export const creditsClient = new CreditsClient();
