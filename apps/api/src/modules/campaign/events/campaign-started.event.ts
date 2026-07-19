/**
 * Emitted when a campaign transitions to RUNNING (start_date reached).
 */
export class CampaignStartedEvent {
  static readonly EVENT_NAME = 'campaign.started';

  constructor(
    public readonly campaignId: string,
    public readonly businessId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
