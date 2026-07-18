// Admin-specific type extensions

export type StaffRole = 'ops' | 'finance' | 'admin' | 'super_admin';

export interface StaffUser {
  id: string;
  email: string;
  name: string;
  role: StaffRole;
  avatar?: string;
  lastLogin: string;
}

export interface KPIMetric {
  label: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface ApprovalItem {
  id: string;
  type: 'rider' | 'business' | 'document' | 'verification';
  entityName: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface Rider {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'pending' | 'active' | 'suspended' | 'deactivated';
  zone: string;
  score: number;
  joinedAt: string;
  totalEarnings: number;
  activeCampaigns: number;
}

export interface Business {
  id: string;
  name: string;
  contactEmail: string;
  contactPhone: string;
  status: 'pending' | 'active' | 'suspended';
  industry: string;
  totalCampaigns: number;
  totalSpend: number;
  joinedAt: string;
}

export interface Campaign {
  id: string;
  businessId: string;
  businessName: string;
  name: string;
  status: 'draft' | 'pending' | 'active' | 'paused' | 'completed' | 'cancelled';
  budget: number;
  startDate: string;
  endDate: string;
  ridersAssigned: number;
  ridersRequired: number;
  zones: string[];
}

export interface Assignment {
  id: string;
  campaignId: string;
  riderId: string;
  riderName: string;
  campaignName: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  assignedAt: string;
  stickerAppliedAt?: string;
}

export interface StickerInventory {
  id: string;
  campaignId: string;
  campaignName: string;
  totalOrdered: number;
  totalPrinted: number;
  totalDistributed: number;
  totalApplied: number;
}

export interface Payment {
  id: string;
  businessId: string;
  businessName: string;
  amount: number;
  status: 'pending' | 'verified' | 'rejected';
  method: string;
  reference: string;
  submittedAt: string;
  proofUrl?: string;
}

export interface Payout {
  id: string;
  batchId: string;
  riderId: string;
  riderName: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  period: string;
}

export interface PayoutBatch {
  id: string;
  period: string;
  totalAmount: number;
  riderCount: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'processing' | 'completed';
  createdAt: string;
  approvedBy?: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdBy: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  actor: string;
  actorRole: StaffRole;
  target: string;
  targetType: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

export interface Zone {
  id: string;
  name: string;
  city: string;
  activeRiders: number;
  activeCampaigns: number;
  boundaries: unknown;
}

export interface SystemHealth {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  lastCheck: string;
  responseTime: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TableFilters {
  search?: string;
  status?: string;
  zone?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}
