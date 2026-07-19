/**
 * Emitted when a business is permanently blacklisted by Super Admin.
 */
export class BusinessBlacklistedEvent {
  static readonly EVENT_NAME = 'business.blacklisted';

  constructor(
    public readonly businessId: string,
    public readonly blacklistedBy: string,
    public readonly reason: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
