/**
 * Event emitted when a channel is activated (CMM_005_LIVE).
 */
export class ChannelActivatedEvent {
  static readonly EVENT_NAME = 'marketplace.channel.activated';

  constructor(
    public readonly channelId: string,
    public readonly channelCode: string,
    public readonly activatedBy: string,
  ) {}
}
