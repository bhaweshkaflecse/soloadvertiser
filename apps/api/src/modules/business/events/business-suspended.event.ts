/**
 * Emitted when a business is suspended by admin.
 */
export class BusinessSuspendedEvent {
  static readonly EVENT_NAME = 'business.suspended';

  constructor(
    public readonly businessId: string,
    public readonly suspendedBy: string,
    public readonly reason: string,
    public readonly previousStatus: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
