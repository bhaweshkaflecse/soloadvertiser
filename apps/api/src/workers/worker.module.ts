import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ALL_QUEUES, QUEUES } from './queues';
import { VerificationProcessor } from './processors/verification.processor';
import { NotificationProcessor } from './processors/notification.processor';
import { ReminderProcessor } from './processors/reminder.processor';
import { FinanceProcessor } from './processors/finance.processor';
import { ReportProcessor } from './processors/report.processor';
import { CleanupProcessor } from './processors/cleanup.processor';

/**
 * Worker module — registers BullMQ queues and processors.
 *
 * Queues:
 * 1. VERIFICATION — Verification reminders and overdue flagging
 * 2. NOTIFICATION — Async email/push/SMS delivery
 * 3. REMINDER — Document expiry reminders (30/15/7 days)
 * 4. FINANCE — Daily escrow release, payout batch generation
 * 5. REPORT — Daily metrics aggregation
 * 6. CLEANUP — Expired OTP, orphaned files, session cleanup
 */
@Module({
  imports: [
    // Register BullMQ with Redis connection
    BullModule.forRoot({
      connection: {
        host: process.env.BULL_REDIS_HOST || 'localhost',
        port: Number(process.env.BULL_REDIS_PORT) || 6379,
      },
      defaultJobOptions: {
        removeOnComplete: 100, // Keep last 100 completed jobs
        removeOnFail: 500, // Keep last 500 failed jobs for debugging
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    }),

    // Register individual queues
    BullModule.registerQueue(
      { name: QUEUES.VERIFICATION },
      { name: QUEUES.NOTIFICATION },
      { name: QUEUES.REMINDER },
      { name: QUEUES.FINANCE },
      { name: QUEUES.REPORT },
      { name: QUEUES.CLEANUP },
    ),
  ],
  providers: [
    VerificationProcessor,
    NotificationProcessor,
    ReminderProcessor,
    FinanceProcessor,
    ReportProcessor,
    CleanupProcessor,
  ],
  exports: [BullModule],
})
export class WorkerModule {}
