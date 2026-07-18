/**
 * Emitted when a campaign is cancelled.
 */
export class CampaignCancelledEvent {
  static readonly EVENT_NAME = 'campaign.cancelled';

  constructor(
    public readonly campaignId: string,
    public readonly businessId: string,
    public readonly reason: string,
    public readonly cancelledBy: string | null,
    public readonly timestamp: Date = new Date(),
  ) {}
}
