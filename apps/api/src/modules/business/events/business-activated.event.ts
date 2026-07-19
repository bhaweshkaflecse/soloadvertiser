/**
 * Emitted when a business is activated (VERIFIED → ACTIVE on first campaign).
 */
export class BusinessActivatedEvent {
  static readonly EVENT_NAME = 'business.activated';

  constructor(
    public readonly businessId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
