/**
 * Emitted when a new campaign is created (DRAFT).
 */
export class CampaignCreatedEvent {
  static readonly EVENT_NAME = 'campaign.created';

  constructor(
    public readonly campaignId: string,
    public readonly businessId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
