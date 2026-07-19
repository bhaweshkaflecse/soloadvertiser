/**
 * Marketplace & channel endpoints
 */

import { ApiClient } from '../client';
import { ApiResponse, PaginatedResponse } from '../types';

export interface Channel {
  id: string;
  name: string;
  slug: string;
  description: string;
  partnerId: string;
  category: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  pricing: { unitPrice: number; currency: string; billingModel: string };
  capacity: number;
  enrolled: number;
  geography: string[];
  createdAt: string;
}

export interface PreOrder {
  id: string;
  channelId: string;
  businessId: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'fulfilled' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface Enrollment {
  id: string;
  channelId: string;
  partnerId: string;
  status: 'pending' | 'active' | 'suspended' | 'terminated';
  capacity: number;
  createdAt: string;
}

export interface SubmitPreOrderData {
  channelId: string;
  quantity: number;
  notes?: string;
}

export interface SubmitEnrollmentData {
  channelId: string;
  capacity: number;
  serviceAreas: string[];
}

export interface CreateChannelData {
  name: string;
  description: string;
  category: string;
  pricing: { unitPrice: number; currency: string; billingModel: string };
  capacity: number;
  geography: string[];
}

export interface ReadinessScore {
  channelId: string;
  channelName: string;
  score: number;
  factors: { name: string; value: number; weight: number }[];
}

export function createMarketplaceEndpoints(client: ApiClient) {
  return {
    // Public
    listChannels(): Promise<ApiResponse<Channel[]>> {
      return client.get('/marketplace/channels');
    },

    getChannel(id: string): Promise<ApiResponse<Channel>> {
      return client.get(`/marketplace/channels/${id}`);
    },

    // Business
    submitPreOrder(data: SubmitPreOrderData): Promise<ApiResponse<PreOrder>> {
      return client.post('/marketplace/pre-orders', data);
    },

    getMyPreOrders(): Promise<ApiResponse<PreOrder[]>> {
      return client.get('/marketplace/pre-orders/mine');
    },

    cancelPreOrder(id: string): Promise<ApiResponse<PreOrder>> {
      return client.post(`/marketplace/pre-orders/${id}/cancel`);
    },

    // Partner
    submitEnrollment(data: SubmitEnrollmentData): Promise<ApiResponse<Enrollment>> {
      return client.post('/marketplace/enrollments', data);
    },

    getMyEnrollments(): Promise<ApiResponse<Enrollment[]>> {
      return client.get('/marketplace/enrollments/mine');
    },

    // Admin
    createChannel(data: CreateChannelData): Promise<ApiResponse<Channel>> {
      return client.post('/admin/marketplace/channels', data);
    },

    activateChannel(id: string): Promise<ApiResponse<Channel>> {
      return client.post(`/admin/marketplace/channels/${id}/activate`);
    },

    readinessScores(): Promise<ApiResponse<ReadinessScore[]>> {
      return client.get('/admin/marketplace/readiness');
    },
  };
}
