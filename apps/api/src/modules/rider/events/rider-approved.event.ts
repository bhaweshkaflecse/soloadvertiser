/**
 * Emitted when a rider is approved by admin (VERIFICATION_PENDING → APPROVED).
 */
export class RiderApprovedEvent {
  static readonly EVENT_NAME = 'rider.approved';

  constructor(
    public readonly riderId: string,
    public readonly approvedBy: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
