import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUES } from '../workers/queues';

/**
 * Cron service — schedules background jobs using NestJS @Cron() decorators.
 *
 * All times are in NPT (Nepal Standard Time, UTC+5:45).
 * Cron expressions use standard format: second minute hour dayOfMonth month dayOfWeek
 *
 * Schedule:
 * - Daily 00:00 NPT: Escrow daily release
 * - Daily 01:00 NPT: Metrics aggregation
 * - Daily 06:00 NPT: Verification overdue check
 * - Daily 07:00 NPT: Document expiry reminders
 * - Every 15 days: Payout batch generation
 * - Daily 03:00 NPT: Expired OTP cleanup
 * - Daily 04:00 NPT: Orphaned file detection
 * - Weekly Sunday: Session cleanup
 */
@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    @InjectQueue(QUEUES.FINANCE) private readonly financeQueue: Queue,
    @InjectQueue(QUEUES.REPORT) private readonly reportQueue: Queue,
    @InjectQueue(QUEUES.VERIFICATION) private readonly verificationQueue: Queue,
    @InjectQueue(QUEUES.REMINDER) private readonly reminderQueue: Queue,
    @InjectQueue(QUEUES.CLEANUP) private readonly cleanupQueue: Queue,
  ) {}

  /**
   * Daily 00:00 NPT (18:15 UTC previous day): Escrow daily release
   * Process all escrow payments due for release today.
   */
  @Cron('0 15 18 * * *', { name: 'escrow-daily-release', timeZone: 'Asia/Kathmandu' })
  async handleEscrowDailyRelease(): Promise<void> {
    this.logger.log('[CRON] Triggering daily escrow release...');
    await this.financeQueue.add('daily-escrow-release', {
      date: new Date().toISOString().split('T')[0],
    });
  }

  /**
   * Daily 01:00 NPT (19:15 UTC previous day): Metrics aggregation
   * Aggregate daily platform metrics for admin dashboard and reporting.
   */
  @Cron('0 15 19 * * *', { name: 'metrics-aggregation', timeZone: 'Asia/Kathmandu' })
  async handleMetricsAggregation(): Promise<void> {
    this.logger.log('[CRON] Triggering daily metrics aggregation...');
    // Aggregate yesterday's metrics
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    await this.reportQueue.add('daily-metrics', {
      date: yesterday.toISOString().split('T')[0],
    });
  }

  /**
   * Daily 06:00 NPT (00:15 UTC): Verification overdue check
   * Flag verifications that have exceeded the SLA window.
   */
  @Cron('0 15 0 * * *', { name: 'verification-overdue-check', timeZone: 'Asia/Kathmandu' })
  async handleVerificationOverdueCheck(): Promise<void> {
    this.logger.log('[CRON] Triggering verification overdue check...');
    await this.verificationQueue.add('check-pending', {});
  }

  /**
   * Daily 07:00 NPT (01:15 UTC): Document expiry reminders
   * Scan documents expiring in 30/15/7 days and send reminders.
   */
  @Cron('0 15 1 * * *', { name: 'document-expiry-reminders', timeZone: 'Asia/Kathmandu' })
  async handleDocumentExpiryReminders(): Promise<void> {
    this.logger.log('[CRON] Triggering document expiry reminder scan...');
    await this.reminderQueue.add('check-upcoming-expiries', {});
  }

  /**
   * Every 15 days (1st and 16th of each month) at 10:00 NPT: Payout batch generation
   * Generate payout batches for all eligible riders.
   */
  @Cron('0 15 4 1,16 * *', { name: 'payout-batch-generation', timeZone: 'Asia/Kathmandu' })
  async handlePayoutBatchGeneration(): Promise<void> {
    this.logger.log('[CRON] Triggering payout batch generation...');
    await this.financeQueue.add('payout-batch', {
      date: new Date().toISOString().split('T')[0],
    });
  }

  /**
   * Daily 03:00 NPT (21:15 UTC previous day): Expired OTP cleanup
   * Remove all OTP entries past their expiry window.
   */
  @Cron('0 15 21 * * *', { name: 'expired-otp-cleanup', timeZone: 'Asia/Kathmandu' })
  async handleExpiredOtpCleanup(): Promise<void> {
    this.logger.log('[CRON] Triggering expired OTP cleanup...');
    await this.cleanupQueue.add('expired-otp', {});
  }

  /**
   * Daily 04:00 NPT (22:15 UTC previous day): Orphaned file detection
   * Detect files in storage that are not referenced by any database record.
   */
  @Cron('0 15 22 * * *', { name: 'orphaned-file-detection', timeZone: 'Asia/Kathmandu' })
  async handleOrphanedFileDetection(): Promise<void> {
    this.logger.log('[CRON] Triggering orphaned file detection...');
    await this.cleanupQueue.add('orphaned-files', {});
  }

  /**
   * Weekly Sunday at 02:00 NPT (Saturday 20:15 UTC): Session cleanup
   * Remove expired sessions and revoked refresh tokens.
   */
  @Cron('0 15 20 * * 6', { name: 'session-cleanup', timeZone: 'Asia/Kathmandu' })
  async handleSessionCleanup(): Promise<void> {
    this.logger.log('[CRON] Triggering weekly session cleanup...');
    await this.cleanupQueue.add('session-cleanup', {});
  }
}
