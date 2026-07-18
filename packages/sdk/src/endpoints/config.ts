/**
 * Platform configuration endpoints
 */

import { ApiClient } from '../client';
import { ApiResponse } from '../types';

export interface PlatformConfig {
  zones: Zone[];
  vehicleTypes: VehicleType[];
  campaignTypes: CampaignType[];
  paymentMethods: PaymentMethod[];
  commissionRate: number;
  minimumPayout: number;
  currencies: string[];
  supportedLocales: string[];
}

export interface Zone {
  id: string;
  name: string;
  city: string;
  country: string;
  active: boolean;
  bounds?: { lat: number; lng: number }[];
}

export interface VehicleType {
  id: string;
  name: string;
  category: 'motorcycle' | 'car' | 'van' | 'bicycle';
  adFormats: string[];
}

export interface CampaignType {
  id: string;
  name: string;
  description: string;
  minBudget: number;
  maxDuration: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'bank_transfer' | 'card' | 'mpesa' | 'wallet';
  enabled: boolean;
}

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description: string;
  updatedAt: string;
}

export function createConfigEndpoints(client: ApiClient) {
  return {
    getPlatformConfig(): Promise<ApiResponse<PlatformConfig>> {
      return client.get('/config');
    },

    getZones(): Promise<ApiResponse<Zone[]>> {
      return client.get('/config/zones');
    },

    getVehicleTypes(): Promise<ApiResponse<VehicleType[]>> {
      return client.get('/config/vehicle-types');
    },

    getFeatureFlags(): Promise<ApiResponse<FeatureFlag[]>> {
      return client.get('/config/features');
    },

    // Admin
    updateZone(id: string, data: Partial<Zone>): Promise<ApiResponse<Zone>> {
      return client.patch(`/admin/config/zones/${id}`, data);
    },

    createZone(data: Omit<Zone, 'id'>): Promise<ApiResponse<Zone>> {
      return client.post('/admin/config/zones', data);
    },

    toggleFeatureFlag(key: string, enabled: boolean): Promise<ApiResponse<FeatureFlag>> {
      return client.patch(`/admin/config/features/${key}`, { enabled });
    },

    updateCommission(rate: number): Promise<ApiResponse<{ commissionRate: number }>> {
      return client.patch('/admin/config/commission', { rate });
    },
  };
}
