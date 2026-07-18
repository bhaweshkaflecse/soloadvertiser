export { ERROR_CODES } from './error-codes';

/**
 * Base event payload structure.
 */
export interface EventPayload<T = unknown> {
  eventId: string;
  eventName: string;
  version: number;
  timestamp: string;
  source: string;
  correlationId?: string;
  data: T;
}

/**
 * Domain error structure with typed error codes.
 */
export interface DomainError {
  code: string;
  message: string;
  domain: string;
  httpStatus: number;
  details?: Record<string, unknown>;
}
