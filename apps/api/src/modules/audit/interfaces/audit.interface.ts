/**
 * Audit entry structure — immutable record of system actions.
 * Every state-changing operation in the platform produces an audit entry.
 */
export interface AuditEntry {
  id: string;
  actorId: string | null;
  actorRole: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  beforeState: Record<string, any> | null;
  afterState: Record<string, any> | null;
  reason: string | null;
  ipAddress: string | null;
  deviceInfo: string | null;
  metadata: Record<string, any> | null;
  createdAt: Date;
}

/**
 * Input for creating an audit entry.
 */
export interface CreateAuditEntryInput {
  actorId?: string;
  actorRole?: string;
  action: string;
  entityType: string;
  entityId?: string;
  beforeState?: Record<string, any>;
  afterState?: Record<string, any>;
  reason?: string;
  ipAddress?: string;
  deviceInfo?: string;
  metadata?: Record<string, any>;
}

/**
 * Filters for querying audit entries.
 */
export interface AuditQueryFilters {
  actorId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}
