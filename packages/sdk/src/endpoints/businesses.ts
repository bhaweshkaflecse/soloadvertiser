/**
 * Business profile & management endpoints
 */

import { ApiClient } from '../client';
import { ApiResponse, PaginatedResponse } from '../types';

export interface BusinessProfile {
  id: string;
  userId: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  logo?: string;
  industry: string;
  website?: string;
  address: string;
  status: 'pending' | 'active' | 'suspended';
  verified: boolean;
  totalCampaigns: number;
  totalSpend: number;
  createdAt: string;
}

export interface ListBusinessesQuery {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  industry?: string;
}

export function createBusinessEndpoints(client: ApiClient) {
  return {
    getMyBusiness(): Promise<ApiResponse<BusinessProfile>> {
      return client.get('/businesses/me');
    },

    updateBusiness(data: Partial<BusinessProfile>): Promise<ApiResponse<BusinessProfile>> {
      return client.patch('/businesses/me', data);
    },

    // Admin
    listBusinesses(query?: ListBusinessesQuery): Promise<PaginatedResponse<BusinessProfile>> {
      return client.get('/admin/businesses', { params: query as Record<string, string | number | boolean | undefined> });
    },

    getBusiness(id: string): Promise<ApiResponse<BusinessProfile>> {
      return client.get(`/admin/businesses/${id}`);
    },

    suspendBusiness(id: string, reason: string): Promise<ApiResponse<BusinessProfile>> {
      return client.post(`/admin/businesses/${id}/suspend`, { reason });
    },

    activateBusiness(id: string): Promise<ApiResponse<BusinessProfile>> {
      return client.post(`/admin/businesses/${id}/activate`);
    },
  };
}
