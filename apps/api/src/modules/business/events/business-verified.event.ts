/**
 * Emitted when a business is verified by admin (UNDER_REVIEW → VERIFIED).
 */
export class BusinessVerifiedEvent {
  static readonly EVENT_NAME = 'business.verified';

  constructor(
    public readonly businessId: string,
    public readonly verifiedBy: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
