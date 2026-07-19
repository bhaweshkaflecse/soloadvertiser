/**
 * Event emitted when a partner enrollment is verified/approved.
 */
export class PartnerVerifiedEvent {
  static readonly EVENT_NAME = 'partner.verified';

  constructor(
    public readonly enrollmentId: string,
    public readonly userId: string,
    public readonly channelId: string,
    public readonly verifiedBy: string,
  ) {}
}
