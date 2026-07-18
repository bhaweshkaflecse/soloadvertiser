/**
 * Event system interfaces and base types.
 * Implementation (Redis Pub/Sub, RabbitMQ, etc.) will be added in a future sprint.
 */

export interface EventMetadata {
  eventId: string;
  timestamp: string;
  source: string;
  version: number;
  correlationId?: string;
  userId?: string;
}

export interface DomainEvent<T = unknown> {
  metadata: EventMetadata;
  name: string;
  data: T;
}

export interface EventBus {
  publish<T>(event: DomainEvent<T>): Promise<void>;
  subscribe<T>(eventName: string, handler: (event: DomainEvent<T>) => Promise<void>): void;
  unsubscribe(eventName: string): void;
}

/**
 * Event name constants — to be populated as features are added.
 */
export const EVENT_NAMES = {
  USER: {
    REGISTERED: 'user.registered',
    VERIFIED: 'user.verified',
    DEACTIVATED: 'user.deactivated',
  },
  CAMPAIGN: {
    CREATED: 'campaign.created',
    ACTIVATED: 'campaign.activated',
    COMPLETED: 'campaign.completed',
  },
  RIDE: {
    STARTED: 'ride.started',
    COMPLETED: 'ride.completed',
    VERIFIED: 'ride.verified',
  },
} as const;
