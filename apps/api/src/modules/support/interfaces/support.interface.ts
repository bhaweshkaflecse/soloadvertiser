/**
 * Support ticket status lifecycle:
 * OPEN → IN_PROGRESS → AWAITING_RESPONSE → RESOLVED → CLOSED
 */
export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  AWAITING_RESPONSE = 'AWAITING_RESPONSE',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

/**
 * Support ticket categories.
 */
export enum TicketCategory {
  ACCOUNT = 'account',
  CAMPAIGN = 'campaign',
  PAYMENT = 'payment',
  ASSIGNMENT = 'assignment',
  VERIFICATION = 'verification',
  TECHNICAL = 'technical',
  GENERAL = 'general',
}

/**
 * Ticket priority levels.
 */
export enum TicketPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

/**
 * Valid status transitions for support tickets.
 */
export const VALID_STATUS_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  [TicketStatus.OPEN]: [TicketStatus.IN_PROGRESS, TicketStatus.CLOSED],
  [TicketStatus.IN_PROGRESS]: [
    TicketStatus.AWAITING_RESPONSE,
    TicketStatus.RESOLVED,
    TicketStatus.CLOSED,
  ],
  [TicketStatus.AWAITING_RESPONSE]: [
    TicketStatus.IN_PROGRESS,
    TicketStatus.RESOLVED,
    TicketStatus.CLOSED,
  ],
  [TicketStatus.RESOLVED]: [TicketStatus.CLOSED, TicketStatus.IN_PROGRESS],
  [TicketStatus.CLOSED]: [],
};
