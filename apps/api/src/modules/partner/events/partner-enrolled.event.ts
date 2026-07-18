/**
 * Event emitted when a partner submits enrollment.
 */
export class PartnerEnrolledEvent {
  static readonly EVENT_NAME = 'partner.enrolled';

  constructor(
    public readonly enrollmentId: string,
    public readonly userId: string,
    public readonly channelId: string,
    public readonly partnerCategoryCode: string,
  ) {}
}
