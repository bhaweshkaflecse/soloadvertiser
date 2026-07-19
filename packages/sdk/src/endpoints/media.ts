/**
 * Media & file upload endpoints
 */

import { ApiClient } from '../client';
import { ApiResponse } from '../types';

export interface MediaAsset {
  id: string;
  userId: string;
  type: 'image' | 'video' | 'document' | 'design';
  mimeType: string;
  filename: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  width?: number;
  height?: number;
  metadata?: Record<string, string>;
  createdAt: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  assetId: string;
  expiresAt: string;
  fields?: Record<string, string>;
}

export interface UploadCompleteData {
  assetId: string;
  filename: string;
  mimeType: string;
  size: number;
}

export function createMediaEndpoints(client: ApiClient) {
  return {
    getUploadUrl(data: { filename: string; mimeType: string; type: MediaAsset['type'] }): Promise<ApiResponse<UploadUrlResponse>> {
      return client.post('/media/upload-url', data);
    },

    confirmUpload(data: UploadCompleteData): Promise<ApiResponse<MediaAsset>> {
      return client.post('/media/confirm', data);
    },

    getMyAssets(type?: string): Promise<ApiResponse<MediaAsset[]>> {
      return client.get('/media/mine', { params: type ? { type } : undefined });
    },

    getAsset(id: string): Promise<ApiResponse<MediaAsset>> {
      return client.get(`/media/${id}`);
    },

    deleteAsset(id: string): Promise<ApiResponse<void>> {
      return client.delete(`/media/${id}`);
    },

    // Admin
    listAllAssets(query?: { page?: number; limit?: number; userId?: string; type?: string }): Promise<ApiResponse<MediaAsset[]>> {
      return client.get('/admin/media', { params: query as Record<string, string | number | boolean | undefined> });
    },

    moderateAsset(id: string, action: 'approve' | 'reject', reason?: string): Promise<ApiResponse<MediaAsset>> {
      return client.post(`/admin/media/${id}/moderate`, { action, reason });
    },
  };
}
