/**
 * Emitted when a new rider profile is created (PRE_REGISTERED).
 */
export class RiderRegisteredEvent {
  static readonly EVENT_NAME = 'rider.registered';

  constructor(
    public readonly riderId: string,
    public readonly userId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
