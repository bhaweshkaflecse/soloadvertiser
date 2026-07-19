import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationService } from './notification.service';
import { NotificationCategory } from './interfaces/notification.interface';

/**
 * Listens to ALL domain events and triggers notifications based on event-to-notification mapping.
 * This is the central event consumer for the notification module.
 */
@Injectable()
export class NotificationListenerService {
  private readonly logger = new Logger(NotificationListenerService.name);

  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Rider approved — notify rider that documents have been approved.
   */
  @OnEvent('rider.approved')
  async handleRiderApproved(payload: { riderId: string; userId: string }) {
    this.logger.log(`Notification: rider.approved for rider=${payload.riderId}`);
    await this.notificationService.send({
      userId: payload.userId,
      category: NotificationCategory.DOCUMENT,
      templateCode: 'rider_approved',
      variables: {},
      deepLink: '/rider/profile',
    });
  }

  /**
   * Rider suspended — notify rider of account suspension.
   */
  @OnEvent('rider.suspended')
  async handleRiderSuspended(payload: { riderId: string; userId: string; reason?: string }) {
    this.logger.log(`Notification: rider.suspended for rider=${payload.riderId}`);
    await this.notificationService.send({
      userId: payload.userId,
      category: NotificationCategory.SYSTEM,
      templateCode: 'rider_suspended',
      variables: { reason: payload.reason || 'Policy violation' },
      deepLink: '/rider/profile',
    });
  }

  /**
   * Assignment created — notify rider of new campaign assignment.
   */
  @OnEvent('assignment.created')
  async handleAssignmentCreated(payload: {
    assignmentId: string;
    riderId: string;
    riderUserId: string;
    campaignId: string;
    campaignName: string;
  }) {
    this.logger.log(`Notification: assignment.created for rider=${payload.riderId}`);
    await this.notificationService.send({
      userId: payload.riderUserId,
      category: NotificationCategory.ASSIGNMENT,
      templateCode: 'assignment_created',
      variables: { campaignName: payload.campaignName },
      deepLink: `/rider/assignments/${payload.assignmentId}`,
    });
  }

  /**
   * Verification due (scheduled/cron) — notify rider of upcoming verification.
   */
  @OnEvent('verification.due')
  async handleVerificationDue(payload: { userId: string; riderId: string; daysRemaining: number }) {
    this.logger.log(`Notification: verification.due for rider=${payload.riderId}`);
    await this.notificationService.send({
      userId: payload.userId,
      category: NotificationCategory.VERIFICATION,
      templateCode: 'verification_due',
      variables: { daysRemaining: payload.daysRemaining },
      deepLink: '/rider/verification',
    });
  }

  /**
   * Payout completed — notify rider of payment.
   */
  @OnEvent('payout.completed')
  async handlePayoutCompleted(payload: { userId: string; riderId: string; amount: number }) {
    this.logger.log(`Notification: payout.completed for rider=${payload.riderId}`);
    await this.notificationService.send({
      userId: payload.userId,
      category: NotificationCategory.PAYOUT,
      templateCode: 'payout_completed',
      variables: { amount: payload.amount },
      deepLink: '/rider/wallet',
    });
  }

  /**
   * Campaign funded — notify business that payment is verified and recruitment starting.
   */
  @OnEvent('campaign.funded')
  async handleCampaignFunded(payload: { campaignId: string; businessUserId: string; campaignName: string }) {
    this.logger.log(`Notification: campaign.funded for campaign=${payload.campaignId}`);
    await this.notificationService.send({
      userId: payload.businessUserId,
      category: NotificationCategory.CAMPAIGN,
      templateCode: 'campaign_funded',
      variables: { campaignName: payload.campaignName },
      deepLink: `/business/campaigns/${payload.campaignId}`,
    });
  }

  /**
   * Campaign started — notify business and riders.
   */
  @OnEvent('campaign.started')
  async handleCampaignStarted(payload: {
    campaignId: string;
    campaignName: string;
    businessUserId: string;
    riderUserIds: string[];
  }) {
    this.logger.log(`Notification: campaign.started for campaign=${payload.campaignId}`);

    // Notify business
    await this.notificationService.send({
      userId: payload.businessUserId,
      category: NotificationCategory.CAMPAIGN,
      templateCode: 'campaign_started',
      variables: { campaignName: payload.campaignName },
      deepLink: `/business/campaigns/${payload.campaignId}`,
    });

    // Notify all assigned riders
    for (const riderUserId of payload.riderUserIds) {
      await this.notificationService.send({
        userId: riderUserId,
        category: NotificationCategory.CAMPAIGN,
        templateCode: 'campaign_started_rider',
        variables: { campaignName: payload.campaignName },
        deepLink: `/rider/campaigns/${payload.campaignId}`,
      });
    }
  }

  /**
   * Campaign completed — notify business and riders.
   */
  @OnEvent('campaign.completed')
  async handleCampaignCompleted(payload: {
    campaignId: string;
    campaignName: string;
    businessUserId: string;
    riderUserIds: string[];
  }) {
    this.logger.log(`Notification: campaign.completed for campaign=${payload.campaignId}`);

    // Notify business
    await this.notificationService.send({
      userId: payload.businessUserId,
      category: NotificationCategory.CAMPAIGN,
      templateCode: 'campaign_completed',
      variables: { campaignName: payload.campaignName },
      deepLink: `/business/campaigns/${payload.campaignId}`,
    });

    // Notify all assigned riders
    for (const riderUserId of payload.riderUserIds) {
      await this.notificationService.send({
        userId: riderUserId,
        category: NotificationCategory.CAMPAIGN,
        templateCode: 'campaign_completed_rider',
        variables: { campaignName: payload.campaignName },
        deepLink: `/rider/campaigns/${payload.campaignId}`,
      });
    }
  }

  /**
   * Business verified — notify business of verification.
   */
  @OnEvent('business.verified')
  async handleBusinessVerified(payload: { businessId: string; userId: string }) {
    this.logger.log(`Notification: business.verified for business=${payload.businessId}`);
    await this.notificationService.send({
      userId: payload.userId,
      category: NotificationCategory.DOCUMENT,
      templateCode: 'business_verified',
      variables: {},
      deepLink: '/business/profile',
    });
  }
}
