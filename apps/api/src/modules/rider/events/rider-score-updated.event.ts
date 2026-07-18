/**
 * Emitted when a rider's reliability score is recalculated.
 */
export class RiderScoreUpdatedEvent {
  static readonly EVENT_NAME = 'rider.score.updated';

  constructor(
    public readonly riderId: string,
    public readonly previousScore: number,
    public readonly newScore: number,
    public readonly timestamp: Date = new Date(),
  ) {}
}
