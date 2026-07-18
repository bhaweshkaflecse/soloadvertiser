/**
 * Event emitted when a channel's combined readiness reaches a threshold for recommendation.
 */
export class ReadinessThresholdReachedEvent {
  static readonly EVENT_NAME = 'marketplace.readiness.threshold-reached';

  constructor(
    public readonly channelId: string,
    public readonly channelCode: string,
    public readonly readinessPct: number,
  ) {}
}
