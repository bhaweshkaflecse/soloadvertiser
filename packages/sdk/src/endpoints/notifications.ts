/**
 * Notification endpoints
 */

import { ApiClient } from '../client';
import { ApiResponse, PaginatedResponse } from '../types';

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'action_required';
  channel: 'in_app' | 'push' | 'email' | 'sms';
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read: boolean;
  readAt?: string;
  createdAt: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
  categories: Record<string, boolean>;
}

export interface ListNotificationsQuery {
  page?: number;
  limit?: number;
  read?: boolean;
  type?: string;
}

export function createNotificationEndpoints(client: ApiClient) {
  return {
    getMyNotifications(query?: ListNotificationsQuery): Promise<PaginatedResponse<Notification>> {
      return client.get('/notifications', { params: query as Record<string, string | number | boolean | undefined> });
    },

    markAsRead(id: string): Promise<ApiResponse<Notification>> {
      return client.patch(`/notifications/${id}/read`);
    },

    markAllAsRead(): Promise<ApiResponse<void>> {
      return client.post('/notifications/read-all');
    },

    getPreferences(): Promise<ApiResponse<NotificationPreferences>> {
      return client.get('/notifications/preferences');
    },

    updatePreferences(prefs: Partial<NotificationPreferences>): Promise<ApiResponse<NotificationPreferences>> {
      return client.patch('/notifications/preferences', prefs);
    },

    getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
      return client.get('/notifications/unread-count');
    },

    // Admin
    sendBulk(data: { userIds: string[]; title: string; body: string; type: string }): Promise<ApiResponse<{ sent: number }>> {
      return client.post('/admin/notifications/bulk', data);
    },
  };
}
