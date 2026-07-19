/**
 * Finance, wallet & payout endpoints
 */

import { ApiClient } from '../client';
import { ApiResponse, PaginatedResponse } from '../types';

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  pendingBalance: number;
  currency: string;
  lastPayout: string | null;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: 'credit' | 'debit' | 'escrow_hold' | 'escrow_release' | 'payout';
  amount: number;
  currency: string;
  description: string;
  reference: string;
  status: 'pending' | 'completed' | 'failed' | 'reversed';
  createdAt: string;
}

export interface Payout {
  id: string;
  riderId: string;
  amount: number;
  currency: string;
  method: 'mpesa' | 'bank_transfer';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  reference?: string;
  processedAt?: string;
  createdAt: string;
}

export interface Escrow {
  id: string;
  campaignId: string;
  amount: number;
  status: 'held' | 'partially_released' | 'released' | 'refunded';
  heldAt: string;
  releasedAt?: string;
}

export interface LedgerQuery {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  userId?: string;
}

export interface PayoutBatch {
  id: string;
  itemCount: number;
  totalAmount: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'processing' | 'completed';
  createdAt: string;
}

export interface CompletePayoutData {
  reference: string;
  method: string;
  processedAt?: string;
}

export function createFinanceEndpoints(client: ApiClient) {
  return {
    // Self-service
    getMyWallet(): Promise<ApiResponse<Wallet>> {
      return client.get('/finance/wallet');
    },

    getMyTransactions(query?: LedgerQuery): Promise<PaginatedResponse<Transaction>> {
      return client.get('/finance/transactions', { params: query as Record<string, string | number | boolean | undefined> });
    },

    getMyPayouts(): Promise<ApiResponse<Payout[]>> {
      return client.get('/finance/payouts');
    },

    // Admin
    queryLedger(query?: LedgerQuery): Promise<PaginatedResponse<Transaction>> {
      return client.get('/admin/finance/ledger', { params: query as Record<string, string | number | boolean | undefined> });
    },

    listEscrows(): Promise<ApiResponse<Escrow[]>> {
      return client.get('/admin/finance/escrows');
    },

    generatePayoutBatch(): Promise<ApiResponse<PayoutBatch>> {
      return client.post('/admin/finance/payouts/batch');
    },

    approveBatch(id: string): Promise<ApiResponse<PayoutBatch>> {
      return client.post(`/admin/finance/payouts/batch/${id}/approve`);
    },

    completePayoutItem(id: string, data: CompletePayoutData): Promise<ApiResponse<Payout>> {
      return client.post(`/admin/finance/payouts/${id}/complete`, data);
    },
  };
}
