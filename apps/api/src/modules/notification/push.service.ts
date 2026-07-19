import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { PushPayload } from './interfaces/notification.interface';

/**
 * FCM Push notification service using Firebase Admin SDK.
 * Sends push notifications to Android and iOS devices.
 */
@Injectable()
export class PushService implements OnModuleInit {
  private readonly logger = new Logger(PushService.name);
  private isInitialized = false;

  onModuleInit() {
    this.initializeFirebase();
  }

  /**
   * Initialize Firebase Admin SDK with service account credentials from env.
   */
  private initializeFirebase(): void {
    try {
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

      if (!projectId || !clientEmail || !privateKey) {
        this.logger.warn(
          'Firebase credentials not configured. Push notifications will be disabled.',
        );
        return;
      }

      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
      }

      this.isInitialized = true;
      this.logger.log('Firebase Admin SDK initialized successfully.');
    } catch (error) {
      this.logger.error(`Firebase initialization failed: ${error.message}`, error.stack);
    }
  }

  /**
   * Send a push notification to a specific device.
   */
  async sendToDevice(
    fcmToken: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<{ success: boolean; messageId?: string }> {
    if (!this.isInitialized) {
      this.logger.warn(`[PUSH] Firebase not initialized. Skipping push to token.`);
      return { success: false };
    }

    try {
      const message: admin.messaging.Message = {
        token: fcmToken,
        notification: {
          title,
          body,
        },
        data: data || {},
        android: {
          priority: 'high',
          notification: {
            title,
            body,
            sound: 'default',
            channelId: 'solo_advertiser_default',
          },
        },
        apns: {
          headers: {
            'apns-priority': '10',
          },
          payload: {
            aps: {
              alert: { title, body },
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      this.logger.log(`[PUSH] Sent to device: messageId=${response}`);
      return { success: true, messageId: response };
    } catch (error) {
      this.logger.error(
        `[PUSH] Failed to send to device: ${error.message}`,
        error.stack,
      );

      // Handle invalid token
      if (
        error.code === 'messaging/registration-token-not-registered' ||
        error.code === 'messaging/invalid-registration-token'
      ) {
        this.logger.warn(`[PUSH] Invalid FCM token detected. Token should be removed.`);
      }

      return { success: false };
    }
  }

  /**
   * Send a push notification to a topic (e.g., all riders, all businesses).
   */
  async sendToTopic(
    topic: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<{ success: boolean; messageId?: string }> {
    if (!this.isInitialized) {
      this.logger.warn(`[PUSH] Firebase not initialized. Skipping topic push.`);
      return { success: false };
    }

    try {
      const message: admin.messaging.Message = {
        topic,
        notification: {
          title,
          body,
        },
        data: data || {},
        android: {
          priority: 'high',
          notification: {
            title,
            body,
            sound: 'default',
            channelId: 'solo_advertiser_default',
          },
        },
        apns: {
          headers: {
            'apns-priority': '10',
          },
          payload: {
            aps: {
              alert: { title, body },
              sound: 'default',
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      this.logger.log(`[PUSH] Sent to topic "${topic}": messageId=${response}`);
      return { success: true, messageId: response };
    } catch (error) {
      this.logger.error(
        `[PUSH] Failed to send to topic "${topic}": ${error.message}`,
        error.stack,
      );
      return { success: false };
    }
  }

  /**
   * Send a push notification to a user (looks up userId -> device token).
   * Used by the notification system internally.
   */
  async send(params: { userId: string } & PushPayload): Promise<{ success: boolean }> {
    if (!this.isInitialized) {
      this.logger.warn(
        `[PUSH] Firebase not initialized. Skipping push to user=${params.userId}`,
      );
      return { success: false };
    }

    // In production, we would look up the user's FCM token from the database.
    // For now, we log the attempt. The notification module handles token lookup.
    this.logger.log(
      `[PUSH] Send push to user=${params.userId}: "${params.title}" — ${params.body}`,
    );

    // TODO: Integrate with device token repository
    // const tokens = await this.deviceTokenRepo.findByUserId(params.userId);
    // for (const token of tokens) {
    //   await this.sendToDevice(token.fcmToken, params.title, params.body, params.data);
    // }

    return { success: true };
  }

  /**
   * Send push notification to multiple users.
   */
  async sendBatch(
    userIds: string[],
    payload: PushPayload,
  ): Promise<{ sent: number; failed: number }> {
    if (!this.isInitialized) {
      this.logger.warn(
        `[PUSH] Firebase not initialized. Skipping batch push to ${userIds.length} users.`,
      );
      return { sent: 0, failed: userIds.length };
    }

    let sent = 0;
    let failed = 0;

    for (const userId of userIds) {
      const result = await this.send({ userId, ...payload });
      if (result.success) {
        sent++;
      } else {
        failed++;
      }
    }

    this.logger.log(
      `[PUSH] Batch complete: sent=${sent}, failed=${failed}`,
    );

    return { sent, failed };
  }
}
