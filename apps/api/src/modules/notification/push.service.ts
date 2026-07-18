import { Injectable, Logger } from '@nestjs/common';
import { PushPayload } from './interfaces/notification.interface';

/**
 * Push notification service — placeholder for FCM integration.
 * In MVP, this logs the push and does not actually send via FCM.
 */
@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);

  /**
   * Send a push notification to a user.
   * MVP: Logs the payload and resolves. Actual FCM integration TBD.
   */
  async send(params: { userId: string } & PushPayload): Promise<{ success: boolean }> {
    this.logger.log(
      `[PUSH PLACEHOLDER] Sending push to user=${params.userId}: "${params.title}" — ${params.body}`,
    );

    // TODO: Implement actual FCM push notification
    // 1. Look up device token for userId
    // 2. Call Firebase Admin SDK to send push
    // 3. Handle token invalidation / retry

    return { success: true };
  }

  /**
   * Send push notification to multiple users.
   * MVP: Logs and resolves.
   */
  async sendBatch(
    userIds: string[],
    payload: PushPayload,
  ): Promise<{ sent: number; failed: number }> {
    this.logger.log(
      `[PUSH PLACEHOLDER] Batch push to ${userIds.length} users: "${payload.title}"`,
    );

    // TODO: Implement batch FCM push
    return { sent: userIds.length, failed: 0 };
  }
}
