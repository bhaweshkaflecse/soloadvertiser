/**
 * Entity types that can have timelines.
 */
export enum TimelineEntityType {
  RIDER = 'rider',
  BUSINESS = 'business',
  CAMPAIGN = 'campaign',
  ASSIGNMENT = 'assignment',
}

/**
 * Event-to-timeline title mapping configuration.
 */
export interface TimelineEventMapping {
  eventName: string;
  getEntries: (payload: Record<string, unknown>) => TimelineEntryInput[];
}

/**
 * Input for creating a timeline entry.
 */
export interface TimelineEntryInput {
  entityType: TimelineEntityType;
  entityId: string;
  eventType: string;
  title: string;
  description?: string;
  actorId?: string;
  actorRole?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Query parameters for timeline retrieval.
 */
export interface TimelineQuery {
  entityType: string;
  entityId: string;
  limit?: number;
  cursor?: string; // cursor-based pagination (createdAt)
}
