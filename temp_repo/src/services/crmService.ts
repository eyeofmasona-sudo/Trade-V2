import { toast } from 'sonner';

const API_KEY = import.meta.env.VITE_CRM_API_KEY || '';
const BASE_URL = 'https://wnvfwllsfcbijphnudge.supabase.co/functions/v1';

export const crmService = {
  async registerClient(data: {
    external_trader_id: string;
    full_name: string;
    email: string;
    phone?: string;
    country?: string;
    age?: number;
    account?: {
      external_account_id: string;
      platform: string;
      account_type: string;
      currency: string;
      balance: number;
      equity: number;
      leverage: number;
    }
  }) {
    if (!API_KEY) return;
    try {
      const response = await fetch(`${BASE_URL}/trading-register-client`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('API Error');
      return await response.json();
    } catch (e) {
      console.error('CRM Register Error:', e);
    }
  },

  async transaction(data: {
    external_trader_id: string;
    external_account_id?: string;
    external_tx_id: string;
    type: 'deposit' | 'withdrawal';
    amount: number;
    currency?: string;
    status: 'completed' | 'pending' | 'failed' | 'cancelled';
    method?: string;
    processed_at: string;
  }) {
    if (!API_KEY) return;
    try {
      const response = await fetch(`${BASE_URL}/trading-transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
      return await response.json();
    } catch (e) {
      console.error('CRM Transaction Error:', e);
    }
  },

  async activity(data: {
    external_trader_id: string;
    external_account_id?: string;
    external_trade_id: string;
    symbol?: string;
    side?: 'buy' | 'sell';
    volume?: number;
    open_price?: number;
    close_price?: number;
    pnl?: number;
    opened_at?: string;
    closed_at?: string;
    account_balance?: number;
    account_equity?: number;
  }) {
    if (!API_KEY) return;
    try {
      const response = await fetch(`${BASE_URL}/trading-activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: JSON.stringify({
          ...data,
          opened_at: data.opened_at || new Date().toISOString(),
        })
      });
      if (!response.ok) throw new Error('API Error');
      return await response.json();
    } catch (e) {
      console.error('CRM Activity Error:', e);
    }
  },

  async kycUpdate(data: {
    external_trader_id: string;
    status: 'pending' | 'approved' | 'rejected';
    level?: string;
    documents?: any[];
    reason?: string;
    reviewed_at?: string;
  }) {
    if (!API_KEY) return;
    try {
      const response = await fetch(`${BASE_URL}/trading-kyc-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        },
        body: JSON.stringify({
          ...data,
          reviewed_at: data.reviewed_at || new Date().toISOString(),
        })
      });
      if (!response.ok) throw new Error('API Error');
      return await response.json();
    } catch (e) {
      console.error('CRM KYC Error:', e);
    }
  }
};
