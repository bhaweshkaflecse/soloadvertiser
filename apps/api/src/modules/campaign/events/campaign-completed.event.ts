/**
 * Emitted when a campaign transitions to COMPLETED (end_date reached).
 */
export class CampaignCompletedEvent {
  static readonly EVENT_NAME = 'campaign.completed';

  constructor(
    public readonly campaignId: string,
    public readonly businessId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
