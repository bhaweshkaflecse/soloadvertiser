import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUES } from '../queues';

/**
 * Reminder queue processor.
 * Handles document expiry reminders at 30/15/7 days before expiry.
 */
@Processor(QUEUES.REMINDER)
export class ReminderProcessor extends WorkerHost {
  private readonly logger = new Logger(ReminderProcessor.name);

  async process(job: Job): Promise<void> {
    this.logger.log(`Processing reminder job: ${job.name} (id=${job.id})`);

    switch (job.name) {
      case 'document-expiry':
        await this.handleDocumentExpiry(job.data);
        break;

      case 'check-upcoming-expiries':
        await this.handleCheckUpcomingExpiries();
        break;

      case 'campaign-ending':
        await this.handleCampaignEnding(job.data);
        break;

      default:
        this.logger.warn(`Unknown reminder job: ${job.name}`);
    }
  }

  /**
   * Send a document expiry reminder to a user.
   */
  private async handleDocumentExpiry(data: {
    userId: string;
    documentId: string;
    documentType: string;
    daysUntilExpiry: number;
  }): Promise<void> {
    this.logger.log(
      `Document expiry reminder: user=${data.userId}, doc=${data.documentType}, days=${data.daysUntilExpiry}`,
    );

    // TODO: Send notification via NotificationService
    // 1. Build notification with document details
    // 2. Send push + in-app notification
    // 3. If 7 days or less, also send SMS
  }

  /**
   * Scan all documents and queue reminders for those expiring within 30 days.
   * Called by cron daily.
   */
  private async handleCheckUpcomingExpiries(): Promise<void> {
    this.logger.log('Checking for upcoming document expiries...');

    // TODO: Query documents expiring in 30, 15, and 7 days
    // 1. Find documents with expiry_date within thresholds
    // 2. Check if reminder was already sent for this threshold
    // 3. Queue individual document-expiry jobs
    // Thresholds: 30 days, 15 days, 7 days
  }

  /**
   * Notify riders about campaigns ending soon.
   */
  private async handleCampaignEnding(data: {
    campaignId: string;
    riderId: string;
    daysRemaining: number;
  }): Promise<void> {
    this.logger.log(
      `Campaign ending reminder: campaign=${data.campaignId}, rider=${data.riderId}, days=${data.daysRemaining}`,
    );

    // TODO: Notify rider about upcoming campaign end
  }
}
