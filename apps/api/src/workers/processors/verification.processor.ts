import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUES } from '../queues';

/**
 * Verification queue processor.
 * Handles verification reminders and flags overdue verifications.
 */
@Processor(QUEUES.VERIFICATION)
export class VerificationProcessor extends WorkerHost {
  private readonly logger = new Logger(VerificationProcessor.name);

  async process(job: Job): Promise<void> {
    this.logger.log(`Processing verification job: ${job.name} (id=${job.id})`);

    switch (job.name) {
      case 'send-reminder':
        await this.handleSendReminder(job.data);
        break;

      case 'flag-overdue':
        await this.handleFlagOverdue(job.data);
        break;

      case 'check-pending':
        await this.handleCheckPending();
        break;

      default:
        this.logger.warn(`Unknown verification job: ${job.name}`);
    }
  }

  /**
   * Send a verification reminder to a user who has pending verification steps.
   */
  private async handleSendReminder(data: {
    userId: string;
    type: string;
    daysRemaining?: number;
  }): Promise<void> {
    this.logger.log(
      `Sending verification reminder to user=${data.userId}, type=${data.type}`,
    );

    // TODO: Integrate with NotificationService to send reminder
    // 1. Look up user's pending verification items
    // 2. Send push/email reminder
    // 3. Update last_reminded_at timestamp
  }

  /**
   * Flag a verification as overdue (past the allowed window).
   */
  private async handleFlagOverdue(data: {
    userId: string;
    verificationType: string;
  }): Promise<void> {
    this.logger.log(
      `Flagging overdue verification: user=${data.userId}, type=${data.verificationType}`,
    );

    // TODO: Update verification status to OVERDUE
    // 1. Update rider/business status
    // 2. Send notification about suspension risk
    // 3. Create audit log entry
  }

  /**
   * Check all pending verifications and flag overdue ones.
   * Called by cron daily.
   */
  private async handleCheckPending(): Promise<void> {
    this.logger.log('Checking all pending verifications for overdue status...');

    // TODO: Query all verifications pending > X days
    // 1. Get all users with PENDING_VERIFICATION status
    // 2. Check if submission date exceeds verification SLA
    // 3. Flag overdue and notify
  }
}
