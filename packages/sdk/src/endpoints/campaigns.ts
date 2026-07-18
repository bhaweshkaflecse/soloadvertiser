/**
 * Campaign management endpoints
 */

import { ApiClient } from '../client';
import { ApiResponse, PaginatedResponse } from '../types';

export interface Campaign {
  id: string;
  businessId: string;
  title: string;
  description: string;
  type: 'wrap' | 'decal' | 'digital_display';
  status: 'draft' | 'pending_payment' | 'paid' | 'active' | 'paused' | 'completed' | 'cancelled';
  budget: number;
  dailyBudget: number;
  currency: string;
  startDate: string;
  endDate: string;
  zones: string[];
  vehicleTypes: string[];
  ridersRequired: number;
  ridersAssigned: number;
  impressionsTarget: number;
  impressionsDelivered: number;
  mediaAssets: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignData {
  title: string;
  description: string;
  type: Campaign['type'];
  budget: number;
  dailyBudget: number;
  startDate: string;
  endDate: string;
  zones: string[];
  vehicleTypes: string[];
  ridersRequired: number;
  mediaAssets?: string[];
}

export interface CampaignPayment {
  campaignId: string;
  amount: number;
  method: 'bank_transfer' | 'card' | 'mpesa';
  reference: string;
  receipt?: string;
}

export interface ListCampaignsQuery {
  page?: number;
  limit?: number;
  status?: string;
  businessId?: string;
  zone?: string;
  type?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function createCampaignEndpoints(client: ApiClient) {
  return {
    // Business self-service
    createCampaign(data: CreateCampaignData): Promise<ApiResponse<Campaign>> {
      return client.post('/campaigns', data);
    },

    getMyCampaigns(query?: ListCampaignsQuery): Promise<PaginatedResponse<Campaign>> {
      return client.get('/campaigns/mine', { params: query as Record<string, string | number | boolean | undefined> });
    },

    getCampaign(id: string): Promise<ApiResponse<Campaign>> {
      return client.get(`/campaigns/${id}`);
    },

    confirmCampaign(id: string): Promise<ApiResponse<Campaign>> {
      return client.post(`/campaigns/${id}/confirm`);
    },

    submitPayment(id: string, data: CampaignPayment): Promise<ApiResponse<Campaign>> {
      return client.post(`/campaigns/${id}/payment`, data);
    },

    cancelCampaign(id: string): Promise<ApiResponse<Campaign>> {
      return client.post(`/campaigns/${id}/cancel`);
    },

    // Admin
    listCampaigns(query?: ListCampaignsQuery): Promise<PaginatedResponse<Campaign>> {
      return client.get('/admin/campaigns', { params: query as Record<string, string | number | boolean | undefined> });
    },

    verifyPayment(id: string): Promise<ApiResponse<Campaign>> {
      return client.post(`/admin/campaigns/${id}/verify-payment`);
    },

    rejectPayment(id: string, reason: string): Promise<ApiResponse<Campaign>> {
      return client.post(`/admin/campaigns/${id}/reject-payment`, { reason });
    },

    pauseCampaign(id: string): Promise<ApiResponse<Campaign>> {
      return client.post(`/admin/campaigns/${id}/pause`);
    },

    resumeCampaign(id: string): Promise<ApiResponse<Campaign>> {
      return client.post(`/admin/campaigns/${id}/resume`);
    },
  };
}
