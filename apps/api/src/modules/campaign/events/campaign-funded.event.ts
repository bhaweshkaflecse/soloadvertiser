/**
 * Emitted when a campaign payment is verified (PAYMENT_VERIFIED → RECRUITING_RIDERS).
 */
export class CampaignFundedEvent {
  static readonly EVENT_NAME = 'campaign.funded';

  constructor(
    public readonly campaignId: string,
    public readonly businessId: string,
    public readonly amount: number,
    public readonly timestamp: Date = new Date(),
  ) {}
}
