/**
 * Event emitted when a rider wallet is credited (daily earnings).
 * Triggers: Ledger entry (debit Campaign Escrow, credit Rider Liability).
 */
export class WalletCreditedEvent {
  static readonly EVENT_NAME = 'finance.wallet.credited';

  constructor(
    public readonly walletId: string,
    public readonly riderId: string,
    public readonly amount: number,
    public readonly referenceType: string,
    public readonly referenceId: string,
  ) {}
}
