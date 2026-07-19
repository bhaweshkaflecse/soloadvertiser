/**
 * Event emitted when a daily escrow release occurs.
 * Triggers: Commission credited to platform, rider share credited to wallets.
 */
export class EscrowReleasedEvent {
  static readonly EVENT_NAME = 'finance.escrow.released';

  constructor(
    public readonly escrowId: string,
    public readonly campaignId: string,
    public readonly dayNumber: number,
    public readonly totalAmount: number,
    public readonly commission: number,
    public readonly riderShare: number,
  ) {}
}
