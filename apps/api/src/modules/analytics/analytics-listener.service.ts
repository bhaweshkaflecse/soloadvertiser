import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AnalyticsService } from './analytics.service';

/**
 * Listens to all domain events and records them as analytics events for later analysis.
 * This is the raw event ingestion layer for analytics.
 */
@Injectable()
export class AnalyticsListenerService {
  private readonly logger = new Logger(AnalyticsListenerService.name);

  constructor(private readonly analyticsService: AnalyticsService) {}

  // === Rider Events ===

  @OnEvent('rider.approved')
  async handleRiderApproved(payload: Record<string, unknown>) {
    await this.recordEvent('rider.approved', 'rider', payload.riderId as string, payload);
  }

  @OnEvent('rider.suspended')
  async handleRiderSuspended(payload: Record<string, unknown>) {
    await this.recordEvent('rider.suspended', 'rider', payload.riderId as string, payload);
  }

  // === Business Events ===

  @OnEvent('business.verified')
  async handleBusinessVerified(payload: Record<string, unknown>) {
    await this.recordEvent('business.verified', 'business', payload.businessId as string, payload);
  }

  // === Campaign Events ===

  @OnEvent('campaign.created')
  async handleCampaignCreated(payload: Record<string, unknown>) {
    await this.recordEvent('campaign.created', 'campaign', payload.campaignId as string, payload);
  }

  @OnEvent('campaign.funded')
  async handleCampaignFunded(payload: Record<string, unknown>) {
    await this.recordEvent('campaign.funded', 'campaign', payload.campaignId as string, payload);
  }

  @OnEvent('campaign.started')
  async handleCampaignStarted(payload: Record<string, unknown>) {
    await this.recordEvent('campaign.started', 'campaign', payload.campaignId as string, payload);
  }

  @OnEvent('campaign.completed')
  async handleCampaignCompleted(payload: Record<string, unknown>) {
    await this.recordEvent('campaign.completed', 'campaign', payload.campaignId as string, payload);
  }

  // === Assignment Events ===

  @OnEvent('assignment.created')
  async handleAssignmentCreated(payload: Record<string, unknown>) {
    await this.recordEvent('assignment.created', 'assignment', payload.assignmentId as string, payload);
  }

  @OnEvent('assignment.removed')
  async handleAssignmentRemoved(payload: Record<string, unknown>) {
    await this.recordEvent('assignment.removed', 'assignment', payload.assignmentId as string, payload);
  }

  // === Financial Events ===

  @OnEvent('payout.completed')
  async handlePayoutCompleted(payload: Record<string, unknown>) {
    await this.recordEvent('payout.completed', 'rider', payload.riderId as string, payload);
  }

  @OnEvent('escrow.released')
  async handleEscrowReleased(payload: Record<string, unknown>) {
    await this.recordEvent('escrow.released', 'campaign', payload.campaignId as string, payload);
  }

  // === Verification Events ===

  @OnEvent('verification.approved')
  async handleVerificationApproved(payload: Record<string, unknown>) {
    await this.recordEvent('verification.approved', 'rider', payload.riderId as string, payload);
  }

  /**
   * Helper to record an analytics event.
   */
  private async recordEvent(
    eventType: string,
    entityType: string,
    entityId: string | undefined,
    payload: Record<string, unknown>,
  ) {
    try {
      await this.analyticsService.recordEvent({
        eventType,
        entityType,
        entityId,
        actorId: payload.actorId as string | undefined,
        properties: payload,
      });
    } catch (error) {
      this.logger.error(`Failed to record analytics event: ${eventType}`, error);
    }
  }
}
