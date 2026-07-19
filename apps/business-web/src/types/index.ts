// Solo Advertiser — Business Portal
// Shared TypeScript types for the business portal

// ─── Auth ───────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'business_owner' | 'business_admin';
  companyId: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// ─── Company ────────────────────────────────────────────────────────────────

export interface Company {
  id: string;
  name: string;
  registrationNumber: string;
  industry: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contactPhone: string;
  contactEmail: string;
  logoUrl?: string;
  status: 'pending' | 'active' | 'suspended';
  onboardingCompleted: boolean;
  createdAt: string;
}

// ─── Campaigns ──────────────────────────────────────────────────────────────

export type CampaignStatus = 'draft' | 'pending_payment' | 'active' | 'paused' | 'completed' | 'cancelled';

export interface Campaign {
  id: string;
  companyId: string;
  name: string;
  description: string;
  status: CampaignStatus;
  wrapType: 'full' | 'partial' | 'rear';
  targetRiders: number;
  assignedRiders: number;
  dailyRatePerRider: number;
  durationDays: number;
  totalBudget: number;
  amountPaid: number;
  zoneIds: string[];
  creativeUrl?: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface CampaignFormData {
  name: string;
  description: string;
  wrapType: 'full' | 'partial' | 'rear';
  targetRiders: number;
  durationDays: number;
  dailyRatePerRider: number;
  zoneIds: string[];
  creativeFile?: File;
}

// ─── Billing ────────────────────────────────────────────────────────────────

export type PaymentStatus = 'pending' | 'submitted' | 'verified' | 'rejected';

export interface Invoice {
  id: string;
  campaignId: string;
  campaignName: string;
  amount: number;
  status: PaymentStatus;
  dueDate: string;
  paidDate?: string;
  reference?: string;
  proofUrl?: string;
  createdAt: string;
}

export interface PaymentSubmission {
  invoiceId: string;
  method: 'bank_transfer' | 'upi' | 'cheque';
  amount: number;
  reference: string;
  paidDate: string;
  proofFile: File;
}

// ─── Support ────────────────────────────────────────────────────────────────

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

export interface TicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'business' | 'support';
  content: string;
  attachmentUrl?: string;
  createdAt: string;
}

// ─── Navigation ─────────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  path: string;
  icon: string;
  badge?: string;
}

// ─── Dashboard ──────────────────────────────────────────────────────────────

export interface DashboardKPI {
  activeCampaigns: number;
  totalSpend: number;
  averageFulfillment: number;
  totalRiders: number;
}
