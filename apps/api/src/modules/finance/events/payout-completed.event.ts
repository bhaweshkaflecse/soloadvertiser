/**
 * Event emitted when a payout item is completed (rider paid).
 * Triggers: Wallet debit, ledger entry (debit Rider Liability, credit Rider Payout).
 */
export class PayoutCompletedEvent {
  static readonly EVENT_NAME = 'finance.payout.completed';

  constructor(
    public readonly payoutItemId: string,
    public readonly batchId: string,
    public readonly riderId: string,
    public readonly amount: number,
    public readonly method: string,
  ) {}
}
