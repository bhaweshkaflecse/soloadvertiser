/**
 * Emitted when a rider is suspended by admin.
 */
export class RiderSuspendedEvent {
  static readonly EVENT_NAME = 'rider.suspended';

  constructor(
    public readonly riderId: string,
    public readonly suspendedBy: string,
    public readonly reason: string,
    public readonly previousStatus: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
