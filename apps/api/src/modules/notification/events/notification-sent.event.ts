/**
 * Event emitted when a notification is successfully sent to a user.
 */
export class NotificationSentEvent {
  static readonly eventName = 'notification.sent';

  constructor(
    public readonly notificationId: string,
    public readonly userId: string,
    public readonly channel: string,
    public readonly category: string,
    public readonly title: string,
    public readonly createdAt: Date,
  ) {}
}
