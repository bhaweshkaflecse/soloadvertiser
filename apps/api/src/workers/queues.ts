/**
 * BullMQ queue name constants.
 * Each queue handles a specific category of background work.
 */
export const QUEUES = {
  /** Verification reminder processing and overdue flagging */
  VERIFICATION: 'verification',

  /** Async notification delivery (email + push) */
  NOTIFICATION: 'notification',

  /** Document expiry reminders (30/15/7 days before) */
  REMINDER: 'reminder',

  /** Daily escrow release and payout batch generation */
  FINANCE: 'finance',

  /** Daily metrics aggregation and reporting */
  REPORT: 'report',

  /** Expired OTP cleanup, orphaned files, session cleanup */
  CLEANUP: 'cleanup',
} as const;

export type QueueName = (typeof QUEUES)[keyof typeof QUEUES];

export const ALL_QUEUES: QueueName[] = Object.values(QUEUES);
