/**
 * Emitted when a new business profile is created (REGISTERED).
 */
export class BusinessRegisteredEvent {
  static readonly EVENT_NAME = 'business.registered';

  constructor(
    public readonly businessId: string,
    public readonly userId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
