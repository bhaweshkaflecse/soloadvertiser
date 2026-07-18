/**
 * Rider profile & management endpoints
 */

import { ApiClient } from '../client';
import { ApiResponse, PaginatedResponse } from '../types';

export interface RiderProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatar?: string;
  vehicleType: string;
  vehiclePlate: string;
  zone?: string;
  status: 'pending' | 'approved' | 'active' | 'suspended' | 'rejected';
  available: boolean;
  rating: number;
  totalRides: number;
  documentsVerified: boolean;
  createdAt: string;
}

export interface RiderDocument {
  id: string;
  type: 'license' | 'insurance' | 'vehicle_registration' | 'identity' | 'selfie';
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  uploadedAt: string;
}

export interface RiderDashboard {
  earnings: { today: number; week: number; month: number };
  rides: { active: number; completed: number; pending: number };
  rating: number;
  nextPayout: { amount: number; date: string } | null;
  activeCampaigns: number;
}

export interface SubmitDocumentData {
  type: RiderDocument['type'];
  fileUrl: string;
  metadata?: Record<string, string>;
}

export interface ListRidersQuery {
  page?: number;
  limit?: number;
  status?: string;
  zone?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function createRiderEndpoints(client: ApiClient) {
  return {
    // Rider self-service
    getMyProfile(): Promise<ApiResponse<RiderProfile>> {
      return client.get('/riders/me');
    },

    updateProfile(data: Partial<RiderProfile>): Promise<ApiResponse<RiderProfile>> {
      return client.patch('/riders/me', data);
    },

    submitDocument(data: SubmitDocumentData): Promise<ApiResponse<RiderDocument>> {
      return client.post('/riders/me/documents', data);
    },

    getDocuments(): Promise<ApiResponse<RiderDocument[]>> {
      return client.get('/riders/me/documents');
    },

    setZone(zoneId: string): Promise<ApiResponse<RiderProfile>> {
      return client.patch('/riders/me/zone', { zoneId });
    },

    toggleAvailability(available: boolean): Promise<ApiResponse<{ available: boolean }>> {
      return client.patch('/riders/me/availability', { available });
    },

    getDashboard(): Promise<ApiResponse<RiderDashboard>> {
      return client.get('/riders/me/dashboard');
    },

    // Admin
    listRiders(query?: ListRidersQuery): Promise<PaginatedResponse<RiderProfile>> {
      return client.get('/admin/riders', { params: query as Record<string, string | number | boolean | undefined> });
    },

    getRider(id: string): Promise<ApiResponse<RiderProfile>> {
      return client.get(`/admin/riders/${id}`);
    },

    approveRider(id: string): Promise<ApiResponse<RiderProfile>> {
      return client.post(`/admin/riders/${id}/approve`);
    },

    rejectRider(id: string, reason: string): Promise<ApiResponse<RiderProfile>> {
      return client.post(`/admin/riders/${id}/reject`, { reason });
    },

    suspendRider(id: string, reason: string): Promise<ApiResponse<RiderProfile>> {
      return client.post(`/admin/riders/${id}/suspend`, { reason });
    },
  };
}
