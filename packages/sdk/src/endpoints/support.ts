/**
 * Support & ticket endpoints
 */

import { ApiClient } from '../client';
import { ApiResponse, PaginatedResponse } from '../types';

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  category: 'account' | 'payment' | 'campaign' | 'technical' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed';
  assignedTo?: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderRole: 'user' | 'admin';
  content: string;
  attachments: string[];
  createdAt: string;
}

export interface CreateTicketData {
  subject: string;
  description: string;
  category: SupportTicket['category'];
  priority?: SupportTicket['priority'];
  attachments?: string[];
}

export interface ListTicketsQuery {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  priority?: string;
  assignedTo?: string;
}

export function createSupportEndpoints(client: ApiClient) {
  return {
    // User
    createTicket(data: CreateTicketData): Promise<ApiResponse<SupportTicket>> {
      return client.post('/support/tickets', data);
    },

    getMyTickets(query?: ListTicketsQuery): Promise<PaginatedResponse<SupportTicket>> {
      return client.get('/support/tickets/mine', { params: query as Record<string, string | number | boolean | undefined> });
    },

    getTicket(id: string): Promise<ApiResponse<SupportTicket>> {
      return client.get(`/support/tickets/${id}`);
    },

    getTicketMessages(id: string): Promise<ApiResponse<TicketMessage[]>> {
      return client.get(`/support/tickets/${id}/messages`);
    },

    replyToTicket(id: string, content: string, attachments?: string[]): Promise<ApiResponse<TicketMessage>> {
      return client.post(`/support/tickets/${id}/messages`, { content, attachments });
    },

    // Admin
    listTickets(query?: ListTicketsQuery): Promise<PaginatedResponse<SupportTicket>> {
      return client.get('/admin/support/tickets', { params: query as Record<string, string | number | boolean | undefined> });
    },

    assignTicket(id: string, adminId: string): Promise<ApiResponse<SupportTicket>> {
      return client.patch(`/admin/support/tickets/${id}/assign`, { adminId });
    },

    updateTicketStatus(id: string, status: SupportTicket['status']): Promise<ApiResponse<SupportTicket>> {
      return client.patch(`/admin/support/tickets/${id}/status`, { status });
    },
  };
}
