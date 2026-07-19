import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TimelineService } from './timeline.service';
import { TimelineEntityType } from './interfaces/timeline.interface';

/**
 * Listens to ALL domain events and creates corresponding timeline entries.
 * Each event may produce multiple timeline entries (e.g., assignment affects both rider and campaign).
 */
@Injectable()
export class TimelineListenerService {
  private readonly logger = new Logger(TimelineListenerService.name);

  constructor(private readonly timelineService: TimelineService) {}

  /**
   * Campaign created.
   */
  @OnEvent('campaign.created')
  async handleCampaignCreated(payload: {
    campaignId: string;
    businessId: string;
    actorId?: string;
    actorRole?: string;
  }) {
    this.logger.log(`Timeline: campaign.created for campaign=${payload.campaignId}`);
    await this.timelineService.createEntry({
      entityType: TimelineEntityType.CAMPAIGN,
      entityId: payload.campaignId,
      eventType: 'campaign.created',
      title: 'Campaign created',
      actorId: payload.actorId,
      actorRole: payload.actorRole,
    });
  }

  /**
   * Campaign funded (payment verified, escrow created).
   */
  @OnEvent('campaign.funded')
  async handleCampaignFunded(payload: {
    campaignId: string;
    actorId?: string;
    actorRole?: string;
  }) {
    this.logger.log(`Timeline: campaign.funded for campaign=${payload.campaignId}`);
    await this.timelineService.createEntry({
      entityType: TimelineEntityType.CAMPAIGN,
      entityId: payload.campaignId,
      eventType: 'campaign.funded',
      title: 'Payment verified, escrow created',
      actorId: payload.actorId,
      actorRole: payload.actorRole,
    });
  }

  /**
   * Campaign started.
   */
  @OnEvent('campaign.started')
  async handleCampaignStarted(payload: {
    campaignId: string;
    actorId?: string;
    actorRole?: string;
  }) {
    this.logger.log(`Timeline: campaign.started for campaign=${payload.campaignId}`);
    await this.timelineService.createEntry({
      entityType: TimelineEntityType.CAMPAIGN,
      entityId: payload.campaignId,
      eventType: 'campaign.started',
      title: 'Campaign started',
      actorId: payload.actorId,
      actorRole: payload.actorRole,
    });
  }

  /**
   * Assignment created — creates entries for both campaign and rider.
   */
  @OnEvent('assignment.created')
  async handleAssignmentCreated(payload: {
    assignmentId: string;
    campaignId: string;
    riderId: string;
    actorId?: string;
    actorRole?: string;
  }) {
    this.logger.log(`Timeline: assignment.created for assignment=${payload.assignmentId}`);
    await this.timelineService.createEntries([
      {
        entityType: TimelineEntityType.CAMPAIGN,
        entityId: payload.campaignId,
        eventType: 'assignment.created',
        title: 'Rider assigned to campaign',
        actorId: payload.actorId,
        actorRole: payload.actorRole,
        metadata: { riderId: payload.riderId, assignmentId: payload.assignmentId },
      },
      {
        entityType: TimelineEntityType.RIDER,
        entityId: payload.riderId,
        eventType: 'assignment.created',
        title: 'Rider assigned to campaign',
        actorId: payload.actorId,
        actorRole: payload.actorRole,
        metadata: { campaignId: payload.campaignId, assignmentId: payload.assignmentId },
      },
    ]);
  }

  /**
   * Assignment removed — creates entries for both campaign and rider.
   */
  @OnEvent('assignment.removed')
  async handleAssignmentRemoved(payload: {
    assignmentId: string;
    campaignId: string;
    riderId: string;
    reason?: string;
    actorId?: string;
    actorRole?: string;
  }) {
    this.logger.log(`Timeline: assignment.removed for assignment=${payload.assignmentId}`);
    await this.timelineService.createEntries([
      {
        entityType: TimelineEntityType.CAMPAIGN,
        entityId: payload.campaignId,
        eventType: 'assignment.removed',
        title: 'Rider removed from campaign',
        description: payload.reason,
        actorId: payload.actorId,
        actorRole: payload.actorRole,
        metadata: { riderId: payload.riderId },
      },
      {
        entityType: TimelineEntityType.RIDER,
        entityId: payload.riderId,
        eventType: 'assignment.removed',
        title: 'Rider removed from campaign',
        description: payload.reason,
        actorId: payload.actorId,
        actorRole: payload.actorRole,
        metadata: { campaignId: payload.campaignId },
      },
    ]);
  }

  /**
   * Verification approved.
   */
  @OnEvent('verification.approved')
  async handleVerificationApproved(payload: {
    riderId: string;
    actorId?: string;
    actorRole?: string;
  }) {
    this.logger.log(`Timeline: verification.approved for rider=${payload.riderId}`);
    await this.timelineService.createEntry({
      entityType: TimelineEntityType.RIDER,
      entityId: payload.riderId,
      eventType: 'verification.approved',
      title: 'Verification passed',
      actorId: payload.actorId,
      actorRole: payload.actorRole,
    });
  }

  /**
   * Payout completed.
   */
  @OnEvent('payout.completed')
  async handlePayoutCompleted(payload: {
    riderId: string;
    amount: number;
    actorId?: string;
    actorRole?: string;
  }) {
    this.logger.log(`Timeline: payout.completed for rider=${payload.riderId}`);
    await this.timelineService.createEntry({
      entityType: TimelineEntityType.RIDER,
      entityId: payload.riderId,
      eventType: 'payout.completed',
      title: `Payout of NPR ${payload.amount} processed`,
      actorId: payload.actorId,
      actorRole: payload.actorRole,
      metadata: { amount: payload.amount },
    });
  }

  /**
   * Business verified by admin.
   */
  @OnEvent('business.verified')
  async handleBusinessVerified(payload: {
    businessId: string;
    actorId?: string;
    actorRole?: string;
  }) {
    this.logger.log(`Timeline: business.verified for business=${payload.businessId}`);
    await this.timelineService.createEntry({
      entityType: TimelineEntityType.BUSINESS,
      entityId: payload.businessId,
      eventType: 'business.verified',
      title: 'Business verified by admin',
      actorId: payload.actorId,
      actorRole: payload.actorRole,
    });
  }

  /**
   * Rider approved.
   */
  @OnEvent('rider.approved')
  async handleRiderApproved(payload: {
    riderId: string;
    actorId?: string;
    actorRole?: string;
  }) {
    this.logger.log(`Timeline: rider.approved for rider=${payload.riderId}`);
    await this.timelineService.createEntry({
      entityType: TimelineEntityType.RIDER,
      entityId: payload.riderId,
      eventType: 'rider.approved',
      title: 'Rider approved',
      actorId: payload.actorId,
      actorRole: payload.actorRole,
    });
  }

  /**
   * Escrow released (daily release).
   */
  @OnEvent('escrow.released')
  async handleEscrowReleased(payload: {
    campaignId: string;
    dayNumber: number;
    amount: number;
    actorId?: string;
  }) {
    this.logger.log(`Timeline: escrow.released for campaign=${payload.campaignId}`);
    await this.timelineService.createEntry({
      entityType: TimelineEntityType.CAMPAIGN,
      entityId: payload.campaignId,
      eventType: 'escrow.released',
      title: `Daily escrow released (Day ${payload.dayNumber})`,
      metadata: { dayNumber: payload.dayNumber, amount: payload.amount },
      actorId: payload.actorId,
    });
  }

  /**
   * Campaign completed.
   */
  @OnEvent('campaign.completed')
  async handleCampaignCompleted(payload: {
    campaignId: string;
    actorId?: string;
    actorRole?: string;
  }) {
    this.logger.log(`Timeline: campaign.completed for campaign=${payload.campaignId}`);
    await this.timelineService.createEntry({
      entityType: TimelineEntityType.CAMPAIGN,
      entityId: payload.campaignId,
      eventType: 'campaign.completed',
      title: 'Campaign completed',
      actorId: payload.actorId,
      actorRole: payload.actorRole,
    });
  }
}
