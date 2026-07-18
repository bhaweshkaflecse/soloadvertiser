/**
 * Event emitted when a business submits a pre-order.
 */
export class PreOrderSubmittedEvent {
  static readonly EVENT_NAME = 'marketplace.pre-order.submitted';

  constructor(
    public readonly preOrderId: string,
    public readonly channelId: string,
    public readonly businessId: string,
    public readonly estimatedBudget: number,
  ) {}
}
