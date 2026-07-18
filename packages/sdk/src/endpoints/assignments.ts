/**
 * Campaign assignment & ride tracking endpoints
 */

import { ApiClient } from '../client';
import { ApiResponse, PaginatedResponse } from '../types';

export interface Assignment {
  id: string;
  campaignId: string;
  riderId: string;
  status: 'offered' | 'accepted' | 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  totalRides: number;
  completedRides: number;
  earnings: number;
  createdAt: string;
}

export interface Ride {
  id: string;
  assignmentId: string;
  riderId: string;
  startTime: string;
  endTime?: string;
  distanceKm: number;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationMethod: 'gps' | 'photo' | 'qr' | 'auto';
  impressions: number;
  route?: { lat: number; lng: number }[];
}

export interface ListAssignmentsQuery {
  page?: number;
  limit?: number;
  status?: string;
  campaignId?: string;
  riderId?: string;
}

export function createAssignmentEndpoints(client: ApiClient) {
  return {
    // Rider
    getMyAssignments(query?: ListAssignmentsQuery): Promise<PaginatedResponse<Assignment>> {
      return client.get('/assignments/mine', { params: query as Record<string, string | number | boolean | undefined> });
    },

    acceptAssignment(id: string): Promise<ApiResponse<Assignment>> {
      return client.post(`/assignments/${id}/accept`);
    },

    declineAssignment(id: string): Promise<ApiResponse<Assignment>> {
      return client.post(`/assignments/${id}/decline`);
    },

    startRide(assignmentId: string): Promise<ApiResponse<Ride>> {
      return client.post(`/assignments/${assignmentId}/rides/start`);
    },

    endRide(assignmentId: string, rideId: string): Promise<ApiResponse<Ride>> {
      return client.post(`/assignments/${assignmentId}/rides/${rideId}/end`);
    },

    // Admin
    listAssignments(query?: ListAssignmentsQuery): Promise<PaginatedResponse<Assignment>> {
      return client.get('/admin/assignments', { params: query as Record<string, string | number | boolean | undefined> });
    },

    createAssignment(campaignId: string, riderId: string): Promise<ApiResponse<Assignment>> {
      return client.post('/admin/assignments', { campaignId, riderId });
    },

    cancelAssignment(id: string, reason: string): Promise<ApiResponse<Assignment>> {
      return client.post(`/admin/assignments/${id}/cancel`, { reason });
    },
  };
}
