/**
 * Event emitted when an escrow is created for a campaign.
 * Triggers: Ledger entry (debit Accounts Receivable, credit Campaign Escrow).
 */
export class EscrowCreatedEvent {
  static readonly EVENT_NAME = 'finance.escrow.created';

  constructor(
    public readonly escrowId: string,
    public readonly campaignId: string,
    public readonly totalAmount: number,
    public readonly totalDays: number,
    public readonly dailyRelease: number,
  ) {}
}
